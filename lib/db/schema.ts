import { index, integer, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

const timestampColumns = {
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
};

export const profiles = pgTable(
    "profiles",
    {
        userId: text("user_id").primaryKey(),
        name: text("name"),
        email: text("email").notNull(),
        ...timestampColumns,
    },
    (table) => [uniqueIndex("profiles_email_idx").on(table.email)],
);

export const licenses = pgTable(
    "licenses",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        userId: text("user_id").notNull(),
        email: text("email").notNull(),
        licenseKey: text("license_key").notNull(),
        planId: text("plan_id"),
        planName: text("plan_name"),
        status: text("status").notNull().default("active"),
        paymentReference: text("payment_reference"),
        expiresAt: text("expires_at"),
        maxDevices: integer("max_devices").notNull().default(1),
        price: integer("price").notNull().default(0),
        signature: text("signature"),
        ...timestampColumns,
    },
    (table) => [
        uniqueIndex("licenses_license_key_idx").on(table.licenseKey),
        uniqueIndex("licenses_payment_reference_idx").on(table.paymentReference),
        index("licenses_user_id_idx").on(table.userId),
        index("licenses_status_idx").on(table.status),
    ],
);

export const activations = pgTable(
    "activations",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        licenseId: uuid("license_id").notNull(),
        deviceId: text("device_id").notNull(),
        deviceName: text("device_name"),
        platform: text("platform"),
        lastSeen: timestamp("last_seen", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
        activatedAt: timestamp("activated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("activations_license_device_idx").on(table.licenseId, table.deviceId),
        index("activations_license_id_idx").on(table.licenseId),
    ],
);

export type ProfileRow = typeof profiles.$inferSelect;
export type LicenseRow = typeof licenses.$inferSelect;
export type ActivationRow = typeof activations.$inferSelect;
