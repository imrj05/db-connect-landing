import { headers } from "next/headers";

import { getBillingData } from "@/lib/account-server";
import { auth } from "@/lib/auth";

export async function GET() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await getBillingData(session.user);
    return Response.json(data);
}
