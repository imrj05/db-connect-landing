"use client";

import Link from "next/link";
import { useState } from "react";
import { RiLoader5Line, RiMailLine } from "react-icons/ri";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { getErrorMessage } from "@/lib/utils";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);

        try {
            const { error } = await authClient.requestPasswordReset({
                email,
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) {
                throw error;
            }

            setSent(true);
            toast.success("Password reset email sent.");
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to send password reset email."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card animate-fade-in-up rounded-3xl p-8 shadow-lg">
            <div className="mb-6 text-center">
                <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground">
                    Reset your password
                </h2>
                <p className="text-sm text-muted-foreground">
                    {sent
                        ? "Check your inbox for the reset link."
                        : "Enter your account email and we will send you a reset link."}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="form-stack">
                <div className="form-field">
                    <label className="form-label">Email Address</label>
                    <div className="form-input-wrap">
                        <RiMailLine className="form-input-icon" size={18} />
                        <input
                            type="email"
                            required
                            placeholder="name@company.com"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="form-input form-input-with-icon"
                        />
                    </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary h-11 w-full justify-center">
                    {loading ? <RiLoader5Line className="animate-spin" size={18} /> : "Send reset link"}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
                Remembered it?{" "}
                <Link href="/login" className="font-semibold text-foreground transition-colors hover:text-brand">
                    Back to login
                </Link>
            </p>
        </div>
    );
}
