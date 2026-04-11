"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { RiMailLine, RiLockLine, RiGoogleFill, RiGithubFill, RiLoader5Line } from "react-icons/ri";
import { toast } from "sonner";
import { account } from "@/lib/appwrite";
import { OAuthProvider } from "appwrite";
import { useRouter, useSearchParams } from "next/navigation";
import { getErrorMessage } from "@/lib/utils";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);

    // Redirect to dashboard if already logged in
    useEffect(() => {
        account.get().then(() => router.replace("/dashboard")).catch(() => { });
    }, [router]);

    // Show error if Appwrite redirected back here due to OAuth failure
    useEffect(() => {
        const error = searchParams.get("error");
        if (error) {
            toast.error(`OAuth failed: ${decodeURIComponent(error)}. Check your Appwrite OAuth provider settings.`);
            window.history.replaceState({}, "", "/login");
        }
    }, [searchParams]);

    const handleOAuth = (provider: OAuthProvider) => {
        const providerName = provider === OAuthProvider.Google ? "google" : "github";
        setOauthLoading(providerName);
        const origin = window.location.origin;
        // createOAuth2Token: Appwrite redirects to /dashboard?userId=X&secret=Y on success
        // The dashboard page exchanges the token for a real session
        account.createOAuth2Token(
            provider,
            `${origin}/dashboard`,
            `${origin}/login?error=oauth_failed`
        );
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await account.createEmailPasswordSession(email, password);
            toast.success("Welcome back!");
            router.push("/dashboard");
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, "Invalid credentials. Please try again."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card animate-fade-in-up rounded-3xl p-8 shadow-lg">
            <div className="mb-6 text-center">
                <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground">
                    Sign in to DBConnect
                </h2>
                <p className="text-sm text-muted-foreground">
                    Welcome back! Please enter your details.
                </p>
            </div>

            <form onSubmit={handleLogin} className="form-stack">
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
                    <div className="flex items-center justify-between gap-4">
                        <label className="form-label">Password</label>
                        <a href="#" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Forgot password?</a>
                    </div>
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
                </div>

                <button type="submit" disabled={loading} className="btn-primary mt-2 h-11 w-full justify-center">
                    {loading ? <RiLoader5Line className="animate-spin" size={20} /> : "Sign in"}
                </button>
            </form>

            <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Or continue with</span>
                <div className="h-px flex-1 bg-border" />
            </div>

            <div className="flex gap-3">
                <button
                    className="btn-secondary h-11 flex-1 justify-center text-sm"
                    disabled={oauthLoading !== null}
                    onClick={() => handleOAuth(OAuthProvider.Google)}
                >
                    {oauthLoading === "google" ? <RiLoader5Line className="animate-spin" size={18} /> : <RiGoogleFill size={18} />}
                    Google
                </button>
                <button
                    className="btn-secondary h-11 flex-1 justify-center text-sm"
                    disabled={oauthLoading !== null}
                    onClick={() => handleOAuth(OAuthProvider.Github)}
                >
                    {oauthLoading === "github" ? <RiLoader5Line className="animate-spin" size={18} /> : <RiGithubFill size={18} />}
                    GitHub
                </button>
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-semibold text-foreground transition-colors hover:text-brand">Sign up</Link>
            </p>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={null}>
            <LoginForm />
        </Suspense>
    );
}
