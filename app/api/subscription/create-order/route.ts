import Razorpay from "razorpay";
import { PLANS } from "@/lib/plans";
import type { NextRequest } from "next/server";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
  key_secret: process.env.RAZORPAY_KEY_SECRET ?? "",
});

export async function POST(req: NextRequest) {
  try {
    const { planId, userId } = await req.json();

    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) {
      return Response.json({ error: "Invalid plan" }, { status: 400 });
    }
    if (plan.price === 0) {
      return Response.json({ error: "Free plan does not require a payment order" }, { status: 400 });
    }
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return Response.json({ error: "Razorpay is not configured on this server" }, { status: 503 });
    }

    const order = await razorpay.orders.create({
      amount: plan.pricePaise,
      currency: "INR",
      receipt: `dbk_${userId}_${planId}_${Date.now()}`.slice(0, 40),
      notes: { userId, planId },
    });

    return Response.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    const e = err as { message?: string };
    return Response.json({ error: e.message ?? "Failed to create order" }, { status: 500 });
  }
}
