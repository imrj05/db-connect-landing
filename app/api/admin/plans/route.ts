import type { NextRequest } from "next/server";

import { requireAdminRequestSession } from "@/lib/admin-auth";
import { createAdminPlan, listAdminPlans } from "@/lib/admin-server";

function parseFeatures(value: unknown) {
    if (Array.isArray(value)) {
        return value
            .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
            .filter(Boolean);
    }

    if (typeof value === "string") {
        return value
            .split(/\n|,/u)
            .map((entry) => entry.trim())
            .filter(Boolean);
    }

    return [];
}

function normalizePlanId(value: unknown) {
    if (typeof value !== "string") {
        return "";
    }

    return value.trim().toLowerCase().replace(/[^a-z0-9-]+/gu, "-").replace(/^-+|-+$/gu, "");
}

function toNumber(value: unknown, fallback = 0) {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === "string" && value.trim().length > 0) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    return fallback;
}

export async function GET() {
    const { response } = await requireAdminRequestSession();

    if (response) {
        return response;
    }

    const plans = await listAdminPlans();
    return Response.json({ plans });
}

export async function POST(request: NextRequest) {
    const { response } = await requireAdminRequestSession();

    if (response) {
        return response;
    }

    const body = await request.json();
    const id = normalizePlanId((body as { id?: unknown }).id);
    const name = typeof (body as { name?: unknown }).name === "string" ? (body as { name: string }).name.trim() : "";
    const features = parseFeatures((body as { features?: unknown }).features);

    if (!id || !name) {
        return Response.json({ error: "Plan id and name are required." }, { status: 400 });
    }

    const plan = await createAdminPlan({
        id,
        name,
        description: typeof (body as { description?: unknown }).description === "string"
            ? (body as { description: string }).description.trim() || null
            : null,
        price: Math.max(0, toNumber((body as { price?: unknown }).price)),
        maxDevices: Math.max(1, toNumber((body as { maxDevices?: unknown }).maxDevices, 1)),
        durationDays: Math.max(0, toNumber((body as { durationDays?: unknown }).durationDays)),
        sortOrder: toNumber((body as { sortOrder?: unknown }).sortOrder),
        isPopular: Boolean((body as { isPopular?: unknown }).isPopular),
        isActive: (body as { isActive?: unknown }).isActive !== false,
        features,
    });

    return Response.json({ plan }, { status: 201 });
}
