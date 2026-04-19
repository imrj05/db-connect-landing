import type { NextRequest } from "next/server";

import { listAdminUsers } from "@/lib/admin-server";
import { requireAdminRequestSession } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
    const { response } = await requireAdminRequestSession();

    if (response) {
        return response;
    }

    const query = request.nextUrl.searchParams.get("query");
    const users = await listAdminUsers({ query });
    return Response.json({ users });
}
