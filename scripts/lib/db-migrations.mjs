import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { Client } from "pg";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const drizzleDir = resolve(projectRoot, "drizzle");

function getConnectionConfig() {
    return {
        connectionString:
            process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/db_connect",
        ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    };
}

export function sleep(ms) {
    return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

export function getMigrationFiles() {
    return readdirSync(drizzleDir)
        .filter((fileName) => fileName.endsWith(".sql"))
        .sort()
        .map((fileName) => {
            const sql = readFileSync(resolve(drizzleDir, fileName), "utf8");
            const tag = fileName.replace(/\.sql$/, "");
            const millis = Number.parseInt(tag.split("_")[0], 10);

            if (Number.isNaN(millis)) {
                throw new Error(`Migration filename must start with a numeric prefix: ${fileName}`);
            }

            return {
                fileName,
                sql,
                hash: createHash("sha256").update(sql).digest("hex"),
                millis,
            };
        });
}

export async function waitForDatabaseConnection(options = {}) {
    const { attempts = 60, delayMs = 1000, logPrefix = "[db]" } = options;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        const client = new Client(getConnectionConfig());

        try {
            await client.connect();
            await client.end();
            return;
        } catch (error) {
            await client.end().catch(() => undefined);

            if (attempt === attempts) {
                throw error;
            }

            console.info(`${logPrefix} waiting for database (${attempt}/${attempts})...`);
            await sleep(delayMs);
        }
    }
}

export async function applyCheckedInMigrations() {
    const client = new Client(getConnectionConfig());

    await client.connect();

    try {
        await client.query('create schema if not exists "drizzle"');
        await client.query(`
            create table if not exists "drizzle"."__drizzle_migrations" (
                id serial primary key,
                hash text not null,
                created_at numeric
            )
        `);

        const applied = await client.query(
            'select hash, created_at from "drizzle"."__drizzle_migrations"',
        );
        const appliedHashes = new Set(applied.rows.map((row) => row.hash));
        const publicTables = await client.query(`
            select table_name
            from information_schema.tables
            where table_schema = 'public' and table_type = 'BASE TABLE'
            order by table_name
        `);
        const hasExistingSchema = publicTables.rowCount > 0;

        if (appliedHashes.size === 0 && hasExistingSchema) {
            for (const migration of getMigrationFiles()) {
                await client.query(
                    'insert into "drizzle"."__drizzle_migrations" (hash, created_at) values ($1, $2)',
                    [migration.hash, migration.millis],
                );
            }

            console.info("Detected existing schema without Drizzle journal; baselined checked-in migrations.");
            return;
        }

        for (const migration of getMigrationFiles()) {
            if (appliedHashes.has(migration.hash)) {
                continue;
            }

            console.info(`[db] applying migration ${migration.fileName}`);
            await client.query("begin");

            try {
                await client.query(migration.sql);
                await client.query(
                    'insert into "drizzle"."__drizzle_migrations" (hash, created_at) values ($1, $2)',
                    [migration.hash, migration.millis],
                );
                await client.query("commit");
            } catch (error) {
                await client.query("rollback");
                throw error;
            }
        }
    } finally {
        await client.end();
    }
}

export async function databaseNeedsSeed() {
    const client = new Client(getConnectionConfig());

    await client.connect();

    try {
        const [userCount, profileCount, licenseCount] = await Promise.all([
            client.query('select count(*)::int as count from "user"'),
            client.query('select count(*)::int as count from "profiles"'),
            client.query('select count(*)::int as count from "licenses"'),
        ]);

        const totals = [userCount, profileCount, licenseCount].map((result) =>
            Number(result.rows[0]?.count ?? 0),
        );

        return totals.every((count) => count === 0);
    } finally {
        await client.end();
    }
}
