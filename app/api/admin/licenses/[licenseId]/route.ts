import type { NextRequest } from "next/server";

import { requireAdminRequestSession } from "@/lib/admin-auth";
import { updateAdminLicenseStatus } from "@/lib/admin-server";

const ALLOWED_STATUSES = new Set(["active", "expired", "revoked"]);

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ licenseId: string }> },
) {
    const { response } = await requireAdminRequestSession();

    if (response) {
        return response;
    }

    const { licenseId } = await context.params;
    const body = (await request.json()) as { status?: unknown };
    const status = typeof body.status === "string" ? body.status : "";

    if (!ALLOWED_STATUSES.has(status)) {
        return Response.json({ error: "Unsupported license status." }, { status: 400 });
    }

    const license = await updateAdminLicenseStatus(licenseId, status);

    if (!license) {
        return Response.json({ error: "License not found." }, { status: 404 });
    }

    return Response.json({ license });
}
