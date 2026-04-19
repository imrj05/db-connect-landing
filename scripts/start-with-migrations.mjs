import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
    applyCheckedInMigrations,
    databaseNeedsSeed,
    waitForDatabaseConnection,
} from "./lib/db-migrations.mjs";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const nextCliPath = resolve(projectRoot, "node_modules/next/dist/bin/next");
const seedScriptPath = resolve(projectRoot, "scripts/db-seed.mjs");

function shouldAutoMigrate() {
    const value = process.env.AUTO_DB_MIGRATE;

    if (value === undefined) {
        return true;
    }

    return value !== "false" && value !== "0";
}

function shouldAutoSeed() {
    const value = process.env.AUTO_DB_SEED;

    if (value === undefined) {
        return true;
    }

    return value !== "false" && value !== "0";
}

function runNodeScript(scriptPath) {
    return new Promise((resolvePromise, rejectPromise) => {
        const child = spawn(process.execPath, [scriptPath], {
            cwd: projectRoot,
            env: process.env,
            stdio: "inherit",
        });

        child.on("error", rejectPromise);
        child.on("exit", (code, signal) => {
            if (signal) {
                rejectPromise(new Error(`Script exited via signal ${signal}`));
                return;
            }

            if (code !== 0) {
                rejectPromise(new Error(`Script exited with code ${code ?? "unknown"}`));
                return;
            }

            resolvePromise();
        });
    });
}

function startNext() {
    const child = spawn(process.execPath, [nextCliPath, "start"], {
        cwd: projectRoot,
        env: process.env,
        stdio: "inherit",
    });

    child.on("exit", (code, signal) => {
        if (signal) {
            process.kill(process.pid, signal);
            return;
        }

        process.exit(code ?? 0);
    });
}

try {
    if (shouldAutoMigrate()) {
        console.info("[startup] waiting for database before starting app...");
        await waitForDatabaseConnection({ logPrefix: "[startup]" });
        console.info("[startup] applying checked-in database migrations...");
        await applyCheckedInMigrations();
    } else {
        console.info("[startup] AUTO_DB_MIGRATE is disabled; skipping migrations.");
    }

    if (shouldAutoSeed()) {
        const needsSeed = await databaseNeedsSeed();

        if (needsSeed) {
            console.info("[startup] database is empty; running seed script...");
            await runNodeScript(seedScriptPath);
        } else {
            console.info("[startup] seed skipped because application data already exists.");
        }
    } else {
        console.info("[startup] AUTO_DB_SEED is disabled; skipping seed.");
    }

    startNext();
} catch (error) {
    const message = error instanceof Error ? error.message : "Unknown startup failure";
    console.error(`[startup] failed to initialize database: ${message}`);
    process.exit(1);
}
