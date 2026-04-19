"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RiLoader5Line, RiLockLine } from "react-icons/ri";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { getErrorMessage } from "@/lib/utils";

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token") ?? "";
    const error = searchParams.get("error");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!token) {
            toast.error("Invalid or expired reset link.");
            return;
        }

        setLoading(true);
        try {
            const { error: resetError } = await authClient.resetPassword({
                token,
                newPassword,
            });

            if (resetError) {
                throw resetError;
            }

            toast.success("Password updated. You can sign in now.");
            router.replace("/login");
        } catch (resetError) {
            toast.error(getErrorMessage(resetError, "Failed to reset password."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card animate-fade-in-up rounded-3xl p-8 shadow-lg">
            <div className="mb-6 text-center">
                <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground">
                    Choose a new password
                </h2>
                <p className="text-sm text-muted-foreground">
                    {error === "INVALID_TOKEN"
                        ? "This reset link is invalid or expired."
                        : "Set a new password for your account."}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="form-stack">
                <div className="form-field">
                    <label className="form-label">New Password</label>
                    <div className="form-input-wrap">
                        <RiLockLine className="form-input-icon" size={18} />
                        <input
                            type="password"
                            required
                            minLength={8}
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            className="form-input form-input-with-icon"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || !token || error === "INVALID_TOKEN"}
                    className="btn-primary h-11 w-full justify-center"
                >
                    {loading ? <RiLoader5Line className="animate-spin" size={18} /> : "Update password"}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
                <Link href="/login" className="font-semibold text-foreground transition-colors hover:text-brand">
                    Back to login
                </Link>
            </p>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={null}>
            <ResetPasswordContent />
        </Suspense>
    );
}
