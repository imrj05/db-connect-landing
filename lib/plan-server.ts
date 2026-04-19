import { asc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { applicationPlans, type ApplicationPlanRow } from "@/lib/db/schema";
import {
    DEFAULT_PLANS,
    DEFAULT_PLAN_SEEDS,
    formatPlanPriceLabel,
    type ApplicationPlan,
    type PlanId,
    type PlanSeed,
} from "@/lib/plans";

function isMissingPlansTable(error: unknown) {
    if (!(error instanceof Error)) {
        return false;
    }

    return error.message.includes("application_plans") && error.message.includes("does not exist");
}

function toPublicPlan(row: ApplicationPlanRow): ApplicationPlan {
    return {
        id: row.slug,
        name: row.name,
        description: row.description,
        price: row.price,
        pricePaise: row.pricePaise,
        maxDevices: row.maxDevices,
        durationDays: row.durationDays,
        isPopular: row.isPopular,
        isActive: row.isActive,
        sortOrder: row.sortOrder,
        features: row.features,
        priceLabel: formatPlanPriceLabel(row),
    };
}

function toInsertValues(seed: PlanSeed) {
    return {
        slug: seed.id,
        name: seed.name,
        description: seed.description,
        price: seed.price,
        pricePaise: seed.pricePaise,
        maxDevices: seed.maxDevices,
        durationDays: seed.durationDays,
        isPopular: seed.isPopular,
        isActive: seed.isActive,
        sortOrder: seed.sortOrder,
        features: seed.features,
    };
}

export async function ensureDefaultPlansSeeded() {
    try {
        const existing = await db.query.applicationPlans.findFirst({
            columns: { id: true },
        });

        if (existing) {
            return true;
        }

        await db.insert(applicationPlans).values(DEFAULT_PLAN_SEEDS.map(toInsertValues));
        return true;
    } catch (error) {
        if (isMissingPlansTable(error)) {
            return false;
        }

        throw error;
    }
}

export async function listApplicationPlans(options?: {
    activeOnly?: boolean;
    fallbackToDefaults?: boolean;
}) {
    const { activeOnly = false, fallbackToDefaults = false } = options ?? {};

    try {
        const seeded = await ensureDefaultPlansSeeded();

        if (!seeded) {
            if (fallbackToDefaults) {
                return DEFAULT_PLANS.filter((plan) => (activeOnly ? plan.isActive : true));
            }

            throw new Error("application_plans table is unavailable");
        }

        const rows = await db.query.applicationPlans.findMany({
            where: activeOnly ? eq(applicationPlans.isActive, true) : undefined,
            orderBy: [asc(applicationPlans.sortOrder), asc(applicationPlans.name)],
        });

        return rows.map(toPublicPlan);
    } catch (error) {
        if (fallbackToDefaults) {
            return DEFAULT_PLANS.filter((plan) => (activeOnly ? plan.isActive : true));
        }

        throw error;
    }
}

export async function listActiveApplicationPlans() {
    return listApplicationPlans({ activeOnly: true, fallbackToDefaults: true });
}

export async function findPlanById(planId: PlanId) {
    try {
        const seeded = await ensureDefaultPlansSeeded();

        if (!seeded) {
            return DEFAULT_PLANS.find((plan) => plan.id === planId) ?? null;
        }

        const row = await db.query.applicationPlans.findFirst({
            where: eq(applicationPlans.slug, planId),
        });

        if (!row) {
            return null;
        }

        return toPublicPlan(row);
    } catch (error) {
        if (isMissingPlansTable(error)) {
            return DEFAULT_PLANS.find((plan) => plan.id === planId) ?? null;
        }

        throw error;
    }
}

export async function createApplicationPlan(input: {
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
    const [created] = await db
        .insert(applicationPlans)
        .values({
            slug: input.id,
            name: input.name,
            description: input.description ?? null,
            price: input.price,
            pricePaise: input.price * 100,
            maxDevices: input.maxDevices,
            durationDays: input.durationDays,
            isPopular: input.isPopular,
            isActive: input.isActive,
            sortOrder: input.sortOrder,
            features: input.features,
        })
        .returning();

    return toPublicPlan(created);
}

export async function updateApplicationPlan(
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
    const [updated] = await db
        .update(applicationPlans)
        .set({
            ...(input.name !== undefined ? { name: input.name } : {}),
            ...(input.description !== undefined ? { description: input.description } : {}),
            ...(input.price !== undefined
                ? {
                      price: input.price,
                      pricePaise: input.price * 100,
                  }
                : {}),
            ...(input.maxDevices !== undefined ? { maxDevices: input.maxDevices } : {}),
            ...(input.durationDays !== undefined ? { durationDays: input.durationDays } : {}),
            ...(input.isPopular !== undefined ? { isPopular: input.isPopular } : {}),
            ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
            ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
            ...(input.features !== undefined ? { features: input.features } : {}),
            updatedAt: new Date(),
        })
        .where(eq(applicationPlans.slug, planId))
        .returning();

    return updated ? toPublicPlan(updated) : null;
}

export async function archiveApplicationPlan(planId: string) {
    return updateApplicationPlan(planId, { isActive: false });
}
