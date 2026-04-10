"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { account } from "@/lib/appwrite";
import { RiDashboardLine, RiLogoutBoxLine } from "react-icons/ri";

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
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        borderBottom: "1px solid var(--nav-border)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        backgroundColor: "var(--nav-bg)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <nav
        className="section-container"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}
      >
        {/* Logo */}
        <a
          href="#"
          style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}
        >
          <img src="/icons/logo.svg" alt="DBConnect Logo" width="24" height="24" />
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.03em", color: "var(--text-primary)" }}>
            DBConnect
          </span>
        </a>

        {/* Nav Links */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {[
            { label: "Features", href: "#features" },
            { label: "Databases", href: "#databases" },
            { label: "Roadmap", href: "#roadmap" },
          ].map((link) => (
            <a key={link.label} href={link.href} className="nav-link" style={{ padding: "8px 16px" }}>
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA — swaps based on auth state */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: "180px", justifyContent: "flex-end" }}>
          {authState === "loading" ? (
            /* Skeleton to prevent layout shift */
            <div style={{ width: "160px", height: "32px", borderRadius: "var(--radius-md)", background: "var(--bg-elevated)" }} />
          ) : authState === "logged-in" ? (
            <>
              <Link
                href="/dashboard"
                className="nav-link"
                style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: 13, fontWeight: 600, padding: "8px 12px" }}
              >
                <RiDashboardLine size={15} />
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="btn-secondary"
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", fontSize: 13, fontWeight: 600 }}
              >
                <RiLogoutBoxLine size={14} />
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link" style={{ fontSize: 13, fontWeight: 600, padding: "8px 12px" }}>
                Sign In
              </Link>
              <Link href="/signup" className="btn-primary" style={{ padding: "8px 16px", fontSize: 13, fontWeight: 600 }}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
