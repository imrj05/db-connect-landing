import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { Client } from "pg";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const drizzleDir = resolve(projectRoot, "drizzle");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const databaseUrl =
    process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/db_connect";

function sleep(ms) {
    return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

function run(command, args, options = {}) {
    const result = spawnSync(command, args, {
        cwd: projectRoot,
        encoding: "utf8",
        stdio: options.capture ? "pipe" : "inherit",
        env: {
            ...process.env,
            ...options.env,
        },
    });

    if (result.status !== 0) {
        if (options.capture) {
            process.stderr.write(result.stderr ?? "");
            process.stdout.write(result.stdout ?? "");
        }

        throw new Error(`Command failed: ${command} ${args.join(" ")}`);
    }

    return result;
}

async function waitForDatabase() {
    for (let attempt = 1; attempt <= 60; attempt += 1) {
        const result = spawnSync(
            "docker",
            ["compose", "exec", "-T", "db", "pg_isready", "-U", "postgres", "-d", "db_connect"],
            {
                cwd: projectRoot,
                encoding: "utf8",
                stdio: "pipe",
            },
        );

        if (result.status === 0) {
            return;
        }

        await sleep(1000);
    }

    throw new Error("Postgres did not become ready in time.");
}

function getMigrationFiles() {
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

async function applyMigrations() {
    const client = new Client({
        connectionString: databaseUrl,
        ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    });

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

console.info("Starting Postgres container...");
run("docker", ["compose", "up", "-d", "db"]);

console.info("Waiting for Postgres to accept connections...");
await waitForDatabase();

console.info("Applying database migrations...");
await applyMigrations();

console.info("Seeding demo data...");
run(npmCommand, ["run", "db:seed"], {
    env: {
        DATABASE_URL: databaseUrl,
    },
});

console.info("Database setup complete.");
console.info("Demo login: demo@dbconnect.local / demo12345");
