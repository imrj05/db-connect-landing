"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { RiDashboardLine, RiUserLine, RiLogoutBoxLine, RiPriceTag3Line } from "react-icons/ri";
import { account } from "@/lib/appwrite";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/dashboard", label: "Overview", icon: RiDashboardLine },
    { href: "/dashboard/billing", label: "Billing", icon: RiPriceTag3Line },
    { href: "/dashboard/profile", label: "Profile", icon: RiUserLine },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            await account.deleteSession("current");
            router.replace("/login");
        } catch {
            toast.error("Failed to sign out. Please try again.");
        }
    };

    return (
        <div className="dashboard-shell">
            <div className="mx-auto flex min-h-screen w-full max-w-7xl gap-6 px-4 py-4 sm:px-6 md:px-8">
                <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-64 shrink-0 md:block">
                    <div className="dashboard-pane flex h-full flex-col p-4">
                        <div className="mb-6 rounded-2xl border border-border/70 bg-background/75 p-4">
                            <Link href="/dashboard" className="flex items-center gap-3 no-underline">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-background/80 shadow-sm">
                                    <Image src="/icons/logo.svg" alt="DBConnect" width={22} height={22} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[15px] font-semibold tracking-tight text-foreground">DBConnect</span>
                                        <span className="badge-alpha ml-0 text-[9px]">Alpha</span>
                                    </div>
                                    <p className="mt-1 text-[12px] text-muted-foreground">Workspace and license management</p>
                                </div>
                            </Link>
                        </div>

                        <nav className="flex flex-1 flex-col gap-1.5">
                            {navItems.map(({ href, label, icon: Icon }) => {
                                const active = pathname === href;
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={cn(
                                            "dashboard-sidebar-link",
                                            active
                                                ? "dashboard-sidebar-link-active"
                                                : "dashboard-sidebar-link-idle"
                                        )}
                                    >
                                        <Icon size={16} />
                                        {label}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="mt-4 rounded-2xl border border-border/70 bg-background/75 p-3">
                            <button
                                onClick={handleSignOut}
                                className="btn-secondary h-10 w-full justify-start gap-2.5 rounded-2xl text-sm"
                            >
                                <RiLogoutBoxLine size={16} />
                                Sign out
                            </button>
                        </div>
                    </div>
                </aside>

                <main className="min-w-0 flex-1 py-2 md:py-4">
                    <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 backdrop-blur md:hidden">
                        <Link href="/dashboard" className="flex items-center gap-2 no-underline">
                            <Image src="/icons/logo.svg" alt="DBConnect" width={22} height={22} />
                            <span className="text-sm font-semibold tracking-tight text-foreground">DBConnect</span>
                        </Link>
                        <button
                            onClick={handleSignOut}
                            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                        >
                            <RiLogoutBoxLine size={15} />
                            Sign out
                        </button>
                    </div>

                    {children}
                </main>
            </div>
        </div>
    );
}
