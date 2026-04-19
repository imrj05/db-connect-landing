import type { NextRequest } from "next/server";

import { requireAdminRequestSession } from "@/lib/admin-auth";
import { updateAdminUserProfile } from "@/lib/admin-server";

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ userId: string }> },
) {
    const { response } = await requireAdminRequestSession();

    if (response) {
        return response;
    }

    const { userId } = await context.params;
    const body = (await request.json()) as { name?: unknown };
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (name.length < 2) {
        return Response.json({ error: "Name must be at least 2 characters." }, { status: 400 });
    }

    const user = await updateAdminUserProfile(userId, { name });

    if (!user) {
        return Response.json({ error: "User not found." }, { status: 404 });
    }

    return Response.json({ user });
}
