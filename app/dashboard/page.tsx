"use client";
import React, { useEffect, useEffectEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    RiLoader5Line,
    RiUserLine,
    RiShieldCheckLine,
    RiTimeLine,
    RiPriceTag3Line,
    RiDeviceLine,
    RiFileCopyLine,
    RiCheckDoubleLine,
    RiArrowRightLine,
    RiErrorWarningLine,
    RiMailLine,
    RiVerifiedBadgeLine,
    RiCalendarLine,
    RiSettings3Line,
    RiLoginBoxLine,
} from "react-icons/ri";

type Profile = {
    id: string;
    name: string | null;
    email: string | null;
    email_verified?: boolean;
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

type OverviewResponse = {
    deviceCount: number;
    license: License | null;
    user: Profile;
};

function isLifetime(expiresAt: string) {
    return expiresAt === "lifetime" || new Date(expiresAt).getFullYear() - new Date().getFullYear() > 20;
}

function daysRemaining(expiresAt: string) {
    return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86_400_000));
}

function getInitials(name: string, email: string) {
    if (name) {
        const parts = name.trim().split(" ");
        return parts.length >= 2
            ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
            : name.slice(0, 2).toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
}

function LoadingState() {
    return (
        <div className="flex h-screen items-center justify-center">
            <RiLoader5Line className="animate-spin text-muted-foreground" size={28} />
        </div>
    );
}

function DashboardStateNotice({
    title,
    description,
    primaryHref,
    primaryLabel,
    secondaryHref,
    secondaryLabel,
}: {
    title: string;
    description: string;
    primaryHref: string;
    primaryLabel: string;
    secondaryHref?: string;
    secondaryLabel?: string;
}) {
    return (
        <section className="dashboard-section mx-auto flex max-w-xl flex-col items-center gap-4 px-6 py-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-border bg-elevated">
                <RiErrorWarningLine size={20} className="text-muted-foreground" />
            </div>
            <div className="space-y-1.5">
                <h1 className="text-lg font-semibold tracking-tight text-foreground">{title}</h1>
                <p className="text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
                <Link href={primaryHref} className="btn-primary inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px]">
                    <RiLoginBoxLine size={15} />
                    {primaryLabel}
                </Link>
                {secondaryHref && secondaryLabel && (
                    <Link href={secondaryHref} className="btn-secondary rounded-full px-4 py-2 text-[13px]">
                        {secondaryLabel}
                    </Link>
                )}
            </div>
        </section>
    );
}

function Divider() {
    return <div className="h-px bg-border" />;
}

function isTokenError(error: unknown) {
    if (typeof error !== "object" || error === null) return false;
    const maybeError = error as { code?: unknown; message?: unknown };
    const message = typeof maybeError.message === "string" ? maybeError.message.toLowerCase() : "";
    return maybeError.code === 401 || message.includes("token") || message.includes("expired");
}

function DashboardContent() {
    const router = useRouter();
    const [user, setUser] = useState<Profile | null>(null);
    const [license, setLicense] = useState<License | null>(null);
    const [deviceCount, setDeviceCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [redirectingToLogin, setRedirectingToLogin] = useState(false);

    const loadOverview = useEffectEvent(async () => {
        try {
            setErrorMessage(null);
            const response = await fetch("/api/account/overview", {
                cache: "no-store",
            });

            if (response.status === 401) {
                setRedirectingToLogin(true);
                router.replace("/login");
                return;
            }

            const data = (await response.json()) as OverviewResponse & { error?: string };
            if (!response.ok) {
                throw new Error(data.error ?? "Failed to load dashboard.");
            }

            setUser(data.user);
            setLicense(data.license);
            setDeviceCount(data.deviceCount);
        } catch (error) {
            const maybeError = error as { message?: string };
            setErrorMessage(maybeError.message ?? "We couldn't load your account details. Please try again.");
        }
    });

    useEffect(() => {
        const init = async () => {
            try {
                await loadOverview();
            } catch (err: unknown) {
                if (isTokenError(err)) {
                    setRedirectingToLogin(true);
                    router.replace("/login");
                } else {
                    setErrorMessage(
                        err instanceof Error
                            ? err.message
                            : "We couldn't load your account details. Please try again."
                    );
                }
            } finally {
                setLoading(false);
            }
        };
        void init();
    }, [router]);

    useEffect(() => {
        if (!license?.id) {
            return;
        }

        const syncDeviceCount = () => {
            void loadOverview();
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                syncDeviceCount();
            }
        };

        const intervalId = window.setInterval(() => {
            if (document.visibilityState === "visible") {
                syncDeviceCount();
            }
        }, 20000);

        window.addEventListener("focus", syncDeviceCount);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            window.clearInterval(intervalId);
            window.removeEventListener("focus", syncDeviceCount);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [license?.id]);

    const handleCopy = () => {
        if (!license) return;
        navigator.clipboard.writeText(license.license_key);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    if (loading) return <LoadingState />;
    if (!user) {
        if (redirectingToLogin) return <LoadingState />;
        return (
            <DashboardStateNotice
                title="Dashboard unavailable"
                description={errorMessage ?? "Your session could not be restored. Sign in again to load your dashboard."}
                primaryHref="/login"
                primaryLabel="Go to login"
                secondaryHref="/signup"
                secondaryLabel="Create account"
            />
        );
    }
    const lifetime = license ? isLifetime(license.expires_at || "") : false;
    const days = license && !lifetime && license.expires_at ? daysRemaining(license.expires_at) : null;
    const isExpiringSoon = days !== null && days <= 7;
    const isExpired = license?.status === "expired" || (days !== null && days === 0);
    const devicePct = license ? Math.min(100, Math.round((deviceCount / license.max_devices) * 100)) : 0;
    return (
        <div className="space-y-5 p-2 md:p-0">
            <section className="dashboard-pane overflow-hidden p-6">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-foreground/12 to-transparent" />
                <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <span className="eyebrow-label">Dashboard</span>
                        <h1 className="dashboard-heading mt-1.5">Overview</h1>
                        <p className="dashboard-subheading mt-1 max-w-xl">
                            Manage your profile, license, and device access all from one place.
                        </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                        <Link href="/dashboard/billing" className="btn-secondary rounded-full px-4 py-2 text-[13px]">
                            Billing
                        </Link>
                        <Link href="/dashboard/profile" className="btn-primary rounded-full px-4 py-2 text-[13px]">
                            Edit profile
                        </Link>
                    </div>
                </div>
            </section>
            <div className="grid gap-5 md:grid-cols-2">
                <section className="dashboard-section flex flex-col gap-0">
                    <div className="dashboard-panel-header">
                        <div className="flex items-center gap-2">
                            <RiUserLine size={15} className="text-muted-foreground" />
                            <span className="text-sm font-semibold text-foreground">Profile</span>
                        </div>
                        <Link href="/dashboard/profile" className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                            <RiSettings3Line size={13} /> Edit
                        </Link>
                    </div>
                    <div className="flex items-center gap-4 pb-4">
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-border bg-elevated text-lg font-semibold text-foreground">
                            {getInitials(user.name ?? "", user.email ?? "")}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-[15px] font-semibold text-foreground">
                                {user.name || "Unnamed user"}
                            </p>
                            <p className="truncate text-[13px] text-muted-foreground">{user.email}</p>
                        </div>
                    </div>
                    <Divider />
                    <div className="flex flex-col gap-3 pt-4">
                        <div className="detail-row">
                            <span className="detail-label flex items-center gap-1.5">
                                <RiMailLine size={13} /> Email
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="detail-value truncate">{user.email}</span>
                                <span className="status-pill status-pill-active">Verified</span>
                            </div>
                        </div>
                        <Divider />
                        <div className="detail-row">
                            <span className="detail-label flex items-center gap-1.5">
                                <RiVerifiedBadgeLine size={13} /> Status
                            </span>
                            <span className="status-pill status-pill-active">Active</span>
                        </div>
                        <Divider />
                        <div className="detail-row">
                            <span className="detail-label flex items-center gap-1.5">
                                <RiCalendarLine size={13} /> Member since
                            </span>
                            <span className="detail-value">
                                {new Date(user.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                        </div>
                    </div>
                </section>
                <section className="dashboard-section flex flex-col gap-0">
                    <div className="dashboard-panel-header">
                        <div className="flex items-center gap-2">
                            <RiPriceTag3Line size={15} className="text-muted-foreground" />
                            <span className="text-sm font-semibold text-foreground">Plan</span>
                        </div>
                        <Link href="/dashboard/billing" className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                            Manage <RiArrowRightLine size={13} />
                        </Link>
                    </div>
                    {license ? (
                        <div className="flex flex-col gap-0">
                            <div className="flex items-center justify-between gap-3 pb-4">
                                <div>
                                    <p className="text-[15px] font-semibold text-foreground">{license.plan_name}</p>
                                    <p className="mt-0.5 text-[13px] text-muted-foreground">
                                        {license.price === 0 ? "Free forever" : `₹${license.price}/mo`}
                                    </p>
                                </div>
                                <span className={isExpired ? "status-pill status-pill-danger" : "status-pill status-pill-active"}>
                                    {isExpired ? "Expired" : "Active"}
                                </span>
                            </div>
                            <Divider />
                            <div className="flex flex-col gap-3 pt-4">
                                <div className="detail-row">
                                    <span className="detail-label flex items-center gap-1.5">
                                        <RiTimeLine size={13} /> Expires
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="detail-value">
                                            {lifetime ? "Lifetime" : license.expires_at ? new Date(license.expires_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                                        </span>
                                        {!lifetime && days !== null && (
                                            <span className={isExpiringSoon ? "status-pill status-pill-danger" : "status-pill status-pill-neutral"}>
                                                {days === 0 ? "Expired" : `${days}d left`}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <Divider />
                                <div className="flex flex-col gap-2">
                                    <div className="detail-row">
                                        <span className="detail-label flex items-center gap-1.5">
                                            <RiDeviceLine size={13} /> Devices
                                        </span>
                                        <span className={deviceCount >= license.max_devices ? "detail-value text-rose-600 dark:text-rose-300" : "detail-value"}>
                                            {deviceCount} / {license.max_devices} used
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-elevated">
                                        <div
                                            className={`h-full rounded-full transition-all ${devicePct >= 100 ? "bg-rose-500" : devicePct >= 75 ? "bg-amber-500" : "bg-brand"}`}
                                            style={{ width: `${devicePct}%` }}
                                        />
                                    </div>
                                </div>
                                <Divider />
                                <div className="detail-row">
                                    <span className="detail-label flex items-center gap-1.5">
                                        <RiShieldCheckLine size={13} /> Key
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-[12px] tracking-[0.05em] text-foreground">
                                            {license.license_key}
                                        </span>
                                        <button
                                            onClick={handleCopy}
                                            title="Copy license key"
                                            className={copied ? "shrink-0 text-emerald-600 dark:text-emerald-300" : "shrink-0 text-muted-foreground transition-colors hover:text-foreground"}
                                        >
                                            {copied ? <RiCheckDoubleLine size={14} /> : <RiFileCopyLine size={14} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {isExpiringSoon && !isExpired && (
                                <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-600 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
                                    <RiErrorWarningLine size={15} className="shrink-0" />
                                    Your license expires in {days} day{days !== 1 ? "s" : ""}.{" "}
                                    <Link href="/dashboard/billing" className="font-semibold underline-offset-2 hover:underline">Renew now →</Link>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8 text-center">
                            <div className="flex size-12 items-center justify-center rounded-2xl border border-border bg-elevated">
                                <RiPriceTag3Line size={20} className="text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">No active plan</p>
                                <p className="mt-1 text-[13px] text-muted-foreground">Choose a plan to start using DBConnect on your devices.</p>
                            </div>
                            <Link href="/dashboard/billing" className="btn-primary px-4 py-2 text-[13px]">
                                Get a plan
                            </Link>
                        </div>
                    )}
                </section>
            </div>
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                {[
                    {
                        label: "Account",
                        icon: <RiUserLine size={14} />,
                        value: user.name || "—",
                        sub: user.email || "",
                    },
                    {
                        label: "Plan",
                        icon: <RiPriceTag3Line size={14} />,
                        value: license ? license.plan_name || "None" : "None",
                        sub: license ? (license.price === 0 ? "Free forever" : `₹${license.price}/mo`) : "No active plan",
                    },
                    {
                        label: "Devices",
                        icon: <RiDeviceLine size={14} />,
                        value: license ? `${deviceCount} / ${license.max_devices}` : "—",
                        sub: license ? "Active device slots" : "No license active",
                    },
                    {
                        label: "Expires",
                        icon: <RiTimeLine size={14} />,
                        value: !license ? "—" : lifetime ? "Lifetime" : `${days} days`,
                        sub: !license ? "No active license" : lifetime ? "No renewal needed" : isExpired ? "License expired" : isExpiringSoon ? "Renew soon" : "License healthy",
                    },
                ].map(({ label, icon, value, sub }) => (
                    <div key={label} className="dashboard-kpi flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            {icon}
                            <span className="dashboard-kpi-label">{label}</span>
                        </div>
                        <div>
                            <p className="dashboard-kpi-value truncate">{value}</p>
                            <p className="dashboard-kpi-copy mt-1 truncate">{sub}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <React.Suspense fallback={<LoadingState />}>
            <DashboardContent />
        </React.Suspense>
    );
}
