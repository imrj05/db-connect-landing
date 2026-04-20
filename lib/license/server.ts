import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { activations, licenses } from "@/lib/db/schema";
import type { LicenseLike } from "@/lib/license/types";
import { createCanonicalLicensePayload } from "@/lib/license/sign";

export type LicenseDocument = {
    id: string;
    user_id: string;
    email: string;
    license_key: string;
    plan_id: string | null;
    plan_name: string | null;
    status: string;
    expires_at: string | null;
    max_devices: number;
    price: number;
    created_at: string;
    updated_at: string;
    signature?: string | null;
};

export type ActivationDocument = {
    id: string;
    license_id: string;
    device_id: string;
    device_name: string | null;
    platform: string | null;
    last_seen: string;
    activated_at: string;
};

function toDateString(value: Date | string | null | undefined) {
    if (!value) {
        return new Date().toISOString();
    }

    if (value instanceof Date) {
        return value.toISOString();
    }

    return new Date(value).toISOString();
}

function toLicenseDocument(row: typeof licenses.$inferSelect): LicenseDocument {
    return {
        id: row.id,
        user_id: row.userId,
        email: row.email,
        license_key: row.licenseKey,
        plan_id: row.planId,
        plan_name: row.planName,
        status: row.status,
        expires_at: row.expiresAt,
        max_devices: row.maxDevices,
        price: row.price,
        created_at: toDateString(row.createdAt),
        updated_at: toDateString(row.updatedAt),
        signature: row.signature,
    };
}

function toActivationDocument(row: typeof activations.$inferSelect): ActivationDocument {
    return {
        id: row.id,
        license_id: row.licenseId,
        device_id: row.deviceId,
        device_name: row.deviceName,
        platform: row.platform,
        last_seen: toDateString(row.lastSeen),
        activated_at: toDateString(row.activatedAt),
    };
}

export function getLicenseLookupKey(value: string): string {
    return value.trim().toUpperCase();
}

export function mapLicenseDocumentToLicense(document: LicenseDocument): LicenseLike {
    return {
        ...createCanonicalLicensePayload({
            email: document.email,
            expiry: document.expires_at ?? "",
            issuedAt: document.created_at,
            licenseKey: document.license_key,
            maxDevices: document.max_devices,
            plan: document.plan_id ?? document.plan_name ?? "",
        }),
        signature: document.signature ?? undefined,
        is_revoked: document.status === "revoked",
    };
}

export async function findLicenseByKey(licenseKey: string): Promise<LicenseDocument | null> {
    const row = await db.query.licenses.findFirst({
        where: (license, { eq: equals }) =>
            equals(license.licenseKey, getLicenseLookupKey(licenseKey)),
    });

    return row ? toLicenseDocument(row) : null;
}

export async function listActivationsByLicenseId(licenseId: string): Promise<ActivationDocument[]> {
    const rows = await db.query.activations.findMany({
        where: (activation, { eq: equals }) => equals(activation.licenseId, licenseId),
    });

    return rows.map(toActivationDocument);
}

export async function findActivationByDevice(
    licenseId: string,
    deviceId: string,
): Promise<ActivationDocument | null> {
    const row = await db.query.activations.findFirst({
        where: (activation, { and: andWhere, eq: equals }) =>
            andWhere(eq(activation.licenseId, licenseId), equals(activation.deviceId, deviceId)),
    });

    return row ? toActivationDocument(row) : null;
}

export async function upsertActivation(params: {
    license: LicenseDocument;
    deviceId: string;
    deviceName: string;
}): Promise<{ activationId: string; isNew: boolean }> {
    const existing = await findActivationByDevice(params.license.id, params.deviceId);
    const now = new Date();

    if (existing) {
        await db
            .update(activations)
            .set({
                deviceName: params.deviceName,
                lastSeen: now,
            })
            .where(eq(activations.id, existing.id));

        return {
            activationId: existing.id,
            isNew: false,
        };
    }

    const [created] = await db
        .insert(activations)
        .values({
            licenseId: params.license.id,
            deviceId: params.deviceId,
            deviceName: params.deviceName,
            platform: null,
            lastSeen: now,
            activatedAt: now,
        })
        .returning();

    return {
        activationId: created.id,
        isNew: true,
    };
}

export async function deleteActivationByDevice(params: {
    licenseId: string;
    deviceId: string;
}): Promise<boolean> {
    const existing = await findActivationByDevice(params.licenseId, params.deviceId);

    if (!existing) {
        return false;
    }

    await db.delete(activations).where(eq(activations.id, existing.id));
    return true;
}
