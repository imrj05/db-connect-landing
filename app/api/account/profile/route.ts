import { headers } from "next/headers";

import { ensureProfileForUser, updateProfileName } from "@/lib/account-server";
import { auth } from "@/lib/auth";

export async function GET() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await ensureProfileForUser(session.user);

    return Response.json({
        user: {
            id: session.user.id,
            name: profile.name ?? session.user.name ?? null,
            email: profile.email,
            email_verified: session.user.emailVerified ?? false,
            created_at: profile.createdAt.toISOString(),
        },
    });
}

export async function PATCH(request: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
        name?: unknown;
    };
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!name) {
        return Response.json({ error: "Name is required" }, { status: 400 });
    }

    const updatedUser = await updateProfileName(session.user, name);
    return Response.json({ user: updatedUser });
}
