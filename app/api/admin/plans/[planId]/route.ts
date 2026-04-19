import type { NextRequest } from "next/server";

import { requireAdminRequestSession } from "@/lib/admin-auth";
import { archiveAdminPlan, updateAdminPlan } from "@/lib/admin-server";

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

    return undefined;
}

function toNumber(value: unknown) {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === "string" && value.trim().length > 0) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
    }

    return undefined;
}

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ planId: string }> },
) {
    const { response } = await requireAdminRequestSession();

    if (response) {
        return response;
    }

    const { planId } = await context.params;
    const body = await request.json();
    const features = parseFeatures((body as { features?: unknown }).features);

    const plan = await updateAdminPlan(planId, {
        ...(typeof (body as { name?: unknown }).name === "string"
            ? { name: (body as { name: string }).name.trim() }
            : {}),
        ...(typeof (body as { description?: unknown }).description === "string"
            ? { description: (body as { description: string }).description.trim() || null }
            : {}),
        ...(toNumber((body as { price?: unknown }).price) !== undefined
            ? { price: Math.max(0, toNumber((body as { price?: unknown }).price) ?? 0) }
            : {}),
        ...(toNumber((body as { maxDevices?: unknown }).maxDevices) !== undefined
            ? { maxDevices: Math.max(1, toNumber((body as { maxDevices?: unknown }).maxDevices) ?? 1) }
            : {}),
        ...(toNumber((body as { durationDays?: unknown }).durationDays) !== undefined
            ? { durationDays: Math.max(0, toNumber((body as { durationDays?: unknown }).durationDays) ?? 0) }
            : {}),
        ...(toNumber((body as { sortOrder?: unknown }).sortOrder) !== undefined
            ? { sortOrder: toNumber((body as { sortOrder?: unknown }).sortOrder) ?? 0 }
            : {}),
        ...((body as { isPopular?: unknown }).isPopular !== undefined
            ? { isPopular: Boolean((body as { isPopular?: unknown }).isPopular) }
            : {}),
        ...((body as { isActive?: unknown }).isActive !== undefined
            ? { isActive: Boolean((body as { isActive?: unknown }).isActive) }
            : {}),
        ...(features !== undefined ? { features } : {}),
    });

    if (!plan) {
        return Response.json({ error: "Plan not found." }, { status: 404 });
    }

    return Response.json({ plan });
}

export async function DELETE(
    _request: NextRequest,
    context: { params: Promise<{ planId: string }> },
) {
    const { response } = await requireAdminRequestSession();

    if (response) {
        return response;
    }

    const { planId } = await context.params;
    const plan = await archiveAdminPlan(planId);

    if (!plan) {
        return Response.json({ error: "Plan not found." }, { status: 404 });
    }

    return Response.json({ plan });
}
