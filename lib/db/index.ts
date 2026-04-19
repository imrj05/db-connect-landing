import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as appSchema from "@/lib/db/schema";
import * as authSchema from "@/lib/db/auth-schema";

export const schema = {
    ...appSchema,
    ...authSchema,
};

const connectionString =
    process.env.DATABASE_URL ?? "postgresql://invalid:invalid@127.0.0.1:5432/invalid";

const globalForDb = globalThis as typeof globalThis & {
    __dbPool?: Pool;
};

const pool =
    globalForDb.__dbPool ??
    new Pool({
        connectionString,
        ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    });

if (process.env.NODE_ENV !== "production") {
    globalForDb.__dbPool = pool;
}

export const db = drizzle(pool, { schema });
export { pool };
