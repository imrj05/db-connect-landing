import type { NextRequest } from "next/server";

import { requireAdminRequestSession } from "@/lib/admin-auth";
import { listAdminLicenses } from "@/lib/admin-server";

export async function GET(request: NextRequest) {
    const { response } = await requireAdminRequestSession();

    if (response) {
        return response;
    }

    const query = request.nextUrl.searchParams.get("query");
    const status = request.nextUrl.searchParams.get("status");
    const planId = request.nextUrl.searchParams.get("planId");

    const licenses = await listAdminLicenses({
        query,
        status: status && status !== "all" ? status : null,
        planId: planId && planId !== "all" ? planId : null,
    });

    return Response.json({ licenses });
}
