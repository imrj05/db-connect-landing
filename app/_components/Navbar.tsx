"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { account } from "@/lib/appwrite";
import { RiDashboardLine, RiLogoutBoxLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Navbar() {
  const router = useRouter();
  const [authState, setAuthState] = useState<"loading" | "logged-in" | "logged-out">("loading");

  useEffect(() => {
    account.get()
      .then(() => setAuthState("logged-in"))
      .catch(() => setAuthState("logged-out"));
  }, []);

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
    } catch {
      // session may already be gone
    }
    setAuthState("logged-out");
    router.push("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] border-b border-border/50 backdrop-blur-xl bg-background/80 transition-all duration-300">
      <nav className="section-container relative z-[1] flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <img src="/icons/logo.svg" alt="DBConnect Logo" className="w-6 h-6" />
          <span className="font-bold text-base tracking-tight text-foreground">
            DBConnect
          </span>
          <Badge variant="alpha">Alpha</Badge>
        </Link>

        {/* Nav Links — hidden on mobile */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { label: "Features", href: "#features" },
            { label: "Databases", href: "#databases" },
            { label: "Roadmap", href: "#roadmap" },
            { label: "Pricing", href: "#pricing" },
          ].map((link) => (
            <a key={link.label} href={link.href} className="nav-link px-4 py-2 text-[14px]">
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA — swaps based on auth state */}
        <div className="flex items-center gap-2 md:min-w-[180px] justify-end">
          {authState === "loading" ? (
            /* Skeleton to prevent layout shift */
            <div className="w-40 h-8 rounded-md bg-elevated" />
          ) : authState === "logged-in" ? (
            <>
              <Link href="/dashboard" className="nav-link flex items-center gap-1.5 text-[13px] font-semibold px-3 py-2">
                <RiDashboardLine size={15} />
                Dashboard
              </Link>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3.5 py-[7px] text-[13px] font-semibold"
              >
                <RiLogoutBoxLine size={14} />
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link text-[13px] font-semibold px-3 py-2">
                Sign In
              </Link>
              <Button asChild size="sm">
                <Link href="/signup" className="text-[13px] font-semibold">
                  Get Started
                </Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
