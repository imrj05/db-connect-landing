import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import Razorpay from "razorpay";

import { ensureProfileForUser } from "@/lib/account-server";
import { auth } from "@/lib/auth";
import { PLANS } from "@/lib/plans";

const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
    key_secret: process.env.RAZORPAY_KEY_SECRET ?? "",
});

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { planId } = (await req.json()) as { planId?: string };

        const plan = PLANS.find((entry) => entry.id === planId);
        if (!plan) {
            return Response.json({ error: "Invalid plan" }, { status: 400 });
        }
        if (plan.price === 0) {
            return Response.json({ error: "Free plan does not require a payment order" }, { status: 400 });
        }
        if (!process.env.RAZORPAY_KEY_SECRET) {
            return Response.json({ error: "Razorpay is not configured on this server" }, { status: 503 });
        }

        await ensureProfileForUser(session.user);

        const order = await razorpay.orders.create({
            amount: plan.pricePaise,
            currency: "INR",
            receipt: `dbk_${session.user.id}_${planId}_${Date.now()}`.slice(0, 40),
            notes: {
                userId: session.user.id,
                planId: plan.id,
                email: session.user.email,
            },
        });

        return Response.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
        });
    } catch (error) {
        const maybeError = error as { message?: string };
        return Response.json({ error: maybeError.message ?? "Failed to create order" }, { status: 500 });
    }
}
