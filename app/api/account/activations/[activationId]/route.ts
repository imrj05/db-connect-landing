import { headers } from "next/headers";

import { deleteActivationForUser } from "@/lib/account-server";
import { auth } from "@/lib/auth";

export async function DELETE(
    _request: Request,
    context: { params: Promise<{ activationId: string }> },
) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { activationId } = await context.params;
    const deleted = await deleteActivationForUser(session.user.id, activationId);

    if (!deleted) {
        return Response.json({ error: "Activation not found" }, { status: 404 });
    }

    return Response.json({ ok: true });
}
