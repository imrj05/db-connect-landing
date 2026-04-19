import { requireAdminRequestSession } from "@/lib/admin-auth";
import { deleteAdminActivation } from "@/lib/admin-server";

export async function DELETE(
    _request: Request,
    context: { params: Promise<{ activationId: string }> },
) {
    const { response } = await requireAdminRequestSession();

    if (response) {
        return response;
    }

    const { activationId } = await context.params;
    const deleted = await deleteAdminActivation(activationId);

    if (!deleted) {
        return Response.json({ error: "Activation not found." }, { status: 404 });
    }

    return Response.json({ ok: true });
}
