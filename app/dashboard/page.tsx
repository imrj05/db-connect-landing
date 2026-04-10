"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { account, databases, DB_ID, LICENSES_COLLECTION_ID, DEVICES_COLLECTION_ID } from "@/lib/appwrite";
import { Query } from "appwrite";
import { useRouter, useSearchParams } from "next/navigation";
import {
  RiLoader5Line,
  RiUserLine,
  RiShieldCheckLine,
  RiTimeLine,
  RiPriceTag3Line,
  RiDeviceLine,
  RiFileCopyLine,
  RiCheckDoubleLine,
  RiArrowRightLine,
  RiErrorWarningLine,
} from "react-icons/ri";
import type { Models } from "appwrite";

type License = Models.Document & {
  planId: string;
  planName: string;
  licenseKey: string;
  status: "active" | "expired";
  expiresAt: string;
  maxDevices: number;
  price: number;
};

function isLifetime(expiresAt: string) {
  return expiresAt === "lifetime" || new Date(expiresAt).getFullYear() - new Date().getFullYear() > 20;
}

function daysRemaining(expiresAt: string) {
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86_400_000));
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [license, setLicense] = useState<License | null>(null);
  const [deviceCount, setDeviceCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const userId = searchParams.get("userId");
        const secret = searchParams.get("secret");

        if (userId && secret) {
          try {
            await account.createSession(userId, secret);
          } catch (err: any) {
            // Token already used or expired — try getting existing session instead
            // This handles the case where the user refreshes /dashboard?userId=X&secret=Y
            const isTokenError =
              err?.code === 401 ||
              err?.message?.toLowerCase().includes("token") ||
              err?.message?.toLowerCase().includes("expired");
            if (!isTokenError) throw err;
          }
          window.history.replaceState({}, "", "/dashboard");
        }

        const me = await account.get();
        setUser(me);

        // Fetch active license
        const licRes = await databases.listDocuments<License>(DB_ID, LICENSES_COLLECTION_ID, [
          Query.equal("userId", me.$id),
          Query.equal("status", "active"),
          Query.orderDesc("$createdAt"),
          Query.limit(1),
        ]);

        if (licRes.documents.length > 0) {
          const lic = licRes.documents[0];
          setLicense(lic);

          // Fetch device count
          if (DEVICES_COLLECTION_ID) {
            try {
              const devRes = await databases.listDocuments(DB_ID, DEVICES_COLLECTION_ID, [
                Query.equal("licenseId", lic.$id),
              ]);
              setDeviceCount(devRes.total);
            } catch {
              // Devices collection may not be set up yet
            }
          }
        }
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router, searchParams]);

  const handleCopy = () => {
    if (!license) return;
    navigator.clipboard.writeText(license.licenseKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <RiLoader5Line className="animate-spin" size={28} style={{ color: "var(--text-muted)" }} />
      </div>
    );
  }

  if (!user) return null;

  const lifetime = license ? isLifetime(license.expiresAt) : false;
  const days = license && !lifetime ? daysRemaining(license.expiresAt) : null;
  const isExpiringSoon = days !== null && days <= 7;
  const isExpired = license?.status === "expired" || (days !== null && days === 0);

  return (
    <div style={{ padding: "40px" }}>
      {/* Heading */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          Overview
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
          Welcome back{user.name ? `, ${user.name}` : ""}.
        </p>
      </div>

      {/* Top stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {/* Account */}
        <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <RiUserLine size={14} style={{ color: "var(--text-muted)" }} />
            <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Account</span>
          </div>
          <div>
            <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>{user.name || "—"}</p>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>{user.email}</p>
          </div>
        </div>

        {/* Plan */}
        <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <RiPriceTag3Line size={14} style={{ color: "var(--text-muted)" }} />
            <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Plan</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>
                {license ? license.planName : "No plan"}
              </p>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                {license ? (license.price === 0 ? "Free forever" : `₹${license.price}/mo`) : "Choose a plan to get started"}
              </p>
            </div>
            {license && (
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: "99px",
                  background: isExpired ? "var(--bg-elevated)" : "#dcfce7",
                  color: isExpired ? "var(--text-muted)" : "#16a34a",
                  border: `1px solid ${isExpired ? "var(--border)" : "#bbf7d0"}`,
                }}
              >
                {isExpired ? "Expired" : "Active"}
              </span>
            )}
          </div>
        </div>

        {/* Devices */}
        <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <RiDeviceLine size={14} style={{ color: "var(--text-muted)" }} />
            <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Devices</span>
          </div>
          <div>
            <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>
              {license ? `${deviceCount} / ${license.maxDevices}` : "—"}
            </p>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
              {license ? "Active device slots" : "No license active"}
            </p>
          </div>
        </div>
      </div>

      {/* License detail card */}
      {license ? (
        <div className="glass-card" style={{ padding: "24px", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <RiShieldCheckLine size={16} style={{ color: "var(--text-muted)" }} />
              <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>License</span>
            </div>
            <Link
              href="/dashboard/billing"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "12px",
                color: "var(--text-secondary)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Manage <RiArrowRightLine size={13} />
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* License key row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", color: "var(--text-secondary)", minWidth: "100px" }}>License key</span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--text-primary)", letterSpacing: "0.05em" }}>
                  {license.licenseKey}
                </span>
                <button
                  onClick={handleCopy}
                  title="Copy"
                  style={{ background: "none", border: "none", cursor: "pointer", color: copied ? "#16a34a" : "var(--text-muted)", padding: "2px", display: "flex", alignItems: "center" }}
                >
                  {copied ? <RiCheckDoubleLine size={14} /> : <RiFileCopyLine size={14} />}
                </button>
              </div>
            </div>

            <div style={{ height: "1px", background: "var(--border)" }} />

            {/* Expiry row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", color: "var(--text-secondary)", minWidth: "100px" }}>Expires</span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>
                  {lifetime
                    ? "Lifetime"
                    : new Date(license.expiresAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                </span>
                {!lifetime && days !== null && (
                  <span style={{
                    fontSize: "11px",
                    padding: "1px 7px",
                    borderRadius: "99px",
                    border: "1px solid var(--border)",
                    background: "var(--bg-elevated)",
                    color: isExpiringSoon ? "#dc2626" : "var(--text-muted)",
                  }}>
                    {days === 0 ? "Expired" : `${days}d left`}
                  </span>
                )}
              </div>
            </div>

            <div style={{ height: "1px", background: "var(--border)" }} />

            {/* Member since row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", color: "var(--text-secondary)", minWidth: "100px" }}>Activated</span>
              <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>
                {new Date(license.$createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>

            <div style={{ height: "1px", background: "var(--border)" }} />

            {/* Device slots row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", color: "var(--text-secondary)", minWidth: "100px" }}>Devices</span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: 500, color: deviceCount >= license.maxDevices ? "#dc2626" : "var(--text-primary)" }}>
                  {deviceCount} / {license.maxDevices} used
                </span>
                <div style={{ display: "flex", gap: "3px" }}>
                  {Array.from({ length: license.maxDevices }).map((_, i) => (
                    <div key={i} style={{
                      width: "8px", height: "8px", borderRadius: "50%",
                      background: i < deviceCount ? "var(--accent)" : "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                    }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Expiring soon warning */}
          {isExpiringSoon && !isExpired && (
            <div style={{
              marginTop: "16px",
              padding: "10px 14px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              <RiErrorWarningLine size={15} style={{ color: "#dc2626", flexShrink: 0 }} />
              <span style={{ fontSize: "12px", color: "#dc2626" }}>
                Your license expires in {days} day{days !== 1 ? "s" : ""}. <Link href="/dashboard/billing" style={{ fontWeight: 600, color: "#dc2626" }}>Renew now →</Link>
              </span>
            </div>
          )}
        </div>
      ) : (
        /* No license CTA */
        <div className="glass-card" style={{ padding: "24px", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>No active license</p>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
              Choose a plan to activate DBConnect on your devices.
            </p>
          </div>
          <Link href="/dashboard/billing" className="btn-primary" style={{ padding: "8px 18px", fontSize: "13px", whiteSpace: "nowrap" }}>
            Get a plan
          </Link>
        </div>
      )}

      {/* Account info row */}
      <div className="glass-card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <RiTimeLine size={15} style={{ color: "var(--text-muted)" }} />
          <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>Account</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[
            { label: "Name", value: user.name || "—" },
            { label: "Email", value: user.email },
            {
              label: "Verification",
              value: user.emailVerification ? "Verified" : "Not verified",
              highlight: user.emailVerification,
            },
            {
              label: "Member since",
              value: new Date(user.$createdAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }),
            },
          ].map(({ label, value, highlight }, i, arr) => (
            <React.Fragment key={label}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{label}</span>
                <span style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: highlight === true ? "#16a34a" : highlight === false ? "#dc2626" : "var(--text-primary)",
                }}>
                  {value}
                </span>
              </div>
              {i < arr.length - 1 && <div style={{ height: "1px", background: "var(--border)" }} />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <React.Suspense
      fallback={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
          <RiLoader5Line className="animate-spin" size={28} style={{ color: "var(--text-muted)" }} />
        </div>
      }
    >
      <DashboardContent />
    </React.Suspense>
  );
}
