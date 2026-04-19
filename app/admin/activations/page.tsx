"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { RiDeleteBinLine, RiLoader5Line, RiSearchLine } from "react-icons/ri";
import { toast } from "sonner";

import type { ApplicationPlan } from "@/lib/plans";
import { getErrorMessage } from "@/lib/utils";

type AdminActivation = {
    activated_at: string;
    device_id: string;
    device_name: string | null;
    email: string;
    id: string;
    last_seen: string;
    license_id: string;
    license_key: string;
    plan_id: string | null;
    plan_name: string | null;
    platform: string | null;
    status: string;
    user_name: string | null;
};

function LoadingState() {
    return (
        <div className="flex h-screen items-center justify-center">
            <RiLoader5Line className="animate-spin text-muted-foreground" size={28} />
        </div>
    );
}

export default function AdminActivationsPage() {
    const [activations, setActivations] = useState<AdminActivation[]>([]);
    const [plans, setPlans] = useState<ApplicationPlan[]>([]);
    const [query, setQuery] = useState("");
    const [planId, setPlanId] = useState("all");
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const loadData = useEffectEvent(async () => {
        try {
            const params = new URLSearchParams();
            if (query.trim()) params.set("query", query.trim());
            if (planId !== "all") params.set("planId", planId);

            const [activationResponse, planResponse] = await Promise.all([
                fetch(`/api/admin/activations?${params.toString()}`, { cache: "no-store" }),
                fetch("/api/admin/plans", { cache: "no-store" }),
            ]);

            const activationPayload = (await activationResponse.json()) as { activations?: AdminActivation[]; error?: string };
            const planPayload = (await planResponse.json()) as { plans?: ApplicationPlan[]; error?: string };

            if (!activationResponse.ok || !activationPayload.activations) {
                throw new Error(activationPayload.error ?? "Failed to load activations.");
            }
            if (!planResponse.ok || !planPayload.plans) {
                throw new Error(planPayload.error ?? "Failed to load plans.");
            }

            setActivations(activationPayload.activations);
            setPlans(planPayload.plans);
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to load activations."));
        } finally {
            setLoading(false);
        }
    });

    useEffect(() => {
        void loadData();
    }, [query, planId]);

    const handleDelete = async (activationId: string) => {
        setDeletingId(activationId);

        try {
            const response = await fetch(`/api/admin/activations/${activationId}`, {
                method: "DELETE",
            });
            const payload = (await response.json()) as { error?: string };

            if (!response.ok) {
                throw new Error(payload.error ?? "Failed to remove activation.");
            }

            setActivations((current) => current.filter((activation) => activation.id !== activationId));
            toast.success("Activation removed.");
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to remove activation."));
        } finally {
            setDeletingId(null);
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
                        <h1 className="dashboard-heading">Activations</h1>
                        <p className="dashboard-subheading">Inspect devices tied to each license and remove stale activations.</p>
                    </div>
                    <div className="grid w-full gap-3 md:grid-cols-[minmax(0,1fr)_180px] xl:max-w-2xl">
                        <div className="form-input-wrap">
                            <RiSearchLine size={16} className="form-input-icon" />
                            <input value={query} onChange={(event) => setQuery(event.target.value)} className="form-input form-input-with-icon" placeholder="Search device, email, or key" />
                        </div>
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
                                <th className="pb-3 pr-4 font-medium">Device</th>
                                <th className="pb-3 pr-4 font-medium">Owner</th>
                                <th className="pb-3 pr-4 font-medium">Plan</th>
                                <th className="pb-3 pr-4 font-medium">Last seen</th>
                                <th className="pb-3 font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activations.map((activation) => (
                                <tr key={activation.id} className="border-t border-border/70 align-top">
                                    <td className="py-3 pr-4">
                                        <div className="font-medium text-foreground">{activation.device_name ?? activation.device_id}</div>
                                        <div className="font-mono text-[12px] text-muted-foreground">{activation.device_id}</div>
                                        <div className="text-muted-foreground">{activation.platform ?? "Unknown platform"}</div>
                                    </td>
                                    <td className="py-3 pr-4 text-muted-foreground">
                                        <div className="text-foreground">{activation.user_name ?? "Unnamed user"}</div>
                                        <div>{activation.email}</div>
                                    </td>
                                    <td className="py-3 pr-4 text-muted-foreground">
                                        <div>{activation.plan_name ?? "Unknown"}</div>
                                        <div className="font-mono text-[12px]">{activation.license_key}</div>
                                    </td>
                                    <td className="py-3 pr-4 text-muted-foreground">
                                        <div>{new Date(activation.last_seen).toLocaleString()}</div>
                                        <div>Added {new Date(activation.activated_at).toLocaleDateString()}</div>
                                    </td>
                                    <td className="py-3">
                                        <button
                                            onClick={() => handleDelete(activation.id)}
                                            disabled={deletingId === activation.id}
                                            className="btn-secondary h-10 px-3 text-rose-600 dark:text-rose-300"
                                        >
                                            {deletingId === activation.id ? <RiLoader5Line className="animate-spin" size={16} /> : <RiDeleteBinLine size={16} />}
                                        </button>
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
