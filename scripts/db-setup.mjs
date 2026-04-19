import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { applyCheckedInMigrations, sleep } from "./lib/db-migrations.mjs";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const databaseUrl =
    process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/db_connect";

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


console.info("Starting Postgres container...");
run("docker", ["compose", "up", "-d", "db"]);

console.info("Waiting for Postgres to accept connections...");
await waitForDatabase();

console.info("Applying database migrations...");
await applyCheckedInMigrations();

console.info("Seeding demo data...");
run(npmCommand, ["run", "db:seed"], {
    env: {
        DATABASE_URL: databaseUrl,
    },
});

console.info("Database setup complete.");
console.info("Demo login: demo@dbconnect.local / demo12345");
