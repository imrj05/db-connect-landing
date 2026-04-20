import crypto from "crypto";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";

import {
    createLicenseForUser,
    ensureProfileForUser,
    generateLicenseKey,
    getExpiryDate,
    normalizeLicenseDocument,
} from "@/lib/account-server";
import { auth } from "@/lib/auth";
import { buildSignedLicenseData } from "@/lib/license/sign";
import { findPlanById } from "@/lib/plan-server";
import { getRazorpayConfig } from "@/lib/razorpay";
import { getErrorMessage } from "@/lib/utils";

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } =
            (await req.json()) as {
                planId?: string;
                razorpay_order_id?: string;
                razorpay_payment_id?: string;
                razorpay_signature?: string;
            };

        const secret = getRazorpayConfig().keySecret;
        if (!secret) {
            return Response.json({ error: "Razorpay not configured" }, { status: 503 });
        }

        const expected = crypto
            .createHmac("sha256", secret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (expected !== razorpay_signature) {
            return Response.json({ error: "Payment verification failed — invalid signature" }, { status: 400 });
        }

        const plan = planId ? await findPlanById(planId) : null;
        if (!plan || !plan.isActive) {
            return Response.json({ error: "Invalid plan" }, { status: 400 });
        }

        await ensureProfileForUser(session.user);

        const issuedAt = new Date().toISOString();
        const licenseKey = generateLicenseKey();
        const expiresAt = getExpiryDate(plan.durationDays);
        const signedLicense = await buildSignedLicenseData({
            email: session.user.email,
            expiry: expiresAt,
            issuedAt,
            licenseKey,
            maxDevices: plan.maxDevices,
            plan: plan.id,
        });

        const license = await createLicenseForUser({
            userId: session.user.id,
            email: session.user.email,
            expiresAt,
            issuedAt,
            licenseKey,
            maxDevices: plan.maxDevices,
            paymentReference: razorpay_payment_id,
            plan,
            signature: signedLicense.signature,
        });

        return Response.json({ license: normalizeLicenseDocument(license) });
    } catch (error: unknown) {
        return Response.json({ error: getErrorMessage(error, "Verification failed") }, { status: 500 });
    }
}
