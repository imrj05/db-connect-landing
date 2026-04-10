import crypto from "crypto";
import { serverDatabases, ID, Permission, Role, Query, DB_ID, LICENSES_COLLECTION_ID } from "@/lib/appwrite-server";
import { PLANS } from "@/lib/plans";
import type { NextRequest } from "next/server";

function generateLicenseKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const seg = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `DBK-${seg()}-${seg()}-${seg()}-${seg()}`;
}

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId, userId } =
      await req.json();

    // 1. Verify Razorpay HMAC signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
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

    // 2. Resolve plan
    const plan = PLANS.find((p) => p.id === planId);
    if (!plan || !userId) {
      return Response.json({ error: "Invalid plan or missing userId" }, { status: 400 });
    }

    // 3. Expire any existing active license for this user
    const existing = await serverDatabases.listDocuments(DB_ID, LICENSES_COLLECTION_ID, [
      Query.equal("userId", userId),
      Query.equal("status", "active"),
    ]);
    for (const doc of existing.documents) {
      await serverDatabases.updateDocument(DB_ID, LICENSES_COLLECTION_ID, doc.$id, {
        status: "expired",
      });
    }

    // 4. Create new license using admin key (bypasses client permissions)
    const expiresAt = new Date(
      Date.now() + plan.durationDays * 86_400_000
    ).toISOString();

    const license = await serverDatabases.createDocument(
      DB_ID,
      LICENSES_COLLECTION_ID,
      ID.unique(),
      {
        userId,
        planId: plan.id,
        planName: plan.name,
        licenseKey: generateLicenseKey(),
        status: "active",
        expiresAt,
        maxDevices: plan.maxDevices,
        price: plan.price,
      },
      [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
      ]
    );

    return Response.json({ license });
  } catch (err: any) {
    return Response.json({ error: err.message ?? "Verification failed" }, { status: 500 });
  }
}
