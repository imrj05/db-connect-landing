"use client";

import React, { useEffect, useState } from "react";
import { account } from "@/lib/appwrite";
import { useRouter } from "next/navigation";
import {
    RiLoader5Line,
    RiUserLine,
    RiLockLine,
    RiCheckLine,
    RiEditLine,
} from "react-icons/ri";
import { toast } from "sonner";
import type { Models } from "appwrite";
import { getErrorMessage } from "@/lib/utils";

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
    const [loading, setLoading] = useState(true);

    // Name section
    const [name, setName] = useState("");
    const [savingName, setSavingName] = useState(false);

    // Password section
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [savingPassword, setSavingPassword] = useState(false);

    useEffect(() => {
        account
            .get()
            .then((me) => {
                setUser(me);
                setName(me.name ?? "");
            })
            .catch(() => router.replace("/login"))
            .finally(() => setLoading(false));
    }, [router]);

    const handleUpdateName = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        setSavingName(true);
        try {
            const updated = await account.updateName(name.trim());
            setUser(updated);
            toast.success("Name updated successfully.");
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, "Failed to update name."));
        } finally {
            setSavingName(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 8) {
            toast.error("New password must be at least 8 characters.");
            return;
        }
        setSavingPassword(true);
        try {
            await account.updatePassword(newPassword, oldPassword);
            setOldPassword("");
            setNewPassword("");
            toast.success("Password updated successfully.");
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, "Failed to update password."));
        } finally {
            setSavingPassword(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <RiLoader5Line className="animate-spin text-muted-foreground" size={28} />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="space-y-6 p-2 md:p-0">
            <section className="dashboard-pane overflow-hidden p-6 md:p-8">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-foreground/12 to-transparent" />
                <div className="relative z-10">
                    <span className="eyebrow-label">Settings</span>
                    <h1 className="dashboard-heading mt-2">
                        Profile
                    </h1>
                    <p className="dashboard-subheading max-w-2xl">
                        Manage your account details, identity, and password from one place.
                    </p>
                </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.15fr)]">
                <section className="dashboard-section">
                    <h2 className="mb-4 text-sm font-semibold text-foreground">
                        Account info
                    </h2>
                    <div className="flex flex-col gap-3">
                        <div className="detail-row">
                            <span className="detail-label">User ID</span>
                            <span className="rounded-md border border-border bg-elevated px-2 py-1 font-mono text-xs text-muted-foreground">
                                {user.$id}
                            </span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Email</span>
                            <div className="flex items-center gap-1.5">
                                <span className="detail-value">{user.email}</span>
                                {user.emailVerification && (
                                    <span className="status-pill status-pill-active gap-1">
                                        <RiCheckLine size={11} /> Verified
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Member since</span>
                            <span className="detail-value">
                                {new Date(user.$createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                            </span>
                        </div>
                    </div>
                </section>

                <div className="flex flex-col gap-6">
                    <section className="dashboard-section">
                        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                            <RiEditLine size={15} className="text-muted-foreground" />
                            Display name
                        </h2>
                        <form onSubmit={handleUpdateName} className="form-stack">
                            <div className="form-input-wrap">
                                <RiUserLine size={16} className="form-input-icon" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your full name"
                                    required
                                    className="form-input form-input-with-icon"
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={savingName || name.trim() === (user.name ?? "")}
                                    className="btn-primary px-4.5 py-2 text-[13px]"
                                >
                                    {savingName ? <RiLoader5Line className="animate-spin" size={16} /> : "Save"}
                                </button>
                            </div>
                        </form>
                    </section>

                    <section className="dashboard-section">
                        <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-foreground">
                            <RiLockLine size={15} className="text-muted-foreground" />
                            Change password
                        </h2>
                        <p className="mb-4 text-xs text-muted-foreground">
                            Leave current password blank if you signed up via OAuth.
                        </p>
                        <form onSubmit={handleUpdatePassword} className="form-stack">
                            <div className="form-field gap-1.5">
                                <label className="text-[13px] font-medium text-muted-foreground">
                                    Current password
                                </label>
                                <div className="form-input-wrap">
                                    <RiLockLine size={16} className="form-input-icon" />
                                    <input
                                        type="password"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="form-input form-input-with-icon"
                                    />
                                </div>
                            </div>
                            <div className="form-field gap-1.5">
                                <label className="text-[13px] font-medium text-muted-foreground">
                                    New password
                                </label>
                                <div className="form-input-wrap">
                                    <RiLockLine size={16} className="form-input-icon" />
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="form-input form-input-with-icon"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">Must be at least 8 characters.</p>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={savingPassword || !newPassword}
                                    className="btn-primary px-4.5 py-2 text-[13px]"
                                >
                                    {savingPassword ? <RiLoader5Line className="animate-spin" size={16} /> : "Update password"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </div>
    );
}
