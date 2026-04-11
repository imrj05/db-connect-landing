"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { RiDashboardLine, RiUserLine, RiLogoutBoxLine, RiPriceTag3Line } from "react-icons/ri";
import { account } from "@/lib/appwrite";
import { toast } from "sonner";

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
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg-base)" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "220px",
          flexShrink: 0,
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          padding: "24px 0",
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        {/* Logo */}
        <div style={{ padding: "0 20px 24px", borderBottom: "1px solid var(--border)" }}>
          <Link
            href="/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
            }}
          >
            <img src="/icons/logo.svg" alt="DBConnect" width={24} height={24} />
            <span
              style={{
                fontSize: "15px",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "var(--text-primary)",
              }}
            >
              DBConnect
            </span>
            <span className="badge-alpha" style={{ fontSize: "9px", padding: "1px 4px", marginLeft: "4px" }}>Alpha</span>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: "2px" }}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 10px",
                  borderRadius: "var(--radius-md)",
                  fontSize: "13px",
                  fontWeight: active ? 600 : 500,
                  color: active ? "var(--text-primary)" : "var(--text-secondary)",
                  background: active ? "var(--bg-elevated)" : "transparent",
                  border: active ? "1px solid var(--border)" : "1px solid transparent",
                  textDecoration: "none",
                  transition: "all var(--transition-fast)",
                }}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div style={{ padding: "16px 12px", borderTop: "1px solid var(--border)" }}>
          <button
            onClick={handleSignOut}
            className="btn-secondary"
            style={{
              width: "100%",
              padding: "8px 10px",
              fontSize: "13px",
              justifyContent: "flex-start",
              gap: "10px",
            }}
          >
            <RiLogoutBoxLine size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
