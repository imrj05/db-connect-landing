import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/auth-server";

function getConfiguredAdminEmails() {
    return (process.env.ADMIN_EMAILS ?? "")
        .split(",")
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined) {
    if (!email) {
        return false;
    }

    return getConfiguredAdminEmails().includes(email.trim().toLowerCase());
}

export async function requireAdminRequestSession() {
    const session = await getServerSession();

    if (!session) {
        return {
            response: Response.json({ error: "Unauthorized" }, { status: 401 }),
            session: null,
        };
    }

    if (!isAdminEmail(session.user.email)) {
        return {
            response: Response.json({ error: "Forbidden" }, { status: 403 }),
            session: null,
        };
    }

    return {
        response: null,
        session,
    };
}

export async function requireAdminPageSession() {
    const session = await getServerSession();

    if (!session) {
        redirect("/login");
    }

    if (!isAdminEmail(session.user.email)) {
        redirect("/dashboard");
    }

    return session;
}
