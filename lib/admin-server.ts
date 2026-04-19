import {
    and,
    desc,
    eq,
    ilike,
    inArray,
    or,
    sql,
} from "drizzle-orm";

import { user as authUsers } from "@/lib/db/auth-schema";
import { db } from "@/lib/db";
import { activations, applicationPlans, licenses, profiles } from "@/lib/db/schema";
import {
    archiveApplicationPlan,
    createApplicationPlan,
    listApplicationPlans,
    updateApplicationPlan,
} from "@/lib/plan-server";

function serializeDate(value?: Date | string | null) {
    if (!value) {
        return new Date().toISOString();
    }

    if (value instanceof Date) {
        return value.toISOString();
    }

    return new Date(value).toISOString();
}

function getSearchPattern(value?: string | null) {
    const normalized = value?.trim();

    if (!normalized) {
        return null;
    }

    return `%${normalized.replace(/\s+/gu, "%")}%`;
}

export async function getAdminOverviewData() {
    const [[userCount], [licenseCount], [activationCount], [planCount], recentLicenses] = await Promise.all([
        db.select({ count: sql<number>`count(*)::int` }).from(authUsers),
        db.select({ count: sql<number>`count(*)::int` }).from(licenses),
        db.select({ count: sql<number>`count(*)::int` }).from(activations),
        db.select({ count: sql<number>`count(*)::int` }).from(applicationPlans),
        db
            .select({
                id: licenses.id,
                email: licenses.email,
                planName: licenses.planName,
                status: licenses.status,
                createdAt: licenses.createdAt,
            })
            .from(licenses)
            .orderBy(desc(licenses.createdAt))
            .limit(8),
    ]);

    return {
        counts: {
            users: userCount?.count ?? 0,
            licenses: licenseCount?.count ?? 0,
            activations: activationCount?.count ?? 0,
            plans: planCount?.count ?? 0,
        },
        recentLicenses: recentLicenses.map((license) => ({
            id: license.id,
            email: license.email,
            plan_name: license.planName,
            status: license.status,
            created_at: serializeDate(license.createdAt),
        })),
    };
}

export async function listAdminUsers(options?: { query?: string | null }) {
    const pattern = getSearchPattern(options?.query);

    const rows = await db
        .select({
            id: authUsers.id,
            name: authUsers.name,
            email: authUsers.email,
            emailVerified: authUsers.emailVerified,
            createdAt: authUsers.createdAt,
            updatedAt: authUsers.updatedAt,
            profileName: profiles.name,
        })
        .from(authUsers)
        .leftJoin(profiles, eq(profiles.userId, authUsers.id))
        .where(
            pattern
                ? or(
                      ilike(authUsers.email, pattern),
                      ilike(authUsers.name, pattern),
                      ilike(profiles.name, pattern),
                  )
                : undefined,
        )
        .orderBy(desc(authUsers.createdAt))
        .limit(200);

    const userIds = rows.map((row) => row.id);

    const licenseRows = userIds.length
        ? await db
              .select({
                  userId: licenses.userId,
                  planName: licenses.planName,
                  status: licenses.status,
              })
              .from(licenses)
              .where(inArray(licenses.userId, userIds))
              .orderBy(desc(licenses.createdAt))
        : [];

    const licenseSummary = new Map<
        string,
        {
            activeLicenseCount: number;
            currentPlanName: string | null;
            currentStatus: string | null;
            licenseCount: number;
        }
    >();

    for (const row of licenseRows) {
        const existing = licenseSummary.get(row.userId) ?? {
            licenseCount: 0,
            activeLicenseCount: 0,
            currentPlanName: null,
            currentStatus: null,
        };

        existing.licenseCount += 1;
        if (row.status === "active") {
            existing.activeLicenseCount += 1;
        }
        if (!existing.currentPlanName) {
            existing.currentPlanName = row.planName;
            existing.currentStatus = row.status;
        }

        licenseSummary.set(row.userId, existing);
    }

    return rows.map((row) => {
        const summary = licenseSummary.get(row.id);

        return {
            id: row.id,
            name: row.profileName ?? row.name,
            email: row.email,
            email_verified: row.emailVerified,
            created_at: serializeDate(row.createdAt),
            updated_at: serializeDate(row.updatedAt),
            license_count: summary?.licenseCount ?? 0,
            active_license_count: summary?.activeLicenseCount ?? 0,
            current_plan_name: summary?.currentPlanName ?? null,
            current_status: summary?.currentStatus ?? null,
        };
    });
}

export async function updateAdminUserProfile(userId: string, input: { name: string }) {
    const existingUser = await db.query.user.findFirst({
        where: eq(authUsers.id, userId),
    });

    if (!existingUser) {
        return null;
    }

    const [updatedUser] = await db
        .update(authUsers)
        .set({
            name: input.name,
            updatedAt: new Date(),
        })
        .where(eq(authUsers.id, userId))
        .returning();

    const existingProfile = await db.query.profiles.findFirst({
        where: eq(profiles.userId, userId),
    });

    if (existingProfile) {
        await db
            .update(profiles)
            .set({
                name: input.name,
                updatedAt: new Date(),
            })
            .where(eq(profiles.userId, userId));
    } else {
        await db.insert(profiles).values({
            userId,
            email: existingUser.email,
            name: input.name,
        });
    }

    return {
        id: updatedUser.id,
        name: input.name,
        email: updatedUser.email,
        email_verified: updatedUser.emailVerified,
        created_at: serializeDate(updatedUser.createdAt),
        updated_at: serializeDate(updatedUser.updatedAt),
    };
}

export async function listAdminLicenses(options?: {
    planId?: string | null;
    query?: string | null;
    status?: string | null;
}) {
    const pattern = getSearchPattern(options?.query);
    const filters = [
        options?.status ? eq(licenses.status, options.status) : undefined,
        options?.planId ? eq(licenses.planId, options.planId) : undefined,
        pattern
            ? or(
                  ilike(licenses.email, pattern),
                  ilike(licenses.licenseKey, pattern),
                  ilike(licenses.planName, pattern),
                  ilike(licenses.paymentReference, pattern),
                  ilike(profiles.name, pattern),
              )
            : undefined,
    ].filter(Boolean);

    const rows = await db
        .select({
            id: licenses.id,
            userId: licenses.userId,
            email: licenses.email,
            licenseKey: licenses.licenseKey,
            planId: licenses.planId,
            planName: licenses.planName,
            status: licenses.status,
            paymentReference: licenses.paymentReference,
            expiresAt: licenses.expiresAt,
            maxDevices: licenses.maxDevices,
            price: licenses.price,
            createdAt: licenses.createdAt,
            updatedAt: licenses.updatedAt,
            userName: profiles.name,
        })
        .from(licenses)
        .leftJoin(profiles, eq(profiles.userId, licenses.userId))
        .where(filters.length ? and(...filters) : undefined)
        .orderBy(desc(licenses.createdAt))
        .limit(200);

    const licenseIds = rows.map((row) => row.id);
    const activationRows = licenseIds.length
        ? await db
              .select({
                  licenseId: activations.licenseId,
                  count: sql<number>`count(*)::int`,
              })
              .from(activations)
              .where(inArray(activations.licenseId, licenseIds))
              .groupBy(activations.licenseId)
        : [];

    const counts = new Map(activationRows.map((row) => [row.licenseId, row.count]));

    return rows.map((row) => ({
        id: row.id,
        user_id: row.userId,
        user_name: row.userName,
        email: row.email,
        license_key: row.licenseKey,
        plan_id: row.planId,
        plan_name: row.planName,
        status: row.status,
        payment_reference: row.paymentReference,
        expires_at: row.expiresAt,
        max_devices: row.maxDevices,
        price: row.price,
        device_count: counts.get(row.id) ?? 0,
        created_at: serializeDate(row.createdAt),
        updated_at: serializeDate(row.updatedAt),
    }));
}

export async function updateAdminLicenseStatus(licenseId: string, status: string) {
    const [updated] = await db
        .update(licenses)
        .set({
            status,
            updatedAt: new Date(),
        })
        .where(eq(licenses.id, licenseId))
        .returning();

    if (!updated) {
        return null;
    }

    return {
        id: updated.id,
        status: updated.status,
        updated_at: serializeDate(updated.updatedAt),
    };
}

export async function listAdminActivations(options?: {
    planId?: string | null;
    query?: string | null;
}) {
    const pattern = getSearchPattern(options?.query);
    const filters = [
        options?.planId ? eq(licenses.planId, options.planId) : undefined,
        pattern
            ? or(
                  ilike(activations.deviceId, pattern),
                  ilike(activations.deviceName, pattern),
                  ilike(licenses.email, pattern),
                  ilike(licenses.licenseKey, pattern),
                  ilike(profiles.name, pattern),
              )
            : undefined,
    ].filter(Boolean);

    const rows = await db
        .select({
            id: activations.id,
            licenseId: activations.licenseId,
            deviceId: activations.deviceId,
            deviceName: activations.deviceName,
            platform: activations.platform,
            lastSeen: activations.lastSeen,
            activatedAt: activations.activatedAt,
            licenseKey: licenses.licenseKey,
            email: licenses.email,
            planId: licenses.planId,
            planName: licenses.planName,
            status: licenses.status,
            userName: profiles.name,
        })
        .from(activations)
        .innerJoin(licenses, eq(licenses.id, activations.licenseId))
        .leftJoin(profiles, eq(profiles.userId, licenses.userId))
        .where(filters.length ? and(...filters) : undefined)
        .orderBy(desc(activations.lastSeen))
        .limit(200);

    return rows.map((row) => ({
        id: row.id,
        license_id: row.licenseId,
        device_id: row.deviceId,
        device_name: row.deviceName,
        platform: row.platform,
        last_seen: serializeDate(row.lastSeen),
        activated_at: serializeDate(row.activatedAt),
        license_key: row.licenseKey,
        email: row.email,
        plan_id: row.planId,
        plan_name: row.planName,
        status: row.status,
        user_name: row.userName,
    }));
}

export async function deleteAdminActivation(activationId: string) {
    const [existing] = await db
        .select({ id: activations.id })
        .from(activations)
        .where(eq(activations.id, activationId));

    if (!existing) {
        return false;
    }

    await db.delete(activations).where(eq(activations.id, activationId));
    return true;
}

export async function listAdminPlans() {
    return listApplicationPlans();
}

export async function createAdminPlan(input: {
    description?: string | null;
    durationDays: number;
    features: string[];
    id: string;
    isActive: boolean;
    isPopular: boolean;
    maxDevices: number;
    name: string;
    price: number;
    sortOrder: number;
}) {
    return createApplicationPlan(input);
}

export async function updateAdminPlan(
    planId: string,
    input: Partial<{
        description: string | null;
        durationDays: number;
        features: string[];
        isActive: boolean;
        isPopular: boolean;
        maxDevices: number;
        name: string;
        price: number;
        sortOrder: number;
    }>,
) {
    return updateApplicationPlan(planId, input);
}

export async function archiveAdminPlan(planId: string) {
    return archiveApplicationPlan(planId);
}
