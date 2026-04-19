"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { RiDashboardLine, RiGithubFill, RiLogoutBoxLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Navbar() {
    const router = useRouter();
    const [authState, setAuthState] = useState<"loading" | "logged-in" | "logged-out">("loading");
    const navLinks: Array<{ label: string; href: string; external?: boolean }> = [
        { label: "Features", href: "#features" },
        { label: "Databases", href: "#databases" },
        { label: "Roadmap", href: "#roadmap" },
        { label: "Pricing", href: "#pricing" },
    ];

    useEffect(() => {
        const checkSession = async () => {
            const { data } = await authClient.getSession();
            setAuthState(data?.user ? "logged-in" : "logged-out");
        };
        checkSession();
    }, []);

    const handleLogout = async () => {
        try {
            await authClient.signOut();
        } catch {
            // session may already be gone
        }
        setAuthState("logged-out");
        router.push("/");
    };

    return (
        <header className="fixed inset-x-0 top-0 z-100 px-3 pt-3 sm:px-5">
            <div className="section-container px-0">
                <nav className="relative flex h-14 items-center justify-between rounded-2xl border border-border/70 bg-background/65 px-3 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl supports-backdrop-filter:bg-background/55 sm:px-4">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-full bg-linear-to-r from-transparent via-foreground/12 to-transparent" />
                    <Link
                        href="/"
                        className="flex items-center gap-2 rounded-full px-2 py-1 text-sm no-underline transition-colors hover:bg-background/70"
                    >
                        <Image src="/icons/logo.svg" alt="DBConnect Logo" width={24} height={24} className="h-6 w-6" />
                        <span className="text-sm font-semibold tracking-tight text-foreground">
                            DBConnect
                        </span>
                        <Badge variant="alpha" className="ml-1 hidden sm:inline-flex">
                            Alpha
                        </Badge>
                    </Link>
                    <div className="hidden items-center rounded-full border border-border/70 bg-background/55 p-1 md:flex">
                        {navLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="inline-flex items-center rounded-full px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-all duration-200 hover:bg-background hover:text-foreground"
                                target={link.external ? "_blank" : undefined}
                                rel={link.external ? "noopener noreferrer" : undefined}
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>
                    <div className="flex items-center justify-end gap-1.5 md:min-w-47">
                        <a
                            href="https://github.com/imrj05/db-connect"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="GitHub repository"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-background/70 text-muted-foreground transition-all duration-200 hover:bg-background hover:text-foreground"
                        >
                            <RiGithubFill size={17} />
                        </a>

                        {authState === "loading" ? (
                            <div className="h-8 w-36 rounded-full border border-border/60 bg-background/60" />
                        ) : authState === "logged-in" ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-medium text-muted-foreground transition-all duration-200 hover:bg-background hover:text-foreground"
                                >
                                    <RiDashboardLine size={15} />
                                    Dashboard
                                </Link>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleLogout}
                                    className="h-9 rounded-full border-border/70 bg-background/70 px-3 text-[13px] shadow-none hover:bg-background"
                                >
                                    <RiLogoutBoxLine size={14} />
                                    Log out
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="inline-flex items-center rounded-full px-3 py-2 text-[13px] font-medium text-muted-foreground transition-all duration-200 hover:bg-background hover:text-foreground"
                                >
                                    Sign In
                                </Link>
                                <Button
                                    asChild
                                    size="sm"
                                    className="h-9 rounded-full px-4 text-[13px] font-medium shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
                                >
                                    <Link href="/signup" className="text-[13px] font-medium">
                                        Get Started
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
}
