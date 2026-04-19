import { randomBytes, scrypt } from "node:crypto";
import { Client } from "pg";

const defaultPlans = [
    {
        slug: "starter",
        name: "Starter",
        description: "For individual developers getting started with DBConnect.",
        price: 0,
        pricePaise: 0,
        maxDevices: 1,
        durationDays: 0,
        isPopular: false,
        isActive: true,
        sortOrder: 10,
        features: [
            "1 device",
            "Core database features",
            "SQLite, PostgreSQL, MySQL",
            "Community support",
        ],
    },
    {
        slug: "pro",
        name: "Pro",
        description: "For power users who need more devices and faster support.",
        price: 299,
        pricePaise: 29900,
        maxDevices: 3,
        durationDays: 30,
        isPopular: true,
        isActive: true,
        sortOrder: 20,
        features: [
            "3 devices",
            "Everything in Starter",
            "Query history & saved queries",
            "Export CSV / JSON",
            "Priority support",
        ],
    },
];

const databaseUrl =
    process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/db_connect";

const demoUser = {
    email: process.env.DB_SETUP_DEMO_EMAIL ?? "demo@dbconnect.local",
    name: process.env.DB_SETUP_DEMO_NAME ?? "DBConnect Demo",
    password: process.env.DB_SETUP_DEMO_PASSWORD ?? "demo12345",
};

const demoLicense = {
    deviceId: "demo-macbook-pro",
    deviceName: "Demo MacBook Pro",
    expiresAt: new Date(Date.now() + 30 * 86_400_000).toISOString(),
    key: "DBK-DEMO-2026-ABCD-EFGH",
    paymentReference: "seed-demo-license",
    planId: "pro",
    planName: "Pro",
    platform: "macOS",
    price: 299,
    signature: "seed-signature-demo",
};

function hashPassword(password) {
    const salt = randomBytes(16).toString("hex");

    return new Promise((resolve, reject) => {
        scrypt(
            password.normalize("NFKC"),
            salt,
            64,
            {
                N: 16384,
                r: 16,
                p: 1,
                maxmem: 128 * 16384 * 16 * 2,
            },
            (error, key) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(`${salt}:${key.toString("hex")}`);
            },
        );
    });
}

async function ensureDemoUser(client) {
    const now = new Date();
    const existingUser = await client.query(
        'select id from "user" where email = $1 limit 1',
        [demoUser.email],
    );

    const userId = existingUser.rows[0]?.id ?? "seed-demo-user";

    if (existingUser.rowCount === 0) {
        await client.query(
            `insert into "user" (id, name, email, email_verified, image, created_at, updated_at)
             values ($1, $2, $3, $4, $5, $6, $7)`,
            [userId, demoUser.name, demoUser.email, true, null, now, now],
        );
    } else {
        await client.query(
            `update "user"
             set name = $2,
                 email = $3,
                 email_verified = $4,
                 updated_at = $5
             where id = $1`,
            [userId, demoUser.name, demoUser.email, true, now],
        );
    }

    const password = await hashPassword(demoUser.password);
    const existingAccount = await client.query(
        `select id from "account"
         where user_id = $1 and provider_id = 'credential'
         limit 1`,
        [userId],
    );

    if (existingAccount.rowCount === 0) {
        await client.query(
            `insert into "account" (
                id,
                account_id,
                provider_id,
                user_id,
                access_token,
                refresh_token,
                id_token,
                access_token_expires_at,
                refresh_token_expires_at,
                scope,
                password,
                created_at,
                updated_at
            ) values ($1, $2, 'credential', $3, null, null, null, null, null, null, $4, $5, $6)`,
            ["seed-demo-account", userId, userId, password, now, now],
        );
    } else {
        await client.query(
            `update "account"
             set account_id = $2,
                 password = $3,
                 updated_at = $4
             where id = $1`,
            [existingAccount.rows[0].id, userId, password, now],
        );
    }

    await client.query(
        `insert into "profiles" (user_id, name, email, created_at, updated_at)
         values ($1, $2, $3, $4, $5)
         on conflict (user_id) do update set
             name = excluded.name,
             email = excluded.email,
             updated_at = excluded.updated_at`,
        [userId, demoUser.name, demoUser.email, now, now],
    );

    return userId;
}

async function ensurePlans(client) {
    const now = new Date();

    for (const plan of defaultPlans) {
        await client.query(
            `insert into "application_plans" (
                slug,
                name,
                description,
                price,
                price_paise,
                max_devices,
                duration_days,
                is_popular,
                is_active,
                sort_order,
                features,
                created_at,
                updated_at
            ) values (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::text[], $12, $13
            )
            on conflict (slug) do update set
                name = excluded.name,
                description = excluded.description,
                price = excluded.price,
                price_paise = excluded.price_paise,
                max_devices = excluded.max_devices,
                duration_days = excluded.duration_days,
                is_popular = excluded.is_popular,
                is_active = excluded.is_active,
                sort_order = excluded.sort_order,
                features = excluded.features,
                updated_at = excluded.updated_at`,
            [
                plan.slug,
                plan.name,
                plan.description,
                plan.price,
                plan.pricePaise,
                plan.maxDevices,
                plan.durationDays,
                plan.isPopular,
                plan.isActive,
                plan.sortOrder,
                plan.features,
                now,
                now,
            ],
        );
    }
}

async function ensureDemoLicense(client, userId) {
    const now = new Date();
    const licenseResult = await client.query(
        `insert into "licenses" (
            user_id,
            email,
            license_key,
            plan_id,
            plan_name,
            status,
            payment_reference,
            expires_at,
            max_devices,
            price,
            signature,
            created_at,
            updated_at
        ) values ($1, $2, $3, $4, $5, 'active', $6, $7, $8, $9, $10, $11, $12)
         on conflict (payment_reference) do update set
             user_id = excluded.user_id,
             email = excluded.email,
             license_key = excluded.license_key,
             plan_id = excluded.plan_id,
             plan_name = excluded.plan_name,
             status = excluded.status,
             expires_at = excluded.expires_at,
             max_devices = excluded.max_devices,
             price = excluded.price,
             signature = excluded.signature,
             updated_at = excluded.updated_at
         returning id, license_key`,
        [
            userId,
            demoUser.email,
            demoLicense.key,
            demoLicense.planId,
            demoLicense.planName,
            demoLicense.paymentReference,
            demoLicense.expiresAt,
            3,
            demoLicense.price,
            demoLicense.signature,
            now,
            now,
        ],
    );

    const licenseId = licenseResult.rows[0].id;

    await client.query(
        `insert into "activations" (
            license_id,
            device_id,
            device_name,
            platform,
            last_seen,
            activated_at
        ) values ($1, $2, $3, $4, $5, $6)
         on conflict (license_id, device_id) do update set
             device_name = excluded.device_name,
             platform = excluded.platform,
             last_seen = excluded.last_seen`,
        [licenseId, demoLicense.deviceId, demoLicense.deviceName, demoLicense.platform, now, now],
    );

    return licenseResult.rows[0].license_key;
}

const client = new Client({
    connectionString: databaseUrl,
    ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
});

let transactionOpen = false;

try {
    await client.connect();
    await client.query("begin");
    transactionOpen = true;

    await ensurePlans(client);
    const userId = await ensureDemoUser(client);
    const licenseKey = await ensureDemoLicense(client, userId);

    await client.query("commit");
    transactionOpen = false;

    console.info("Seeded demo account and billing data.");
    console.info(`Demo email: ${demoUser.email}`);
    console.info(`Demo password: ${demoUser.password}`);
    console.info(`Demo license key: ${licenseKey}`);
} catch (error) {
    if (transactionOpen) {
        await client.query("rollback");
    }
    throw error;
} finally {
    await client.end();
}
