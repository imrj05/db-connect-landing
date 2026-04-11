/**
 * POST /api/subscription/webhook
 *
 * Razorpay webhook handler — receives payment events and creates licenses.
 *
 * Setup in Razorpay dashboard:
 *   Dashboard → Developers → Webhooks → Add New Webhook
 *   URL: https://your-domain.com/api/subscription/webhook
 *   Events: payment.captured
 *   Secret: (generate one, then set RAZORPAY_WEBHOOK_SECRET in .env)
 *
 * NOTE: The raw request body MUST NOT be parsed before HMAC verification.
 *       We use req.text() so the bytes are identical to what Razorpay signed.
 */

import crypto from "crypto";
import { serverDatabases, serverUsers, ID, Permission, Role, Query, DB_ID, LICENSES_COLLECTION_ID } from "@/lib/appwrite-server";
import { buildSignedLicenseData } from "@/lib/license/sign";
import { PLANS } from "@/lib/plans";
import type { NextRequest } from "next/server";
import { getErrorMessage } from "@/lib/utils";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateLicenseKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const seg = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `DBK-${seg()}-${seg()}-${seg()}-${seg()}`;
}

function getExpiryDate(durationDays: number): string {
  if (durationDays === 0) {
    return "lifetime";
  }

  return new Date(Date.now() + durationDays * 86_400_000).toISOString();
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface RazorpayPaymentEntity {
  id: string;
  order_id: string;
  status: string;
  amount: number;
  currency: string;
  notes: {
    userId?: string;
    planId?: string;
    [key: string]: string | undefined;
  };
}

interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment?: { entity: RazorpayPaymentEntity };
    order?: { entity: { id: string; notes: Record<string, string> } };
  };
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Read raw body — must happen before any parsing for HMAC to work
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  // 2. Verify webhook signature
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[webhook] RAZORPAY_WEBHOOK_SECRET is not set");
    return Response.json({ error: "Webhook secret not configured" }, { status: 503 });
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  if (expected !== signature) {
    console.warn("[webhook] Invalid signature — possible spoofed request");
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  // 3. Parse and route event
  let event: RazorpayWebhookPayload;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "Malformed JSON body" }, { status: 400 });
  }

  // Only process payment.captured (idempotent — safe to ignore other events)
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

  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) {
    console.error("[webhook] Unknown planId:", planId);
    return Response.json({ error: `Unknown planId: ${planId}` }, { status: 400 });
  }

  // 4. Idempotency check — skip if an active license already exists for this payment
  //    Razorpay retries webhooks on non-2xx, so always return 2xx after validation.
  try {
    const existing = await serverDatabases.listDocuments(DB_ID, LICENSES_COLLECTION_ID, [
      Query.equal("userId", userId),
      Query.equal("status", "active"),
      Query.equal("planId", planId),
      Query.greaterThan("$createdAt", new Date(Date.now() - 10 * 60 * 1000).toISOString()),
    ]);

    if (existing.documents.length > 0) {
      console.log("[webhook] License already exists for this payment — skipping duplicate");
      return Response.json({ received: true, skipped: "duplicate" });
    }
  } catch (err) {
    // If the idempotency query fails, continue — creating a duplicate is better than missing a license
    console.warn("[webhook] Idempotency check failed, proceeding:", err);
  }

  // 5. Expire any older active licenses for this user
  try {
    const stale = await serverDatabases.listDocuments(DB_ID, LICENSES_COLLECTION_ID, [
      Query.equal("userId", userId),
      Query.equal("status", "active"),
    ]);
    for (const doc of stale.documents) {
      await serverDatabases.updateDocument(DB_ID, LICENSES_COLLECTION_ID, doc.$id, {
        status: "expired",
      });
    }
  } catch (err) {
    console.error("[webhook] Failed to expire old licenses:", err);
    // Non-fatal — still create the new license
  }

  // 6. Create new license via admin SDK
  const user = await serverUsers.get(userId);
  const issuedAt = new Date().toISOString();
  const licenseKey = generateLicenseKey();
  const expiresAt = getExpiryDate(plan.durationDays);
  const signedLicense = await buildSignedLicenseData({
    email: user.email,
    expiry: expiresAt,
    issuedAt,
    licenseKey,
    maxDevices: plan.maxDevices,
    plan: plan.id,
  });

  try {
    await serverDatabases.createDocument(
      DB_ID,
      LICENSES_COLLECTION_ID,
      ID.unique(),
      {
        userId,
        planId: plan.id,
        planName: plan.name,
        ...signedLicense,
        status: "active",
        expiresAt,
        price: plan.price,
      },
      [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
      ]
    );

    console.log(`[webhook] License created for user ${userId} — plan: ${plan.name}`);
    return Response.json({ received: true });
  } catch (err: unknown) {
    console.error("[webhook] Failed to create license:", err);
    // Return 500 so Razorpay retries the webhook
    return Response.json({ error: getErrorMessage(err, "License creation failed") }, { status: 500 });
  }
}
