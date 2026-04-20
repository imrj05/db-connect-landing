"use client";

import React, { useEffect, useEffectEvent, useState } from "react";
import { useAppAnalytics } from "@/app/_components/AppAnalyticsProvider";
import { formatPlanPriceLabel, type ApplicationPlan, type PlanId } from "@/lib/plans";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    RiLoader5Line,
    RiCheckLine,
    RiFileCopyLine,
    RiCheckDoubleLine,
    RiComputerLine,
    RiDeleteBinLine,
    RiShieldCheckLine,
    RiTimeLine,
    RiDeviceLine,
    RiAppleLine,
    RiWindowsLine,
    RiTerminalLine,
    RiBankCardLine,
} from "react-icons/ri";
import { getErrorMessage } from "@/lib/utils";

type Profile = {
    id: string;
    name: string | null;
    email: string | null;
    created_at: string;
};

type License = {
    id: string;
    user_id: string;
    license_key: string;
    plan_id: string | null;
    plan_name: string | null;
    status: string;
    expires_at: string | null;
    max_devices: number;
    price: number;
    created_at: string;
};

type Activation = {
    id: string;
    license_id: string;
    device_id: string;
    device_name: string | null;
    activated_at: string;
    last_seen: string;
    platform: string | null;
};

type BillingResponse = {
    devices: Activation[];
    license: License | null;
    plans: ApplicationPlan[];
    user: Profile;
};

type RazorpayOrderResponse = {
    amount: number;
    currency: string;
    keyId: string;
    mode: "live" | "test";
    orderId: string;
    error?: string;
};

type RazorpayVerifyResponse = {
    license: License;
    error?: string;
};

type RazorpayConstructor = new (options: {
    key: string | undefined;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
    }) => Promise<void>;
    modal: { ondismiss: () => void };
    prefill: { name: string; email: string };
    theme: { color: string };
}) => { open: () => void };

function isLifetime(expiresAt: string): boolean {
    return (
        expiresAt === "lifetime" ||
        new Date(expiresAt).getFullYear() - new Date().getFullYear() > 20
    );
}

function daysRemaining(expiresAt: string): number {
    return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86_400_000));
}

function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
        const razorpayWindow = window as Window & { Razorpay?: RazorpayConstructor };
        if (razorpayWindow.Razorpay) { resolve(true); return; }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

function PlatformIcon({ platform }: { platform?: string | null }) {
    const p = platform?.toLowerCase() ?? "";
    if (p.includes("mac") || p.includes("darwin")) return <RiAppleLine size={15} />;
    if (p.includes("win")) return <RiWindowsLine size={15} />;
    if (p.includes("linux")) return <RiTerminalLine size={15} />;
    return <RiComputerLine size={15} />;
}

function LoadingState() {
    return (
        <div className="flex h-screen items-center justify-center">
            <RiLoader5Line className="animate-spin text-muted-foreground" size={28} />
        </div>
    );
}

export default function BillingPage() {
    const router = useRouter();
    const { trackEvent } = useAppAnalytics();
    const [user, setUser] = useState<Profile | null>(null);
    const [license, setLicense] = useState<License | null>(null);
    const [devices, setDevices] = useState<Activation[]>([]);
    const [plans, setPlans] = useState<ApplicationPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState<PlanId | null>(null);
    const [removingDevice, setRemovingDevice] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [showPlans, setShowPlans] = useState(false);

    const loadBilling = useEffectEvent(async () => {
        try {
            const response = await fetch("/api/account/billing", {
                cache: "no-store",
            });

            if (response.status === 401) {
                router.replace("/login");
                return;
            }

            const data = (await response.json()) as BillingResponse & { error?: string };
            if (!response.ok) {
                throw new Error(data.error ?? "Failed to load billing.");
            }

            setUser(data.user);
            setLicense(data.license);
            setDevices(data.devices);
            setPlans(data.plans);
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to load billing details."));
        }
    });

    useEffect(() => {
        const init = async () => {
            await loadBilling();
            setLoading(false);
        };
        void init();
    }, []);

    useEffect(() => {
        if (!license?.id) {
            return;
        }

        const syncDevices = () => {
            void loadBilling();
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                syncDevices();
            }
        };

        const intervalId = window.setInterval(() => {
            if (document.visibilityState === "visible") {
                syncDevices();
            }
        }, 20000);

        window.addEventListener("focus", syncDevices);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            window.clearInterval(intervalId);
            window.removeEventListener("focus", syncDevices);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [license?.id]);

    const createFreeLicense = async () => {
        const response = await fetch("/api/account/licenses/free", {
            method: "POST",
        });
        const data = (await response.json()) as { error?: string; license?: License };
        if (!response.ok || !data.license) {
            throw new Error(data.error ?? "Failed to activate the starter plan.");
        }

        setLicense(data.license);
        setDevices([]);
        setShowPlans(false);
        trackEvent("license_starter_activated", {
            plan: "starter",
        });
        toast.success("Starter plan activated!");
    };

    const handleRazorpayCheckout = async (planId: PlanId) => {
        const plan = plans.find((entry) => entry.id === planId);
        if (!plan || !user) {
            return;
        }
        setPurchasing(planId);
        trackEvent("billing_checkout_started", {
            plan: plan.id,
            price: plan.price,
        });

        try {
            const orderRes = await fetch("/api/subscription/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId }),
            });
            const orderData = await orderRes.json() as RazorpayOrderResponse;
            if (!orderRes.ok) throw new Error(orderData.error ?? "Failed to create order");

            const loaded = await loadRazorpayScript();
            if (!loaded) throw new Error("Failed to load Razorpay checkout. Check your connection.");

            await new Promise<void>((resolve, reject) => {
                const razorpayWindow = window as Window & { Razorpay?: RazorpayConstructor };
                const Razorpay = razorpayWindow.Razorpay;
                if (!Razorpay) {
                    reject(new Error("Razorpay checkout is unavailable."));
                    return;
                }

                const rzp = new Razorpay({
                    key: orderData.keyId,
                    amount: orderData.amount,
                    currency: orderData.currency,
                    name: "DBConnect",
                    description: `${plan.name} Plan`,
                    order_id: orderData.orderId,
                    handler: async (response: {
                        razorpay_order_id: string;
                        razorpay_payment_id: string;
                        razorpay_signature: string;
                    }) => {
                        try {
                            const verifyRes = await fetch("/api/subscription/verify", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                    planId,
                                }),
                            });
                            const verifyData = await verifyRes.json() as RazorpayVerifyResponse;
                            if (!verifyRes.ok) throw new Error(verifyData.error ?? "Verification failed");

                            setLicense(verifyData.license);
                            setDevices([]);
                            setShowPlans(false);
                            trackEvent("billing_checkout_succeeded", {
                                plan: plan.id,
                                price: plan.price,
                            });
                            toast.success(`${plan.name} plan activated!`);
                            resolve();
                        } catch (err: unknown) {
                            trackEvent("billing_checkout_failed", {
                                plan: plan.id,
                                stage: "verification",
                            });
                            toast.error(getErrorMessage(err, "Payment verified but license creation failed."));
                            reject(err);
                        }
                    },
                    modal: {
                        ondismiss: () => {
                            setPurchasing(null);
                            trackEvent("billing_checkout_cancelled", {
                                plan: plan.id,
                            });
                            reject(new Error("cancelled"));
                        },
                    },
                    prefill: { name: user.name ?? "", email: user.email ?? "" },
                    theme: { color: "#4f46e5" },
                });
                rzp.open();
            });
        } catch (err: unknown) {
            if (getErrorMessage(err, "") !== "cancelled") {
                trackEvent("billing_checkout_failed", {
                    plan: plan.id,
                    stage: "checkout",
                });
                toast.error(getErrorMessage(err, "Payment failed. Please try again."));
            }
        } finally {
            setPurchasing(null);
        }
    };

    const handleBuyPlan = async (planId: PlanId) => {
        if (planId === "starter") {
            setPurchasing("starter");
            try { await createFreeLicense(); } catch (err: unknown) { toast.error(getErrorMessage(err, "Failed to activate the starter plan.")); }
            finally { setPurchasing(null); }
        } else {
            await handleRazorpayCheckout(planId);
        }
    };

    const handleCopy = () => {
        if (!license) return;
        navigator.clipboard.writeText(license.license_key);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRemoveDevice = async (deviceId: string) => {
        setRemovingDevice(deviceId);
        try {
            const response = await fetch(`/api/account/activations/${deviceId}`, {
                method: "DELETE",
            });
            const data = (await response.json()) as { error?: string };
            if (!response.ok) {
                throw new Error(data.error ?? "Failed to remove device.");
            }
            setDevices((prev) => prev.filter((d) => d.id !== deviceId));
            trackEvent("license_device_removed", {
                source: "billing_dashboard",
            });
            toast.success("Device removed.");
        } catch (err: unknown) {
            trackEvent("license_device_remove_failed", {
                source: "billing_dashboard",
            });
            toast.error(getErrorMessage(err, "Failed to remove device."));
        } finally {
            setRemovingDevice(null);
        }
    };

    if (loading) {
        return <LoadingState />;
    }

    if (!license || showPlans) {
        return (
            <div className="space-y-6 p-2 md:p-0">
                <section className="dashboard-pane overflow-hidden p-6 md:p-8">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-foreground/12 to-transparent" />
                    <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <span className="eyebrow-label">Billing</span>
                            <h1 className="dashboard-heading">
                                {showPlans ? "Change plan" : "Choose a plan"}
                            </h1>
                            <p className="dashboard-subheading">
                                {showPlans
                                    ? "Select a new plan. Your current license will be replaced."
                                    : "Get a license to activate DBConnect on your devices."}
                            </p>
                        </div>
                        {showPlans && (
                            <button className="btn-secondary w-fit rounded-full px-3.5 py-2 text-[13px]" onClick={() => setShowPlans(false)}>
                                Cancel
                            </button>
                        )}
                    </div>
                </section>

                <div className="grid gap-4 xl:grid-cols-3">
                    {plans.map((plan) => {
                        const isCurrent = showPlans && license?.plan_id === plan.id;
                        const isBuying = purchasing === plan.id;
                        return (
                            <div
                                key={plan.id}
                                className={plan.isPopular ? "dashboard-section relative flex flex-col rounded-3xl border-brand/25 p-6" : "dashboard-section relative flex flex-col rounded-3xl p-6"}
                            >
                                {plan.isPopular && (
                                    <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-brand px-2.5 py-0.5 text-[11px] font-semibold text-brand-foreground">
                                        Most popular
                                    </span>
                                )}

                                <div className="mb-5">
                                    <p className="mb-1.5 text-[13px] font-semibold text-muted-foreground">
                                        {plan.name}
                                    </p>
                                    <p className="text-[26px] font-extrabold tracking-tight text-foreground">
                                        {plan.priceLabel}
                                    </p>
                                </div>

                                <ul className="mb-6 flex flex-1 flex-col gap-2">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex items-center gap-2 text-[13px] text-muted-foreground">
                                            <RiCheckLine size={14} className="shrink-0 text-brand" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    className={plan.isPopular ? "btn-primary w-full" : "btn-secondary w-full"}
                                    disabled={purchasing !== null || isCurrent}
                                    onClick={() => handleBuyPlan(plan.id)}
                                >
                                    {isBuying ? (
                                        <RiLoader5Line className="animate-spin" size={16} />
                                    ) : isCurrent ? (
                                        "Current plan"
                                    ) : plan.price === 0 ? (
                                        "Get started free"
                                    ) : (
                                        <span className="flex items-center justify-center gap-1.5">
                                            <RiBankCardLine size={15} />
                                            Pay with Razorpay
                                        </span>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <p className="flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
                    <RiBankCardLine size={13} />
                    Payments are processed securely via Razorpay. Your card details never touch our servers.
                </p>
            </div>
        );
    }

    const lifetime = isLifetime(license.expires_at || "");
    const days = lifetime ? Infinity : daysRemaining(license.expires_at || "");
    const currentPlan = plans.find((plan) => plan.id === license.plan_id);
    const isExpired = license.status === "expired" || (!lifetime && days === 0);
    const devicesFull = devices.length >= license.max_devices;

    return (
        <div className="space-y-6 p-2 md:p-0">
            <section className="dashboard-pane overflow-hidden p-6 md:p-8">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-foreground/12 to-transparent" />
                <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <span className="eyebrow-label">Subscription</span>
                        <h1 className="dashboard-heading">
                            Billing & License
                        </h1>
                        <p className="dashboard-subheading">
                            Manage your plan, license key, and registered devices.
                        </p>
                    </div>
                    <button
                        className="btn-secondary w-fit rounded-full px-3.5 py-2 text-[13px]"
                        onClick={() => {
                            trackEvent("billing_plan_selector_opened", {
                                current_plan: license.plan_id ?? "unknown",
                            });
                            setShowPlans(true);
                        }}
                    >
                        Change plan
                    </button>
                </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)]">
                <section className="dashboard-section">
                    <div className="dashboard-panel-header flex-col items-start md:flex-row md:items-center">
                        <div className="flex items-center gap-2.5">
                            <RiShieldCheckLine size={18} className="text-muted-foreground" />
                            <span className="text-sm font-semibold text-foreground">
                                {license.plan_name} Plan
                            </span>
                            <span className={isExpired ? "status-pill status-pill-neutral" : "status-pill status-pill-active"}>
                                {isExpired ? "Expired" : "Active"}
                            </span>
                        </div>
                        <span className="text-lg font-extrabold tracking-tight text-foreground">
                            {currentPlan?.priceLabel ?? formatPlanPriceLabel({
                                price: license.price,
                                durationDays: lifetime ? 0 : 30,
                            })}
                        </span>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between rounded-xl border border-border bg-elevated px-3.5 py-2.5">
                            <span className="font-mono text-[13px] tracking-[0.05em] text-foreground">
                                {license.license_key}
                            </span>
                            <button
                                onClick={handleCopy}
                                title="Copy license key"
                                className={copied ? "text-emerald-600 dark:text-emerald-300" : "text-muted-foreground transition-colors hover:text-foreground"}
                            >
                                {copied ? <RiCheckDoubleLine size={16} /> : <RiFileCopyLine size={16} />}
                            </button>
                        </div>

                        <div className="detail-row">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <RiTimeLine size={14} />
                                <span className="detail-label">Expires</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="detail-value">
                                    {lifetime
                                        ? "Lifetime"
                                        : license.expires_at
                                            ? new Date(license.expires_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                                            : "N/A"}
                                </span>
                                {!lifetime && !isExpired && (
                                    <span className={days <= 7 ? "status-pill status-pill-danger" : "status-pill status-pill-neutral"}>
                                        {days}d left
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="detail-row">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <RiDeviceLine size={14} />
                                <span className="detail-label">Devices</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={devicesFull ? "detail-value text-rose-600 dark:text-rose-300" : "detail-value"}>
                                    {devices.length} / {license.max_devices} used
                                </span>
                                <div className="flex gap-0.75">
                                    {Array.from({ length: license.max_devices }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={i < devices.length ? "size-2 rounded-full border border-border bg-brand" : "size-2 rounded-full border border-border bg-elevated"}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="dashboard-section">
                    <div className="dashboard-panel-header">
                        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <RiComputerLine size={15} className="text-muted-foreground" />
                            Active devices
                            <span className="status-pill status-pill-neutral ml-1">
                                {devices.length}
                            </span>
                        </h2>
                    </div>

                    {devices.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border bg-elevated px-5 py-7 text-center">
                            <RiComputerLine size={24} className="mx-auto mb-2 text-muted-foreground" />
                            <p className="text-[13px] font-medium text-muted-foreground">No devices registered yet</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Install DBConnect on your device and enter the license key to activate.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {devices.map((device) => (
                                <div
                                    key={device.id}
                                    className="flex items-center justify-between rounded-xl border border-border bg-elevated px-3.5 py-3"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="text-muted-foreground">
                                            <PlatformIcon platform={device.platform} />
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-medium text-foreground">{device.device_name}</p>
                                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                                                {device.platform && <span className="mr-1.5">{device.platform}</span>}
                                                Last seen {new Date(device.last_seen).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                            </p>
                                            <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                                                {device.device_id}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveDevice(device.id)}
                                        disabled={removingDevice === device.id}
                                        title="Remove device"
                                        className="p-1 text-muted-foreground transition-colors hover:text-rose-600 disabled:pointer-events-none disabled:opacity-50"
                                    >
                                        {removingDevice === device.id
                                            ? <RiLoader5Line className="animate-spin" size={15} />
                                            : <RiDeleteBinLine size={15} />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {devicesFull && (
                        <p className="mt-3 text-xs text-rose-600 dark:text-rose-300">
                            Device limit reached. Remove a device or upgrade your plan.
                        </p>
                    )}
                </section>
            </div>
        </div>
    );
}
