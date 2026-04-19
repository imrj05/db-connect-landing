import type { Config } from "drizzle-kit";

export default {
    schema: ["./lib/db/schema.ts", "./lib/db/auth-schema.ts"],
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL ?? "postgresql://invalid:invalid@127.0.0.1:5432/invalid",
    },
} satisfies Config;
