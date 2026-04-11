import { RiCheckboxCircleFill, RiDownloadCloudFill, RiRocketFill } from "react-icons/ri";
import type { Models } from "node-appwrite";
import { SparkleIcon } from "./FeatureIcons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { serverDatabases, DB_ID, PLANS_COLLECTION_ID, Query } from "@/lib/appwrite-server";
import { PLANS as FALLBACK_PLANS } from "@/lib/plans";

type PricingPlan = {
    planId: string;
    name: string;
    priceLabel: string;
    price: number;
    maxDevices: number;
    durationDays: number;
    isPopular: boolean;
};

type PricingPlanDocument = Models.Document & PricingPlan;

function formatPlanTerm(durationDays: number) {
    if (durationDays === 0) return "Lifetime access";
    if (durationDays === 30) return "Billed every month";
    if (durationDays === 365) return "Billed yearly";
    return `Renews every ${durationDays} days`;
}

function getPlanHighlights(plan: PricingPlan) {
    return [
        `${plan.maxDevices} device${plan.maxDevices === 1 ? "" : "s"}`,
        formatPlanTerm(plan.durationDays),
        plan.price === 0 ? "No card required" : "Secure checkout via Razorpay",
        plan.price === 0 ? "Perfect for individual developers" : "License activates instantly after payment",
    ];
}

async function getPricingPlans(): Promise<PricingPlan[]> {
    try {
        const response = await serverDatabases.listDocuments<PricingPlanDocument>(DB_ID, PLANS_COLLECTION_ID, [
            Query.orderAsc("price"),
            Query.limit(100),
        ]);

        if (response.documents.length > 0) {
            return response.documents.map((plan) => ({
                planId: plan.planId,
                name: plan.name,
                priceLabel: plan.priceLabel,
                price: plan.price,
                maxDevices: plan.maxDevices,
                durationDays: plan.durationDays,
                isPopular: plan.isPopular,
            }));
        }
    } catch {
        // Fall through to the local fallback if Appwrite isn't reachable.
    }

    return FALLBACK_PLANS.map((plan) => ({
        planId: plan.id,
        name: plan.name,
        priceLabel: plan.priceLabel,
        price: plan.price,
        maxDevices: plan.maxDevices,
        durationDays: plan.durationDays,
        isPopular: plan.popular,
    }));
}

export default async function PricingSection() {
    const pricingPlans = await getPricingPlans();

    return (
        <section
            id="pricing"
            className="relative isolate overflow-hidden bg-background py-16 md:py-20"
        >
            <div className="section-price-glow mask-radial-fade pointer-events-none absolute inset-0 -z-10 opacity-50" />
            <div className="section-container relative">
                <div className="mb-10 text-center">
                    <Badge className="mb-4">Simple Pricing</Badge>
                    <h2 className="section-heading mb-4 leading-[1.15]">
                        Choose the plan that fits your team.
                    </h2>
                    <p className="section-copy max-w-145">
                        Compare every tier at a glance and pick the right level of access for
                        solo work, growing teams, or larger deployments.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {pricingPlans.map((plan) => {
                        const highlights = getPlanHighlights(plan);

                        return (
                            <div
                                key={plan.planId}
                                className={plan.isPopular
                                    ? "group relative rounded-2xl border border-brand/20 bg-card p-6 md:p-7"
                                    : "group relative rounded-2xl border border-border bg-card p-6 md:p-7"
                                }
                            >
                                {plan.isPopular && (
                                    <div className="absolute left-6 top-0 flex -translate-y-1/2 items-center gap-2 rounded-full border border-brand/15 bg-background px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand">
                                        <SparkleIcon size={14} className="animate-pulse text-brand" />
                                        Most Popular
                                    </div>
                                )}

                                <div className="mb-6 text-left">
                                    <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
                                        {plan.name}
                                    </div>
                                    <div className="mb-2 flex items-baseline gap-1.5">
                                        <span className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                                            {plan.price === 0 ? "$0" : plan.priceLabel.replace(/\/mo$/u, "")}
                                        </span>
                                        {plan.price > 0 && (
                                            <span className="text-base font-medium text-muted-foreground">/ month</span>
                                        )}
                                    </div>
                                    <p className="text-sm leading-6 text-muted-foreground">
                                        {formatPlanTerm(plan.durationDays)}
                                    </p>
                                </div>

                                <div className="mb-8 h-px bg-border" />

                                <div className="mb-8">
                                    <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/70">
                                        Included
                                    </div>
                                    <ul className="grid grid-cols-1 gap-2.5">
                                        {highlights.map((feature) => (
                                            <li
                                                key={feature}
                                                className="flex items-start gap-2.5 text-[13px] leading-5 text-muted-foreground"
                                            >
                                                <RiCheckboxCircleFill
                                                    className="mt-0.5 shrink-0 text-brand"
                                                    size={16}
                                                />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <Button asChild className="h-10 w-full justify-center gap-2 rounded-lg text-[13px] font-medium">
                                    <a href={plan.price === 0 ? "https://github.com/imrj05/db-connect/releases/latest" : "/login"}>
                                        {plan.price === 0 ? <RiDownloadCloudFill size={18} /> : <RiRocketFill size={18} />}
                                        {plan.price === 0 ? "Get Started for Free" : "Manage in Dashboard"}
                                    </a>
                                </Button>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 text-center">
                    <p className="mx-auto max-w-125 text-[13px] italic text-muted-foreground">
                        Plans shown here are synced from your Appwrite plans collection.
                    </p>
                </div>
            </div>
        </section>
    );
}
