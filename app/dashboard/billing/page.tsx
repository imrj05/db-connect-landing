"use client";

import React, { useEffect, useState } from "react";
import { account, databases, DB_ID, LICENSES_COLLECTION_ID, DEVICES_COLLECTION_ID } from "@/lib/appwrite";
import { ID, Query, Permission, Role } from "appwrite";
import { PLANS, type PlanId } from "@/lib/plans";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  RiLoader5Line,
  RiCheckLine,
  RiFileCopyLine,
  RiCheckDoubleLine,
  RiComputerLine,
  RiDeleteBinLine,
  RiShieldCheckLine,
  RiTimeLine,
  RiDeviceLine,
  RiAppleLine,
  RiWindowsLine,
  RiTerminalLine,
  RiBankCardLine,
} from "react-icons/ri";
import type { Models } from "appwrite";

// ─── Types ────────────────────────────────────────────────────────────────────

type License = Models.Document & {
  userId: string;
  planId: PlanId;
  planName: string;
  licenseKey: string;
  status: "active" | "expired";
  expiresAt: string;
  maxDevices: number;
  price: number;
};

type Device = Models.Document & {
  licenseId: string;
  userId: string;
  deviceName: string;
  platform: string;
  lastSeen: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateLicenseKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const seg = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `DBK-${seg()}-${seg()}-${seg()}-${seg()}`;
}

function isLifetime(expiresAt: string): boolean {
  return (
    expiresAt === "lifetime" ||
    new Date(expiresAt).getFullYear() - new Date().getFullYear() > 20
  );
}

function daysRemaining(expiresAt: string): number {
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86_400_000));
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function PlatformIcon({ platform }: { platform: string }) {
  const p = platform?.toLowerCase() ?? "";
  if (p.includes("mac") || p.includes("darwin")) return <RiAppleLine size={15} />;
  if (p.includes("win")) return <RiWindowsLine size={15} />;
  if (p.includes("linux")) return <RiTerminalLine size={15} />;
  return <RiComputerLine size={15} />;
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const router = useRouter();
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [license, setLicense] = useState<License | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<PlanId | null>(null);
  const [removingDevice, setRemovingDevice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPlans, setShowPlans] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await account.get();
        setUser(me);
        const res = await databases.listDocuments<License>(DB_ID, LICENSES_COLLECTION_ID, [
          Query.equal("userId", me.$id),
          Query.equal("status", "active"),
          Query.orderDesc("$createdAt"),
          Query.limit(1),
        ]);
        if (res.documents.length > 0) {
          const lic = res.documents[0];
          setLicense(lic);
          await fetchDevices(lic.$id);
        }
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  const fetchDevices = async (licenseId: string) => {
    if (!DEVICES_COLLECTION_ID) return;
    try {
      const res = await databases.listDocuments<Device>(DB_ID, DEVICES_COLLECTION_ID, [
        Query.equal("licenseId", licenseId),
        Query.orderDesc("lastSeen"),
      ]);
      setDevices(res.documents);
    } catch {
      // Devices collection may not be configured yet
    }
  };

  // Free plan — create license directly via client SDK
  const createFreeLicense = async () => {
    const plan = PLANS.find((p) => p.id === "starter")!;
    if (!user) return;
    if (license) {
      await databases.updateDocument(DB_ID, LICENSES_COLLECTION_ID, license.$id, { status: "expired" });
    }
    const doc = await databases.createDocument<License>(
      DB_ID, LICENSES_COLLECTION_ID, ID.unique(),
      {
        userId: user.$id,
        planId: plan.id,
        planName: plan.name,
        licenseKey: generateLicenseKey(),
        status: "active",
        expiresAt: "lifetime",
        maxDevices: plan.maxDevices,
        price: 0,
      },
      [Permission.read(Role.user(user.$id)), Permission.update(Role.user(user.$id))]
    );
    setLicense(doc);
    setDevices([]);
    setShowPlans(false);
    toast.success("Starter plan activated!");
  };

  // Paid plan — Razorpay checkout → server verify → admin creates license
  const handleRazorpayCheckout = async (planId: PlanId) => {
    const plan = PLANS.find((p) => p.id === planId)!;
    if (!user) return;
    setPurchasing(planId);

    try {
      // 1. Create Razorpay order server-side
      const orderRes = await fetch("/api/subscription/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, userId: user.$id }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error ?? "Failed to create order");

      // 2. Load Razorpay.js
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Failed to load Razorpay checkout. Check your connection.");

      // 3. Open checkout and await result
      await new Promise<void>((resolve, reject) => {
        const rzp = new (window as any).Razorpay({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "DBConnect",
          description: `${plan.name} Plan`,
          order_id: orderData.orderId,
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            try {
              // 4. Verify on server + create license with admin key
              const verifyRes = await fetch("/api/subscription/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  planId,
                  userId: user.$id,
                }),
              });
              const verifyData = await verifyRes.json();
              if (!verifyRes.ok) throw new Error(verifyData.error ?? "Verification failed");

              setLicense(verifyData.license as License);
              setDevices([]);
              setShowPlans(false);
              toast.success(`${plan.name} plan activated!`);
              resolve();
            } catch (err: any) {
              toast.error(err.message ?? "Payment verified but license creation failed.");
              reject(err);
            }
          },
          modal: {
            ondismiss: () => {
              setPurchasing(null);
              reject(new Error("cancelled"));
            },
          },
          prefill: { name: user.name ?? "", email: user.email ?? "" },
          theme: { color: "#4f46e5" },
        });
        rzp.open();
      });
    } catch (err: any) {
      if (err.message !== "cancelled") {
        toast.error(err.message ?? "Payment failed. Please try again.");
      }
    } finally {
      setPurchasing(null);
    }
  };

  const handleBuyPlan = async (planId: PlanId) => {
    if (planId === "starter") {
      setPurchasing("starter");
      try { await createFreeLicense(); } catch (err: any) { toast.error(err.message); }
      finally { setPurchasing(null); }
    } else {
      await handleRazorpayCheckout(planId);
    }
  };

  const handleCopy = () => {
    if (!license) return;
    navigator.clipboard.writeText(license.licenseKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemoveDevice = async (deviceId: string) => {
    if (!DEVICES_COLLECTION_ID) return;
    setRemovingDevice(deviceId);
    try {
      await databases.deleteDocument(DB_ID, DEVICES_COLLECTION_ID, deviceId);
      setDevices((prev) => prev.filter((d) => d.$id !== deviceId));
      toast.success("Device removed.");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to remove device.");
    } finally {
      setRemovingDevice(null);
    }
  };

  // ─── Loading ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <RiLoader5Line className="animate-spin" size={28} style={{ color: "var(--text-muted)" }} />
      </div>
    );
  }

  // ─── Plans grid ───────────────────────────────────────────────────────────

  if (!license || showPlans) {
    return (
      <div style={{ padding: "40px" }}>
        <div style={{ marginBottom: "32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              {showPlans ? "Change plan" : "Choose a plan"}
            </h1>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
              {showPlans
                ? "Select a new plan. Your current license will be replaced."
                : "Get a license to activate DBConnect on your devices."}
            </p>
          </div>
          {showPlans && (
            <button className="btn-secondary" style={{ padding: "7px 14px", fontSize: "13px" }} onClick={() => setShowPlans(false)}>
              Cancel
            </button>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", maxWidth: "860px" }}>
          {PLANS.map((plan) => {
            const isCurrent = showPlans && license?.planId === plan.id;
            const isBuying = purchasing === plan.id;
            return (
              <div
                key={plan.id}
                className="glass-card"
                style={{
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  border: plan.popular ? "1px solid var(--accent)" : undefined,
                }}
              >
                {plan.popular && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-11px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#fff",
                      background: "var(--accent)",
                      padding: "2px 10px",
                      borderRadius: "99px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Most popular
                  </span>
                )}

                <div style={{ marginBottom: "20px" }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                    {plan.name}
                  </p>
                  <p style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
                    {plan.priceLabel}
                  </p>
                </div>

                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px", flex: 1 }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-secondary)" }}>
                      <RiCheckLine size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  className={plan.popular ? "btn-primary" : "btn-secondary"}
                  style={{ width: "100%", padding: "9px", fontSize: "13px" }}
                  disabled={purchasing !== null || isCurrent}
                  onClick={() => handleBuyPlan(plan.id)}
                >
                  {isBuying ? (
                    <RiLoader5Line className="animate-spin" size={16} />
                  ) : isCurrent ? (
                    "Current plan"
                  ) : plan.price === 0 ? (
                    "Get started free"
                  ) : (
                    <span style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
                      <RiBankCardLine size={15} />
                      Pay with Razorpay
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <p style={{ marginTop: "20px", fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "5px" }}>
          <RiBankCardLine size={13} />
          Payments are processed securely via Razorpay. Your card details never touch our servers.
        </p>
      </div>
    );
  }

  // ─── License view ─────────────────────────────────────────────────────────

  const lifetime = isLifetime(license.expiresAt);
  const days = lifetime ? Infinity : daysRemaining(license.expiresAt);
  const currentPlan = PLANS.find((p) => p.id === license.planId);
  const isExpired = license.status === "expired" || (!lifetime && days === 0);
  const devicesFull = devices.length >= license.maxDevices;

  return (
    <div style={{ padding: "40px" }}>
      <div style={{ marginBottom: "32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Billing & License
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Manage your plan, license key, and registered devices.
          </p>
        </div>
        <button className="btn-secondary" style={{ padding: "7px 14px", fontSize: "13px" }} onClick={() => setShowPlans(true)}>
          Change plan
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "640px" }}>

        {/* Plan + license key */}
        <section className="glass-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <RiShieldCheckLine size={18} style={{ color: "var(--text-muted)" }} />
              <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                {license.planName} Plan
              </span>
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
            </div>
            <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              {currentPlan?.priceLabel}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* License key */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--text-primary)", letterSpacing: "0.05em" }}>
                {license.licenseKey}
              </span>
              <button
                onClick={handleCopy}
                title="Copy license key"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: copied ? "#16a34a" : "var(--text-muted)",
                  padding: "2px 4px",
                  display: "flex",
                  alignItems: "center",
                  transition: "color 0.15s",
                }}
              >
                {copied ? <RiCheckDoubleLine size={16} /> : <RiFileCopyLine size={16} />}
              </button>
            </div>

            {/* Expiry */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                <RiTimeLine size={14} style={{ color: "var(--text-muted)" }} />
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Expires</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>
                  {lifetime
                    ? "Lifetime"
                    : new Date(license.expiresAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </span>
                {!lifetime && !isExpired && (
                  <span
                    style={{
                      fontSize: "11px",
                      color: days <= 7 ? "#dc2626" : "var(--text-muted)",
                      background: "var(--bg-elevated)",
                      padding: "1px 7px",
                      borderRadius: "99px",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {days}d left
                  </span>
                )}
              </div>
            </div>

            {/* Device slots */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                <RiDeviceLine size={14} style={{ color: "var(--text-muted)" }} />
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Devices</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: 500, color: devicesFull ? "#dc2626" : "var(--text-primary)" }}>
                  {devices.length} / {license.maxDevices} used
                </span>
                <div style={{ display: "flex", gap: "3px" }}>
                  {Array.from({ length: license.maxDevices }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: i < devices.length ? "var(--accent)" : "var(--bg-elevated)",
                        border: "1px solid var(--border)",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Active devices */}
        <section className="glass-card" style={{ padding: "24px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "7px" }}>
            <RiComputerLine size={15} style={{ color: "var(--text-muted)" }} />
            Active devices
            <span style={{ fontSize: "11px", fontWeight: 500, color: "var(--text-muted)", background: "var(--bg-elevated)", border: "1px solid var(--border)", padding: "1px 7px", borderRadius: "99px", marginLeft: "2px" }}>
              {devices.length}
            </span>
          </h2>

          {devices.length === 0 ? (
            <div style={{ padding: "28px 20px", textAlign: "center", background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", border: "1px dashed var(--border)" }}>
              <RiComputerLine size={24} style={{ color: "var(--text-muted)", marginBottom: "8px" }} />
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>No devices registered yet</p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                Install DBConnect on your device and enter the license key to activate.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {devices.map((device) => (
                <div
                  key={device.$id}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ color: "var(--text-muted)" }}>
                      <PlatformIcon platform={device.platform} />
                    </div>
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>{device.deviceName}</p>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>
                        {device.platform && <span style={{ marginRight: "6px" }}>{device.platform}</span>}
                        Last seen {new Date(device.lastSeen).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveDevice(device.$id)}
                    disabled={removingDevice === device.$id}
                    title="Remove device"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px", display: "flex", alignItems: "center", transition: "color 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#dc2626")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                  >
                    {removingDevice === device.$id
                      ? <RiLoader5Line className="animate-spin" size={15} />
                      : <RiDeleteBinLine size={15} />}
                  </button>
                </div>
              ))}
            </div>
          )}

          {devicesFull && (
            <p style={{ fontSize: "12px", color: "#dc2626", marginTop: "12px" }}>
              Device limit reached. Remove a device or upgrade your plan.
            </p>
          )}
        </section>

      </div>
    </div>
  );
}
