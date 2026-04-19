"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { RiLoader5Line, RiRefreshLine, RiSearchLine } from "react-icons/ri";
import { toast } from "sonner";

import type { ApplicationPlan } from "@/lib/plans";
import { getErrorMessage } from "@/lib/utils";

type AdminLicense = {
    created_at: string;
    device_count: number;
    email: string;
    expires_at: string | null;
    id: string;
    license_key: string;
    max_devices: number;
    payment_reference: string | null;
    plan_id: string | null;
    plan_name: string | null;
    price: number;
    status: string;
    updated_at: string;
    user_id: string;
    user_name: string | null;
};

function LoadingState() {
    return (
        <div className="flex h-screen items-center justify-center">
            <RiLoader5Line className="animate-spin text-muted-foreground" size={28} />
        </div>
    );
}

export default function AdminLicensesPage() {
    const [licenses, setLicenses] = useState<AdminLicense[]>([]);
    const [plans, setPlans] = useState<ApplicationPlan[]>([]);
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState("all");
    const [planId, setPlanId] = useState("all");
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);

    const loadData = useEffectEvent(async () => {
        try {
            const params = new URLSearchParams();
            if (query.trim()) params.set("query", query.trim());
            if (status !== "all") params.set("status", status);
            if (planId !== "all") params.set("planId", planId);

            const [licenseResponse, planResponse] = await Promise.all([
                fetch(`/api/admin/licenses?${params.toString()}`, { cache: "no-store" }),
                fetch("/api/admin/plans", { cache: "no-store" }),
            ]);

            const licensePayload = (await licenseResponse.json()) as { error?: string; licenses?: AdminLicense[] };
            const planPayload = (await planResponse.json()) as { error?: string; plans?: ApplicationPlan[] };

            if (!licenseResponse.ok || !licensePayload.licenses) {
                throw new Error(licensePayload.error ?? "Failed to load licenses.");
            }
            if (!planResponse.ok || !planPayload.plans) {
                throw new Error(planPayload.error ?? "Failed to load plans.");
            }

            setLicenses(licensePayload.licenses);
            setPlans(planPayload.plans);
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to load licenses."));
        } finally {
            setLoading(false);
        }
    });

    useEffect(() => {
        void loadData();
    }, [query, status, planId]);

    const updateStatus = async (licenseId: string, nextStatus: string) => {
        setSavingId(licenseId);

        try {
            const response = await fetch(`/api/admin/licenses/${licenseId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: nextStatus }),
            });
            const payload = (await response.json()) as { error?: string; license?: { status: string } };

            if (!response.ok || !payload.license) {
                throw new Error(payload.error ?? "Failed to update license.");
            }

            setLicenses((current) => current.map((license) => (license.id === licenseId ? { ...license, status: payload.license?.status ?? license.status } : license)));
            toast.success("License status updated.");
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to update license."));
        } finally {
            setSavingId(null);
        }
    };

    if (loading) {
        return <LoadingState />;
    }

    return (
        <div className="space-y-6 p-2 md:p-0">
            <section className="dashboard-section">
                <div className="dashboard-panel-header flex-col items-start gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                        <span className="eyebrow-label">Admin</span>
                        <h1 className="dashboard-heading">Licenses</h1>
                        <p className="dashboard-subheading">Search licenses, filter by plan or status, and change validity state.</p>
                    </div>
                    <div className="grid w-full gap-3 md:grid-cols-[minmax(0,1fr)_160px_180px] xl:max-w-3xl">
                        <div className="form-input-wrap">
                            <RiSearchLine size={16} className="form-input-icon" />
                            <input value={query} onChange={(event) => setQuery(event.target.value)} className="form-input form-input-with-icon" placeholder="Search email, key, payment ref" />
                        </div>
                        <select value={status} onChange={(event) => setStatus(event.target.value)} className="form-input">
                            <option value="all">All statuses</option>
                            <option value="active">Active</option>
                            <option value="expired">Expired</option>
                            <option value="revoked">Revoked</option>
                        </select>
                        <select value={planId} onChange={(event) => setPlanId(event.target.value)} className="form-input">
                            <option value="all">All plans</option>
                            {plans.map((plan) => (
                                <option key={plan.id} value={plan.id}>{plan.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                            <tr>
                                <th className="pb-3 pr-4 font-medium">User</th>
                                <th className="pb-3 pr-4 font-medium">License</th>
                                <th className="pb-3 pr-4 font-medium">Plan</th>
                                <th className="pb-3 pr-4 font-medium">Devices</th>
                                <th className="pb-3 pr-4 font-medium">Status</th>
                                <th className="pb-3 font-medium">Update</th>
                            </tr>
                        </thead>
                        <tbody>
                            {licenses.map((license) => (
                                <tr key={license.id} className="border-t border-border/70 align-top">
                                    <td className="py-3 pr-4">
                                        <div className="font-medium text-foreground">{license.user_name ?? "Unnamed user"}</div>
                                        <div className="text-muted-foreground">{license.email}</div>
                                    </td>
                                    <td className="py-3 pr-4 text-muted-foreground">
                                        <div className="font-mono text-[12px] text-foreground">{license.license_key}</div>
                                        <div>{license.payment_reference ?? "No payment ref"}</div>
                                    </td>
                                    <td className="py-3 pr-4 text-muted-foreground">
                                        <div>{license.plan_name ?? "Unknown"}</div>
                                        <div>{license.price === 0 ? "Free" : `₹${license.price}`}</div>
                                    </td>
                                    <td className="py-3 pr-4 text-muted-foreground">{license.device_count} / {license.max_devices}</td>
                                    <td className="py-3 pr-4">
                                        <span className={license.status === "active" ? "status-pill status-pill-active" : license.status === "expired" ? "status-pill status-pill-neutral" : "status-pill status-pill-danger"}>
                                            {license.status}
                                        </span>
                                    </td>
                                    <td className="py-3">
                                        <div className="flex gap-2">
                                            <select
                                                value={license.status}
                                                onChange={(event) => updateStatus(license.id, event.target.value)}
                                                className="form-input h-10 min-w-[140px]"
                                                disabled={savingId === license.id}
                                            >
                                                <option value="active">active</option>
                                                <option value="expired">expired</option>
                                                <option value="revoked">revoked</option>
                                            </select>
                                            {savingId === license.id && <RiRefreshLine className="animate-spin text-muted-foreground" size={16} />}
                                        </div>
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
