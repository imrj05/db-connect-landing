"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { RiAddLine, RiLoader5Line, RiSaveLine } from "react-icons/ri";
import { toast } from "sonner";

import type { ApplicationPlan } from "@/lib/plans";
import { getErrorMessage } from "@/lib/utils";

type PlanDraft = {
    description: string;
    durationDays: string;
    features: string;
    id: string;
    isActive: boolean;
    isPopular: boolean;
    maxDevices: string;
    name: string;
    price: string;
    sortOrder: string;
};

function LoadingState() {
    return (
        <div className="flex h-screen items-center justify-center">
            <RiLoader5Line className="animate-spin text-muted-foreground" size={28} />
        </div>
    );
}

function toDraft(plan?: ApplicationPlan): PlanDraft {
    return {
        id: plan?.id ?? "",
        name: plan?.name ?? "",
        description: plan?.description ?? "",
        price: String(plan?.price ?? 0),
        maxDevices: String(plan?.maxDevices ?? 1),
        durationDays: String(plan?.durationDays ?? 0),
        sortOrder: String(plan?.sortOrder ?? 0),
        isPopular: plan?.isPopular ?? false,
        isActive: plan?.isActive ?? true,
        features: plan?.features.join("\n") ?? "",
    };
}

export default function AdminPlansPage() {
    const [plans, setPlans] = useState<ApplicationPlan[]>([]);
    const [drafts, setDrafts] = useState<Record<string, PlanDraft>>({});
    const [newPlan, setNewPlan] = useState<PlanDraft>(toDraft());
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);

    const loadPlans = useEffectEvent(async () => {
        try {
            const response = await fetch("/api/admin/plans", { cache: "no-store" });
            const payload = (await response.json()) as { error?: string; plans?: ApplicationPlan[] };

            if (!response.ok || !payload.plans) {
                throw new Error(payload.error ?? "Failed to load plans.");
            }

            setPlans(payload.plans);
            setDrafts(Object.fromEntries(payload.plans.map((plan) => [plan.id, toDraft(plan)])));
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to load plans."));
        } finally {
            setLoading(false);
        }
    });

    useEffect(() => {
        void loadPlans();
    }, []);

    const updateDraft = (planId: string, patch: Partial<PlanDraft>) => {
        setDrafts((current) => ({
            ...current,
            [planId]: {
                ...current[planId],
                ...patch,
            },
        }));
    };

    const savePlan = async (planId: string) => {
        const draft = drafts[planId];
        if (!draft) {
            return;
        }

        setSavingId(planId);

        try {
            const response = await fetch(`/api/admin/plans/${planId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(draft),
            });
            const payload = (await response.json()) as { error?: string; plan?: ApplicationPlan };

            if (!response.ok || !payload.plan) {
                throw new Error(payload.error ?? "Failed to save plan.");
            }

            setPlans((current) => current.map((plan) => (plan.id === planId ? payload.plan ?? plan : plan)));
            setDrafts((current) => ({ ...current, [planId]: toDraft(payload.plan) }));
            toast.success("Plan updated.");
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to update plan."));
        } finally {
            setSavingId(null);
        }
    };

    const createPlan = async () => {
        setCreating(true);

        try {
            const response = await fetch("/api/admin/plans", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newPlan),
            });
            const payload = (await response.json()) as { error?: string; plan?: ApplicationPlan };

            if (!response.ok || !payload.plan) {
                throw new Error(payload.error ?? "Failed to create plan.");
            }

            const createdPlan = payload.plan;

            setPlans((current) => [...current, createdPlan].sort((left, right) => left.sortOrder - right.sortOrder));
            setDrafts((current) => ({ ...current, [createdPlan.id]: toDraft(createdPlan) }));
            setNewPlan(toDraft());
            toast.success("Plan created.");
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to create plan."));
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return <LoadingState />;
    }

    return (
        <div className="space-y-6 p-2 md:p-0">
            <section className="dashboard-section">
                <div className="dashboard-panel-header">
                    <div>
                        <span className="eyebrow-label">Admin</span>
                        <h1 className="dashboard-heading">Plans</h1>
                        <p className="dashboard-subheading">Create, price, and reorder the application plan catalog.</p>
                    </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <input className="form-input" placeholder="plan id" value={newPlan.id} onChange={(event) => setNewPlan((current) => ({ ...current, id: event.target.value }))} />
                    <input className="form-input" placeholder="name" value={newPlan.name} onChange={(event) => setNewPlan((current) => ({ ...current, name: event.target.value }))} />
                    <input className="form-input" placeholder="price" value={newPlan.price} onChange={(event) => setNewPlan((current) => ({ ...current, price: event.target.value }))} />
                    <input className="form-input" placeholder="devices" value={newPlan.maxDevices} onChange={(event) => setNewPlan((current) => ({ ...current, maxDevices: event.target.value }))} />
                    <input className="form-input" placeholder="duration days" value={newPlan.durationDays} onChange={(event) => setNewPlan((current) => ({ ...current, durationDays: event.target.value }))} />
                    <input className="form-input" placeholder="sort order" value={newPlan.sortOrder} onChange={(event) => setNewPlan((current) => ({ ...current, sortOrder: event.target.value }))} />
                    <input className="form-input md:col-span-2" placeholder="description" value={newPlan.description} onChange={(event) => setNewPlan((current) => ({ ...current, description: event.target.value }))} />
                    <textarea className="form-input min-h-28 md:col-span-4" placeholder="One feature per line" value={newPlan.features} onChange={(event) => setNewPlan((current) => ({ ...current, features: event.target.value }))} />
                </div>
                <div className="mt-4 flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <input type="checkbox" checked={newPlan.isPopular} onChange={(event) => setNewPlan((current) => ({ ...current, isPopular: event.target.checked }))} /> Popular
                    </label>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <input type="checkbox" checked={newPlan.isActive} onChange={(event) => setNewPlan((current) => ({ ...current, isActive: event.target.checked }))} /> Active
                    </label>
                    <button onClick={createPlan} disabled={creating} className="btn-primary ml-auto px-4">
                        {creating ? <RiLoader5Line className="animate-spin" size={16} /> : <RiAddLine size={16} />}
                        Create plan
                    </button>
                </div>
            </section>

            <div className="grid gap-4 xl:grid-cols-2">
                {plans.map((plan) => {
                    const draft = drafts[plan.id] ?? toDraft(plan);
                    return (
                        <section key={plan.id} className="dashboard-section">
                            <div className="dashboard-panel-header">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-base font-semibold text-foreground">{plan.name}</h2>
                                        {plan.isPopular && <span className="status-pill status-pill-active">Popular</span>}
                                        {!plan.isActive && <span className="status-pill status-pill-danger">Archived</span>}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{plan.id}</p>
                                </div>
                                <button onClick={() => savePlan(plan.id)} disabled={savingId === plan.id} className="btn-secondary px-3">
                                    {savingId === plan.id ? <RiLoader5Line className="animate-spin" size={16} /> : <RiSaveLine size={16} />}
                                </button>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                                <input className="form-input" value={draft.name} onChange={(event) => updateDraft(plan.id, { name: event.target.value })} />
                                <input className="form-input" value={draft.description} onChange={(event) => updateDraft(plan.id, { description: event.target.value })} />
                                <input className="form-input" value={draft.price} onChange={(event) => updateDraft(plan.id, { price: event.target.value })} />
                                <input className="form-input" value={draft.maxDevices} onChange={(event) => updateDraft(plan.id, { maxDevices: event.target.value })} />
                                <input className="form-input" value={draft.durationDays} onChange={(event) => updateDraft(plan.id, { durationDays: event.target.value })} />
                                <input className="form-input" value={draft.sortOrder} onChange={(event) => updateDraft(plan.id, { sortOrder: event.target.value })} />
                                <textarea className="form-input min-h-28 md:col-span-2" value={draft.features} onChange={(event) => updateDraft(plan.id, { features: event.target.value })} />
                            </div>
                            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" checked={draft.isPopular} onChange={(event) => updateDraft(plan.id, { isPopular: event.target.checked })} /> Popular
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" checked={draft.isActive} onChange={(event) => updateDraft(plan.id, { isActive: event.target.checked })} /> Active
                                </label>
                            </div>
                        </section>
                    );
                })}
            </div>
        </div>
    );
}
