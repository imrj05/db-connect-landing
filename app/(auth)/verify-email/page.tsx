"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RiLoader5Line, RiMailCheckLine, RiRefreshLine } from "react-icons/ri";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { getErrorMessage } from "@/lib/utils";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const email = searchParams.get("email") ?? "";
    const error = searchParams.get("error");

    const description = useMemo(() => {
        if (error) {
            return "The verification link is invalid or expired. Request a fresh email and try again.";
        }

        return email
            ? `We sent a verification link to ${email}. Open that email to finish setting up your account.`
            : "Check your inbox for the verification link, then return once your email is confirmed.";
    }, [email, error]);

    const handleResend = async () => {
        if (!email) {
            toast.error("Add your email again from the sign-up screen.");
            return;
        }

        setLoading(true);
        try {
            const { error: resendError } = await authClient.sendVerificationEmail({
                email,
                callbackURL: "/dashboard",
            });

            if (resendError) {
                throw resendError;
            }

            toast.success("Verification email sent.");
        } catch (resendError) {
            toast.error(getErrorMessage(resendError, "Failed to resend verification email."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card animate-fade-in-up rounded-3xl p-8 shadow-lg">
            <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-background/70">
                    <RiMailCheckLine size={22} className="text-foreground" />
                </div>
                <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground">
                    Verify your email
                </h2>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>

            <div className="form-stack">
                <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading}
                    className="btn-primary h-11 w-full justify-center"
                >
                    {loading ? <RiLoader5Line className="animate-spin" size={18} /> : <RiRefreshLine size={18} />}
                    Resend verification email
                </button>
                <Link href="/login" className="btn-secondary h-11 w-full justify-center text-sm">
                    Back to login
                </Link>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={null}>
            <VerifyEmailContent />
        </Suspense>
    );
}
