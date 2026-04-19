"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { RiUserLine, RiMailLine, RiLockLine, RiGoogleFill, RiGithubFill, RiLoader5Line } from "react-icons/ri";
import { toast } from "sonner";
import { useAppAnalytics } from "@/app/_components/AppAnalyticsProvider";
import { authClient } from "@/lib/auth-client";
import { oauthProviders, type OAuthProvider } from "@/lib/auth-providers";
import { useRouter, useSearchParams } from "next/navigation";
import { getErrorMessage } from "@/lib/utils";

function SignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { trackEvent } = useAppAnalytics();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);

    useEffect(() => {
        const checkSession = async () => {
            const { data } = await authClient.getSession();
            if (data?.user) {
                router.replace("/dashboard");
            }
        };
        checkSession();
    }, [router]);

    useEffect(() => {
        const error = searchParams.get("error");
        if (error) {
            toast.error(`OAuth failed: ${decodeURIComponent(error)}. Check your Better Auth provider settings.`);
            window.history.replaceState({}, "", "/signup");
        }
    }, [searchParams]);

    const handleOAuth = async (provider: OAuthProvider) => {
        setOauthLoading(provider);
        trackEvent("auth_oauth_started", {
            flow: "signup",
            provider,
        });
        const { error } = await authClient.signIn.social({
            provider,
            callbackURL: "/dashboard",
        });
        if (error) {
            setOauthLoading(null);
            trackEvent("auth_oauth_failed", {
                flow: "signup",
                provider,
            });
            toast.error(`OAuth failed: ${error.message}`);
        }
    };

    const providerIcons = {
        google: RiGoogleFill,
        github: RiGithubFill,
    } as const;

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await authClient.signUp.email({
                name,
                email,
                password,
                callbackURL: "/dashboard",
            });
            if (error) throw error;
            trackEvent("auth_signup_succeeded");
            toast.success("Account created. Verify your email to continue.");
            router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        } catch (err: unknown) {
            trackEvent("auth_signup_failed");
            toast.error(getErrorMessage(err, "Something went wrong. Please try again."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card animate-fade-in-up rounded-3xl p-8 shadow-lg">
            <div className="mb-6 text-center">
                <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground">
                    Create an Account
                </h2>
                <p className="text-sm text-muted-foreground">
                    Join DBConnect and start managing your data better.
                </p>
            </div>

            <form onSubmit={handleSignup} className="form-stack">
                <div className="form-field">
                    <label className="form-label">Full Name</label>
                    <div className="form-input-wrap">
                        <RiUserLine className="form-input-icon" size={18} />
                        <input
                            type="text"
                            required
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="form-input form-input-with-icon"
                        />
                    </div>
                </div>

                <div className="form-field">
                    <label className="form-label">Email Address</label>
                    <div className="form-input-wrap">
                        <RiMailLine className="form-input-icon" size={18} />
                        <input
                            type="email"
                            required
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input form-input-with-icon"
                        />
                    </div>
                </div>

                <div className="form-field">
                    <label className="form-label">Password</label>
                    <div className="form-input-wrap">
                        <RiLockLine className="form-input-icon" size={18} />
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-input form-input-with-icon"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">Must be at least 8 characters.</p>
                </div>

                <button type="submit" disabled={loading} className="btn-primary mt-2 h-11 w-full justify-center">
                    {loading ? <RiLoader5Line className="animate-spin" size={20} /> : "Get Started"}
                </button>
            </form>

            <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Or continue with</span>
                <div className="h-px flex-1 bg-border" />
            </div>

            {oauthProviders.length > 0 && (
                <div className="flex gap-3">
                    {oauthProviders.map((provider) => {
                        const Icon = providerIcons[provider.id];

                        return (
                            <button
                                key={provider.id}
                                className="btn-secondary h-11 flex-1 justify-center text-sm"
                                disabled={oauthLoading !== null}
                                onClick={() => handleOAuth(provider.id)}
                            >
                                {oauthLoading === provider.id ? <RiLoader5Line className="animate-spin" size={18} /> : <Icon size={18} />}
                                {provider.label}
                            </button>
                        );
                    })}
                </div>
            )}

            <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-foreground transition-colors hover:text-brand">Log in</Link>
            </p>
        </div>
    );
}

export default function SignupPage() {
    return (
        <Suspense fallback={null}>
            <SignupForm />
        </Suspense>
    );
}
