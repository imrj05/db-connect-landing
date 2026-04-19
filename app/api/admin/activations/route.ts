import type { NextRequest } from "next/server";

import { requireAdminRequestSession } from "@/lib/admin-auth";
import { listAdminActivations } from "@/lib/admin-server";

export async function GET(request: NextRequest) {
    const { response } = await requireAdminRequestSession();

    if (response) {
        return response;
    }

    const query = request.nextUrl.searchParams.get("query");
    const planId = request.nextUrl.searchParams.get("planId");

    const items = await listAdminActivations({
        query,
        planId: planId && planId !== "all" ? planId : null,
    });

    return Response.json({ activations: items });
}
