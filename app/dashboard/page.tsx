"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { account, databases, DB_ID, LICENSES_COLLECTION_ID, DEVICES_COLLECTION_ID } from "@/lib/appwrite";
import { Query } from "appwrite";
import { useRouter, useSearchParams } from "next/navigation";
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
} from "react-icons/ri";
import type { Models } from "appwrite";

type License = Models.Document & {
    planId: string;
    planName: string;
    licenseKey: string;
    status: "active" | "expired";
    expiresAt: string;
    maxDevices: number;
    price: number;
};

function isLifetime(expiresAt: string) {
    return expiresAt === "lifetime" || new Date(expiresAt).getFullYear() - new Date().getFullYear() > 20;
}

function daysRemaining(expiresAt: string) {
    return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86_400_000));
}

function LoadingState() {
    return (
        <div className="flex h-screen items-center justify-center">
            <RiLoader5Line className="animate-spin text-muted-foreground" size={28} />
        </div>
    );
}

function Divider() {
    return <div className="h-px bg-border" />;
}

function isTokenError(error: unknown) {
    if (typeof error !== "object" || error === null) {
        return false;
    }

    const maybeError = error as { code?: unknown; message?: unknown };
    const message = typeof maybeError.message === "string" ? maybeError.message.toLowerCase() : "";

    return (
        maybeError.code === 401 ||
        message.includes("token") ||
        message.includes("expired")
    );
}

function DashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
    const [license, setLicense] = useState<License | null>(null);
    const [deviceCount, setDeviceCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                const userId = searchParams.get("userId");
                const secret = searchParams.get("secret");

                if (userId && secret) {
                    try {
                        await account.createSession(userId, secret);
                    } catch (err: unknown) {
                        // Token already used or expired — try getting existing session instead
                        // This handles the case where the user refreshes /dashboard?userId=X&secret=Y
                        if (!isTokenError(err)) {
                            throw err;
                        }
                    }
                    window.history.replaceState({}, "", "/dashboard");
                }

                const me = await account.get();
                setUser(me);

                // Fetch active license
                const licRes = await databases.listDocuments<License>(DB_ID, LICENSES_COLLECTION_ID, [
                    Query.equal("userId", me.$id),
                    Query.equal("status", "active"),
                    Query.orderDesc("$createdAt"),
                    Query.limit(1),
                ]);

                if (licRes.documents.length > 0) {
                    const lic = licRes.documents[0];
                    setLicense(lic);

                    // Fetch device count
                    if (DEVICES_COLLECTION_ID) {
                        try {
                            const devRes = await databases.listDocuments(DB_ID, DEVICES_COLLECTION_ID, [
                                Query.equal("licenseId", lic.$id),
                            ]);
                            setDeviceCount(devRes.total);
                        } catch {
                            // Devices collection may not be set up yet
                        }
                    }
                }
            } catch (err: unknown) {
                if (isTokenError(err)) {
                    router.replace("/login");
                }
                // Non-auth errors (network, permissions on licenses collection, etc.)
                // should not log the user out — just stop loading
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [router, searchParams]);

    const handleCopy = () => {
        if (!license) return;
        navigator.clipboard.writeText(license.licenseKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return <LoadingState />;
    }

    if (!user) return null;

    const lifetime = license ? isLifetime(license.expiresAt) : false;
    const days = license && !lifetime ? daysRemaining(license.expiresAt) : null;
    const isExpiringSoon = days !== null && days <= 7;
    const isExpired = license?.status === "expired" || (days !== null && days === 0);

    return (
        <div className="space-y-6 p-2 md:p-0">
            <section className="dashboard-pane overflow-hidden p-6 md:p-8">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-foreground/12 to-transparent" />
                <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <span className="eyebrow-label">Dashboard</span>
                        <h1 className="dashboard-heading mt-2">
                            Overview
                        </h1>
                        <p className="dashboard-subheading max-w-2xl">
                            Welcome back{user.name ? `, ${user.name}` : ""}. Track your license health, device usage, and account status from one place.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Link href="/dashboard/billing" className="btn-secondary rounded-full px-4 py-2 text-[13px]">
                            Manage billing
                        </Link>
                        <Link href="/dashboard/profile" className="btn-primary rounded-full px-4 py-2 text-[13px]">
                            Update profile
                        </Link>
                    </div>
                </div>
            </section>

            <div className="grid gap-4 xl:grid-cols-4">
                <div className="dashboard-kpi flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <RiUserLine size={14} />
                        <span className="dashboard-kpi-label">Account</span>
                    </div>
                    <div>
                        <p className="dashboard-kpi-value">{user.name || "—"}</p>
                        <p className="dashboard-kpi-copy mt-1">{user.email}</p>
                    </div>
                </div>

                <div className="dashboard-kpi flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <RiPriceTag3Line size={14} />
                        <span className="dashboard-kpi-label">Plan</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="dashboard-kpi-value">
                                {license ? license.planName : "No plan"}
                            </p>
                            <p className="dashboard-kpi-copy mt-1">
                                {license ? (license.price === 0 ? "Free forever" : `₹${license.price}/mo`) : "Choose a plan to get started"}
                            </p>
                        </div>
                        {license && (
                            <span
                                className={isExpired ? "status-pill status-pill-neutral" : "status-pill status-pill-active"}
                            >
                                {isExpired ? "Expired" : "Active"}
                            </span>
                        )}
                    </div>
                </div>

                <div className="dashboard-kpi flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <RiDeviceLine size={14} />
                        <span className="dashboard-kpi-label">Devices</span>
                    </div>
                    <div>
                        <p className="dashboard-kpi-value">
                            {license ? `${deviceCount} / ${license.maxDevices}` : "—"}
                        </p>
                        <p className="dashboard-kpi-copy mt-1">
                            {license ? "Active device slots" : "No license active"}
                        </p>
                    </div>
                </div>

                <div className="dashboard-kpi flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <RiTimeLine size={14} />
                        <span className="dashboard-kpi-label">Renewal</span>
                    </div>
                    <div>
                        <p className="dashboard-kpi-value">
                            {!license ? "—" : lifetime ? "Lifetime" : `${days} days`}
                        </p>
                        <p className="dashboard-kpi-copy mt-1">
                            {!license ? "No active license" : lifetime ? "No renewal required" : isExpired ? "License expired" : isExpiringSoon ? "Renew soon" : "License healthy"}
                        </p>
                    </div>
                </div>
            </div>

            {license ? (
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)]">
                    <section className="dashboard-section">
                        <div className="dashboard-panel-header">
                            <div className="flex items-center gap-2 text-foreground">
                                <RiShieldCheckLine size={16} className="text-muted-foreground" />
                                <span className="text-sm font-semibold">License</span>
                            </div>
                            <Link
                                href="/dashboard/billing"
                                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Manage <RiArrowRightLine size={13} />
                            </Link>
                        </div>

                        <div className="flex flex-col gap-3.5">
                            <div className="detail-row">
                                <span className="detail-label min-w-24">License key</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-[13px] tracking-[0.05em] text-foreground">
                                        {license.licenseKey}
                                    </span>
                                    <button
                                        onClick={handleCopy}
                                        title="Copy"
                                        className={copied ? "text-emerald-600 dark:text-emerald-300" : "text-muted-foreground transition-colors hover:text-foreground"}
                                    >
                                        {copied ? <RiCheckDoubleLine size={14} /> : <RiFileCopyLine size={14} />}
                                    </button>
                                </div>
                            </div>

                            <Divider />

                            <div className="detail-row">
                                <span className="detail-label min-w-24">Expires</span>
                                <div className="flex items-center gap-2">
                                    <span className="detail-value">
                                        {lifetime
                                            ? "Lifetime"
                                            : new Date(license.expiresAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                                    </span>
                                    {!lifetime && days !== null && (
                                        <span className={isExpiringSoon ? "status-pill status-pill-danger" : "status-pill status-pill-neutral"}>
                                            {days === 0 ? "Expired" : `${days}d left`}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <Divider />

                            <div className="detail-row">
                                <span className="detail-label min-w-24">Activated</span>
                                <span className="detail-value">
                                    {new Date(license.$createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                                </span>
                            </div>

                            <Divider />

                            <div className="detail-row">
                                <span className="detail-label min-w-24">Devices</span>
                                <div className="flex items-center gap-2">
                                    <span className={deviceCount >= license.maxDevices ? "detail-value text-rose-600 dark:text-rose-300" : "detail-value"}>
                                        {deviceCount} / {license.maxDevices} used
                                    </span>
                                    <div className="flex gap-0.75">
                                        {Array.from({ length: license.maxDevices }).map((_, i) => (
                                            <div
                                                key={i}
                                                className={i < deviceCount ? "size-2 rounded-full border border-border bg-brand" : "size-2 rounded-full border border-border bg-elevated"}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {isExpiringSoon && !isExpired && (
                            <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-600 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
                                <RiErrorWarningLine size={15} className="shrink-0" />
                                <span>
                                    Your license expires in {days} day{days !== 1 ? "s" : ""}. <Link href="/dashboard/billing" className="font-semibold underline-offset-2 hover:underline">Renew now →</Link>
                                </span>
                            </div>
                        )}
                    </section>

                    <section className="dashboard-section">
                        <div className="dashboard-panel-header">
                            <div className="flex items-center gap-2 text-foreground">
                                <RiTimeLine size={15} className="text-muted-foreground" />
                                <span className="text-sm font-semibold">Account</span>
                            </div>
                            <Link href="/dashboard/profile" className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                                Edit <RiArrowRightLine size={13} />
                            </Link>
                        </div>
                        <div className="flex flex-col gap-3">
                            {[
                                { label: "Name", value: user.name || "—" },
                                { label: "Email", value: user.email },
                                {
                                    label: "Verification",
                                    value: user.emailVerification ? "Verified" : "Not verified",
                                    highlight: user.emailVerification,
                                },
                                {
                                    label: "Member since",
                                    value: new Date(user.$createdAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }),
                                },
                            ].map(({ label, value, highlight }, i, arr) => (
                                <React.Fragment key={label}>
                                    <div className="detail-row">
                                        <span className="detail-label">{label}</span>
                                        <span className={highlight === true ? "detail-value text-emerald-600 dark:text-emerald-300" : highlight === false ? "detail-value text-rose-600 dark:text-rose-300" : "detail-value"}>
                                            {value}
                                        </span>
                                    </div>
                                    {i < arr.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </div>
                    </section>
                </div>
            ) : (
                <div className="dashboard-section flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <p className="text-sm font-semibold text-foreground">No active license</p>
                        <p className="mt-1 text-[13px] text-muted-foreground">
                            Choose a plan to activate DBConnect on your devices.
                        </p>
                    </div>
                    <Link href="/dashboard/billing" className="btn-primary whitespace-nowrap px-4.5 py-2 text-[13px]">
                        Get a plan
                    </Link>
                </div>
            )}
        </div>
    );
}

export default function DashboardPage() {
    return (
        <React.Suspense
            fallback={<LoadingState />}
        >
            <DashboardContent />
        </React.Suspense>
    );
}
