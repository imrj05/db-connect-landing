import { headers } from "next/headers";

import { createLicenseForUser, ensureProfileForUser, generateLicenseKey, getExpiryDate, normalizeLicenseDocument } from "@/lib/account-server";
import { auth } from "@/lib/auth";
import { buildSignedLicenseData } from "@/lib/license/sign";
import { findPlanById } from "@/lib/plan-server";

export async function POST() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const plan = await findPlanById("starter");
    if (!plan || !plan.isActive) {
        return Response.json({ error: "Starter plan is unavailable" }, { status: 500 });
    }

    await ensureProfileForUser(session.user);

    const issuedAt = new Date().toISOString();
    const licenseKey = generateLicenseKey();
    const signed = await buildSignedLicenseData({
        email: session.user.email,
        expiry: getExpiryDate(plan.durationDays),
        issuedAt,
        licenseKey,
        maxDevices: plan.maxDevices,
        plan: plan.id,
    });

    const license = await createLicenseForUser({
        userId: session.user.id,
        email: session.user.email,
        expiresAt: signed.expiry,
        licenseKey,
        maxDevices: plan.maxDevices,
        plan,
        signature: signed.signature,
    });

    return Response.json({
        license: normalizeLicenseDocument(license),
    });
}
