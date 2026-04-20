import { and, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { activations, licenses, profiles, type ActivationRow, type LicenseRow, type ProfileRow } from "@/lib/db/schema";
import { createCanonicalLicensePayload } from "@/lib/license/sign";
import { listActiveApplicationPlans } from "@/lib/plan-server";
import type { ApplicationPlan } from "@/lib/plans";

type SessionUser = {
    createdAt?: Date | string | null;
    email: string;
    emailVerified?: boolean;
    id: string;
    name?: string | null;
};

function serializeDate(value?: Date | string | null) {
    if (!value) {
        return new Date().toISOString();
    }

    if (value instanceof Date) {
        return value.toISOString();
    }

    return new Date(value).toISOString();
}

function normalizeLicenseKey(value: string) {
    return value.trim().toUpperCase();
}

export function generateLicenseKey() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const segment = () =>
        Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");

    return `DBK-${segment()}-${segment()}-${segment()}-${segment()}`;
}

export function getExpiryDate(durationDays: number) {
    if (durationDays === 0) {
        return "lifetime";
    }

    return new Date(Date.now() + durationDays * 86_400_000).toISOString();
}

function toPublicProfile(profile: ProfileRow | null, user: SessionUser) {
    return {
        id: user.id,
        name: profile?.name ?? user.name ?? null,
        email: profile?.email ?? user.email,
        email_verified: user.emailVerified ?? false,
        created_at: serializeDate(profile?.createdAt ?? user.createdAt),
        updated_at: serializeDate(profile?.updatedAt ?? user.createdAt),
    };
}

function toPublicLicense(license: LicenseRow | null | undefined) {
    if (!license) {
        return null;
    }

    return {
        id: license.id,
        user_id: license.userId,
        email: license.email,
        license_key: license.licenseKey,
        plan_id: license.planId,
        plan_name: license.planName,
        status: license.status,
        payment_reference: license.paymentReference,
        expires_at: license.expiresAt,
        max_devices: license.maxDevices,
        price: license.price,
        signature: license.signature,
        created_at: serializeDate(license.createdAt),
        updated_at: serializeDate(license.updatedAt),
    };
}

function toPublicActivation(activation: ActivationRow) {
    return {
        id: activation.id,
        license_id: activation.licenseId,
        device_id: activation.deviceId,
        device_name: activation.deviceName,
        platform: activation.platform,
        last_seen: serializeDate(activation.lastSeen),
        activated_at: serializeDate(activation.activatedAt),
    };
}

export async function ensureProfileForUser(user: SessionUser) {
    const existing = await db.query.profiles.findFirst({
        where: (profile, { eq: equals }) => equals(profile.userId, user.id),
    });

    if (existing) {
        const nextName = user.name ?? null;
        const needsUpdate = existing.email !== user.email || existing.name !== nextName;

        if (needsUpdate) {
            await db
                .update(profiles)
                .set({
                    email: user.email,
                    name: nextName,
                    updatedAt: new Date(),
                })
                .where(eq(profiles.userId, user.id));

            return {
                ...existing,
                email: user.email,
                name: nextName,
                updatedAt: new Date(),
            };
        }

        return existing;
    }

    const [created] = await db
        .insert(profiles)
        .values({
            userId: user.id,
            email: user.email,
            name: user.name ?? null,
        })
        .returning();

    return created;
}

export async function getLatestActiveLicense(userId: string) {
    return db.query.licenses.findFirst({
        where: (license, { and: andWhere }) =>
            andWhere(eq(license.userId, userId), eq(license.status, "active")),
        orderBy: (license, { desc: descending }) => [descending(license.createdAt)],
    });
}

export async function getOverviewData(user: SessionUser) {
    const profile = await ensureProfileForUser(user);
    const license = await getLatestActiveLicense(user.id);

    let deviceCount = 0;
    if (license) {
        const deviceRows = await db
            .select({ id: activations.id })
            .from(activations)
            .where(eq(activations.licenseId, license.id));

        deviceCount = deviceRows.length;
    }

    return {
        user: toPublicProfile(profile, user),
        license: toPublicLicense(license),
        deviceCount,
    };
}

export async function getBillingData(user: SessionUser) {
    const profile = await ensureProfileForUser(user);
    const license = await getLatestActiveLicense(user.id);
    const plans = await listActiveApplicationPlans();

    const deviceRows = license
        ? await db
              .select()
              .from(activations)
              .where(eq(activations.licenseId, license.id))
              .orderBy(desc(activations.activatedAt))
        : [];

    return {
        user: toPublicProfile(profile, user),
        license: toPublicLicense(license),
        devices: deviceRows.map(toPublicActivation),
        plans,
    };
}

export async function updateProfileName(user: SessionUser, name: string) {
    await ensureProfileForUser(user);

    const [updated] = await db
        .update(profiles)
        .set({
            name,
            updatedAt: new Date(),
        })
        .where(eq(profiles.userId, user.id))
        .returning();

    return toPublicProfile(updated ?? null, { ...user, name });
}

export async function expireActiveLicenses(userId: string) {
    await db
        .update(licenses)
        .set({
            status: "expired",
            updatedAt: new Date(),
        })
        .where(and(eq(licenses.userId, userId), eq(licenses.status, "active")));
}

export async function createLicenseForUser(params: {
    email: string;
    expiresAt: string;
    issuedAt?: string;
    licenseKey?: string;
    maxDevices: number;
    paymentReference?: string;
    plan: ApplicationPlan;
    signature: string;
    userId: string;
}) {
    const paymentReference = params.paymentReference;

    if (paymentReference) {
        const existing = await db.query.licenses.findFirst({
            where: (license, { eq: equals }) =>
                equals(license.paymentReference, paymentReference),
        });

        if (existing) {
            return existing;
        }
    }

    await expireActiveLicenses(params.userId);

    const [license] = await db
        .insert(licenses)
        .values({
            userId: params.userId,
            email: params.email,
            licenseKey: params.licenseKey ?? generateLicenseKey(),
            planId: params.plan.id,
            planName: params.plan.name,
            status: "active",
            paymentReference: params.paymentReference,
            expiresAt: params.expiresAt,
            maxDevices: params.maxDevices,
            price: params.plan.price,
            signature: params.signature,
            createdAt: params.issuedAt ? new Date(params.issuedAt) : undefined,
            updatedAt: params.issuedAt ? new Date(params.issuedAt) : undefined,
        })
        .returning();

    return license;
}

export async function deleteActivationForUser(userId: string, activationId: string) {
    const [existing] = await db
        .select({
            activationId: activations.id,
            licenseId: activations.licenseId,
        })
        .from(activations)
        .innerJoin(licenses, eq(licenses.id, activations.licenseId))
        .where(and(eq(activations.id, activationId), eq(licenses.userId, userId)));

    if (!existing) {
        return false;
    }

    await db.delete(activations).where(eq(activations.id, activationId));
    return true;
}

export async function findProfileByUserId(userId: string) {
    return db.query.profiles.findFirst({
        where: (profile, { eq: equals }) => equals(profile.userId, userId),
    });
}

export function normalizeLicenseDocument(license: LicenseRow) {
    const signedLicense = createCanonicalLicensePayload({
        email: license.email,
        expiry: license.expiresAt ?? "",
        issuedAt: serializeDate(license.createdAt),
        licenseKey: normalizeLicenseKey(license.licenseKey),
        maxDevices: license.maxDevices,
        plan: license.planId ?? license.planName ?? "",
    });

    return {
        id: license.id,
        user_id: license.userId,
        email: license.email,
        license_key: normalizeLicenseKey(license.licenseKey),
        plan_id: license.planId,
        plan_name: license.planName,
        status: license.status,
        payment_reference: license.paymentReference,
        expires_at: license.expiresAt,
        max_devices: license.maxDevices,
        price: license.price,
        created_at: serializeDate(license.createdAt),
        updated_at: serializeDate(license.updatedAt),
        signature: license.signature,
        signed_license: {
            ...signedLicense,
            signature: license.signature,
        },
    };
}
