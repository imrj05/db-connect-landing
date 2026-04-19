"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { RiLoader5Line, RiSaveLine, RiSearchLine } from "react-icons/ri";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/utils";

type AdminUser = {
    active_license_count: number;
    created_at: string;
    current_plan_name: string | null;
    current_status: string | null;
    email: string;
    email_verified: boolean;
    id: string;
    license_count: number;
    name: string | null;
    updated_at: string;
};

function LoadingState() {
    return (
        <div className="flex h-screen items-center justify-center">
            <RiLoader5Line className="animate-spin text-muted-foreground" size={28} />
        </div>
    );
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [query, setQuery] = useState("");
    const [draftNames, setDraftNames] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);

    const loadUsers = useEffectEvent(async () => {
        try {
            const params = new URLSearchParams();
            if (query.trim()) {
                params.set("query", query.trim());
            }

            const response = await fetch(`/api/admin/users?${params.toString()}`, { cache: "no-store" });
            const payload = (await response.json()) as { error?: string; users?: AdminUser[] };

            if (!response.ok || !payload.users) {
                throw new Error(payload.error ?? "Failed to load users.");
            }

            setUsers(payload.users);
            setDraftNames(Object.fromEntries(payload.users.map((user) => [user.id, user.name ?? ""])));
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to load users."));
        } finally {
            setLoading(false);
        }
    });

    useEffect(() => {
        void loadUsers();
    }, [query]);

    const handleSave = async (userId: string) => {
        setSavingId(userId);

        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: draftNames[userId] ?? "" }),
            });

            const payload = (await response.json()) as { error?: string; user?: AdminUser };

            if (!response.ok || !payload.user) {
                throw new Error(payload.error ?? "Failed to save user.");
            }

            setUsers((current) => current.map((user) => (user.id === userId ? { ...user, ...payload.user } : user)));
            toast.success("User name updated.");
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to update user."));
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
                <div className="dashboard-panel-header flex-col items-start gap-4 md:flex-row md:items-end">
                    <div>
                        <span className="eyebrow-label">Admin</span>
                        <h1 className="dashboard-heading">Users</h1>
                        <p className="dashboard-subheading">Search accounts and edit the visible display name.</p>
                    </div>
                    <div className="form-input-wrap w-full max-w-sm">
                        <RiSearchLine size={16} className="form-input-icon" />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search by name or email"
                            className="form-input form-input-with-icon"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                            <tr>
                                <th className="pb-3 pr-4 font-medium">Identity</th>
                                <th className="pb-3 pr-4 font-medium">Plan</th>
                                <th className="pb-3 pr-4 font-medium">Licenses</th>
                                <th className="pb-3 pr-4 font-medium">Created</th>
                                <th className="pb-3 font-medium">Edit name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-t border-border/70 align-top">
                                    <td className="py-3 pr-4">
                                        <div className="font-medium text-foreground">{user.name ?? "Unnamed user"}</div>
                                        <div className="text-muted-foreground">{user.email}</div>
                                        <div className="mt-1">
                                            <span className={user.email_verified ? "status-pill status-pill-active" : "status-pill status-pill-neutral"}>
                                                {user.email_verified ? "Verified" : "Unverified"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 pr-4 text-muted-foreground">
                                        <div>{user.current_plan_name ?? "No plan"}</div>
                                        {user.current_status && (
                                            <span className={user.current_status === "active" ? "status-pill status-pill-active" : user.current_status === "expired" ? "status-pill status-pill-neutral" : "status-pill status-pill-danger"}>
                                                {user.current_status}
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 pr-4 text-muted-foreground">
                                        <div>{user.license_count} total</div>
                                        <div>{user.active_license_count} active</div>
                                    </td>
                                    <td className="py-3 pr-4 text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td className="py-3">
                                        <div className="flex gap-2">
                                            <input
                                                value={draftNames[user.id] ?? ""}
                                                onChange={(event) =>
                                                    setDraftNames((current) => ({
                                                        ...current,
                                                        [user.id]: event.target.value,
                                                    }))
                                                }
                                                className="form-input h-10 min-w-[220px]"
                                            />
                                            <button
                                                onClick={() => handleSave(user.id)}
                                                disabled={savingId === user.id}
                                                className="btn-secondary h-10 px-3"
                                            >
                                                {savingId === user.id ? <RiLoader5Line className="animate-spin" size={16} /> : <RiSaveLine size={16} />}
                                            </button>
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
