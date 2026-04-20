/**
 * POST /api/subscription/webhook
 *
 * Razorpay webhook handler — receives payment events and creates licenses.
 */

import crypto from "crypto";
import type { NextRequest } from "next/server";

import { createLicenseForUser, findProfileByUserId, generateLicenseKey, getExpiryDate } from "@/lib/account-server";
import { buildSignedLicenseData } from "@/lib/license/sign";
import { findPlanById } from "@/lib/plan-server";
import { getRazorpayConfig } from "@/lib/razorpay";
import { getErrorMessage } from "@/lib/utils";

interface RazorpayPaymentEntity {
    amount: number;
    currency: string;
    id: string;
    notes: {
        email?: string;
        planId?: string;
        userId?: string;
        [key: string]: string | undefined;
    };
    order_id: string;
    status: string;
}

interface RazorpayWebhookPayload {
    event: string;
    payload: {
        payment?: { entity: RazorpayPaymentEntity };
    };
}

export async function POST(req: NextRequest) {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") ?? "";

    const secret = getRazorpayConfig().webhookSecret;
    if (!secret) {
        console.error("[webhook] RAZORPAY_WEBHOOK_SECRET is not set");
        return Response.json({ error: "Webhook secret not configured" }, { status: 503 });
    }

    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

    if (expected !== signature) {
        console.warn("[webhook] Invalid signature — possible spoofed request");
        return Response.json({ error: "Invalid signature" }, { status: 400 });
    }

    let event: RazorpayWebhookPayload;
    try {
        event = JSON.parse(rawBody) as RazorpayWebhookPayload;
    } catch {
        return Response.json({ error: "Malformed JSON body" }, { status: 400 });
    }

    if (event.event !== "payment.captured") {
        return Response.json({ received: true, skipped: event.event });
    }

    const payment = event.payload.payment?.entity;
    if (!payment) {
        return Response.json({ error: "Missing payment entity" }, { status: 400 });
    }

    const { userId, planId } = payment.notes;
    if (!userId || !planId) {
        console.error("[webhook] Missing userId or planId in payment notes", payment.notes);
        return Response.json({ error: "Missing userId or planId in payment notes" }, { status: 400 });
    }

    const plan = await findPlanById(planId);
    if (!plan || !plan.isActive) {
        console.error("[webhook] Unknown planId:", planId);
        return Response.json({ error: `Unknown planId: ${planId}` }, { status: 400 });
    }

    const profile = await findProfileByUserId(userId);
    const userEmail = payment.notes.email ?? profile?.email ?? "";
    if (!userEmail) {
        return Response.json({ error: "Missing user email for license issuance" }, { status: 400 });
    }

    const issuedAt = new Date().toISOString();
    const licenseKey = generateLicenseKey();
    const expiresAt = getExpiryDate(plan.durationDays);
    const signedLicense = await buildSignedLicenseData({
        email: userEmail,
        expiry: expiresAt,
        issuedAt,
        licenseKey,
        maxDevices: plan.maxDevices,
        plan: plan.id,
    });

    try {
        await createLicenseForUser({
            userId,
            email: userEmail,
            expiresAt,
            issuedAt,
            licenseKey,
            maxDevices: plan.maxDevices,
            paymentReference: payment.id,
            plan,
            signature: signedLicense.signature,
        });

        console.log(`[webhook] License created for user ${userId} — plan: ${plan.name}`);
        return Response.json({ received: true });
    } catch (error: unknown) {
        console.error("[webhook] Failed to create license:", error);
        return Response.json({ error: getErrorMessage(error, "License creation failed") }, { status: 500 });
    }
}
