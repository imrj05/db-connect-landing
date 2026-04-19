"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { RiDatabase2Line, RiLoader5Line, RiPriceTag3Line, RiStackLine, RiUserStarLine } from "react-icons/ri";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/utils";

type OverviewResponse = {
    counts: {
        activations: number;
        licenses: number;
        plans: number;
        users: number;
    };
    recentLicenses: Array<{
        created_at: string;
        email: string;
        id: string;
        plan_name: string | null;
        status: string;
    }>;
};

function LoadingState() {
    return (
        <div className="flex h-screen items-center justify-center">
            <RiLoader5Line className="animate-spin text-muted-foreground" size={28} />
        </div>
    );
}

export default function AdminOverviewPage() {
    const [data, setData] = useState<OverviewResponse | null>(null);
    const [loading, setLoading] = useState(true);

    const loadOverview = useEffectEvent(async () => {
        try {
            const response = await fetch("/api/admin/overview", { cache: "no-store" });
            const payload = (await response.json()) as OverviewResponse & { error?: string };

            if (!response.ok) {
                throw new Error(payload.error ?? "Failed to load admin overview.");
            }

            setData(payload);
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to load admin overview."));
        } finally {
            setLoading(false);
        }
    });

    useEffect(() => {
        void loadOverview();
    }, []);

    if (loading) {
        return <LoadingState />;
    }

    return (
        <div className="space-y-6 p-2 md:p-0">
            <section className="dashboard-pane overflow-hidden p-6 md:p-8">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-foreground/12 to-transparent" />
                <div className="relative z-10">
                    <span className="eyebrow-label">Admin</span>
                    <h1 className="dashboard-heading">Subscription control center</h1>
                    <p className="dashboard-subheading">
                        Monitor users, licenses, activations, and the plan catalog from one place.
                    </p>
                </div>
            </section>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                    { label: "Users", value: data?.counts.users ?? 0, icon: RiUserStarLine },
                    { label: "Licenses", value: data?.counts.licenses ?? 0, icon: RiStackLine },
                    { label: "Activations", value: data?.counts.activations ?? 0, icon: RiDatabase2Line },
                    { label: "Plans", value: data?.counts.plans ?? 0, icon: RiPriceTag3Line },
                ].map((item) => {
                    const Icon = item.icon;
                    return (
                        <section key={item.label} className="dashboard-kpi">
                            <div className="mb-4 flex items-center justify-between">
                                <span className="dashboard-kpi-label">{item.label}</span>
                                <span className="icon-tile"><Icon size={16} /></span>
                            </div>
                            <div className="dashboard-kpi-value">{item.value}</div>
                        </section>
                    );
                })}
            </div>

            <section className="dashboard-section">
                <div className="dashboard-panel-header">
                    <div>
                        <h2 className="text-sm font-semibold text-foreground">Recent license activity</h2>
                        <p className="text-xs text-muted-foreground">Most recent issued or updated licenses.</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                            <tr>
                                <th className="pb-3 pr-4 font-medium">Email</th>
                                <th className="pb-3 pr-4 font-medium">Plan</th>
                                <th className="pb-3 pr-4 font-medium">Status</th>
                                <th className="pb-3 font-medium">Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.recentLicenses.map((license) => (
                                <tr key={license.id} className="border-t border-border/70 align-top">
                                    <td className="py-3 pr-4 text-foreground">{license.email}</td>
                                    <td className="py-3 pr-4 text-muted-foreground">{license.plan_name ?? "Unknown"}</td>
                                    <td className="py-3 pr-4">
                                        <span className={license.status === "active" ? "status-pill status-pill-active" : license.status === "expired" ? "status-pill status-pill-neutral" : "status-pill status-pill-danger"}>
                                            {license.status}
                                        </span>
                                    </td>
                                    <td className="py-3 text-muted-foreground">
                                        {new Date(license.created_at).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
