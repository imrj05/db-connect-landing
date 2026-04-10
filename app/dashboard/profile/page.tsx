"use client";

import React, { useEffect, useState } from "react";
import { account } from "@/lib/appwrite";
import { useRouter } from "next/navigation";
import {
  RiLoader5Line,
  RiUserLine,
  RiMailLine,
  RiLockLine,
  RiCheckLine,
  RiEditLine,
} from "react-icons/ri";
import { toast } from "sonner";
import type { Models } from "appwrite";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);

  // Name section
  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);

  // Password section
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    account
      .get()
      .then((me) => {
        setUser(me);
        setName(me.name ?? "");
      })
      .catch(() => router.replace("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSavingName(true);
    try {
      const updated = await account.updateName(name.trim());
      setUser(updated);
      toast.success("Name updated successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to update name.");
    } finally {
      setSavingName(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    setSavingPassword(true);
    try {
      await account.updatePassword(newPassword, oldPassword);
      setOldPassword("");
      setNewPassword("");
      toast.success("Password updated successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password.");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <RiLoader5Line className="animate-spin" size={28} style={{ color: "var(--text-muted)" }} />
      </div>
    );
  }

  if (!user) return null;

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px 9px 38px",
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-primary)",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s ease",
  };

  const iconStyle: React.CSSProperties = {
    position: "absolute",
    left: "11px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "var(--text-muted)",
    pointerEvents: "none",
  };

  return (
    <div style={{ padding: "40px" }}>
      {/* Page heading */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          Profile
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
          Manage your account details and security.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "560px" }}>

        {/* Account Info — read-only */}
        <section
          className="glass-card"
          style={{ padding: "24px" }}
        >
          <h2 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "16px" }}>
            Account info
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>User ID</span>
              <span
                style={{
                  fontSize: "12px",
                  fontFamily: "var(--font-mono)",
                  color: "var(--text-secondary)",
                  background: "var(--bg-elevated)",
                  padding: "3px 8px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)",
                }}
              >
                {user.$id}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Email</span>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "13px", color: "var(--text-primary)" }}>{user.email}</span>
                {user.emailVerification && (
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 500,
                      color: "#16a34a",
                      background: "#dcfce7",
                      padding: "1px 6px",
                      borderRadius: "99px",
                      display: "flex",
                      alignItems: "center",
                      gap: "3px",
                    }}
                  >
                    <RiCheckLine size={11} /> Verified
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Member since</span>
              <span style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                {new Date(user.$createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>
          </div>
        </section>

        {/* Update Name */}
        <section className="glass-card" style={{ padding: "24px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "7px" }}>
            <RiEditLine size={15} style={{ color: "var(--text-muted)" }} />
            Display name
          </h2>
          <form onSubmit={handleUpdateName} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ position: "relative" }}>
              <RiUserLine size={16} style={iconStyle} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "var(--text-primary)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                disabled={savingName || name.trim() === (user.name ?? "")}
                className="btn-primary"
                style={{ padding: "8px 18px", fontSize: "13px" }}
              >
                {savingName ? <RiLoader5Line className="animate-spin" size={16} /> : "Save"}
              </button>
            </div>
          </form>
        </section>

        {/* Change Password */}
        <section className="glass-card" style={{ padding: "24px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px", display: "flex", alignItems: "center", gap: "7px" }}>
            <RiLockLine size={15} style={{ color: "var(--text-muted)" }} />
            Change password
          </h2>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
            Leave current password blank if you signed up via OAuth.
          </p>
          <form onSubmit={handleUpdatePassword} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>
                Current password
              </label>
              <div style={{ position: "relative" }}>
                <RiLockLine size={16} style={iconStyle} />
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "var(--text-primary)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>
                New password
              </label>
              <div style={{ position: "relative" }}>
                <RiLockLine size={16} style={iconStyle} />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "var(--text-primary)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Must be at least 8 characters.</p>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                disabled={savingPassword || !newPassword}
                className="btn-primary"
                style={{ padding: "8px 18px", fontSize: "13px" }}
              >
                {savingPassword ? <RiLoader5Line className="animate-spin" size={16} /> : "Update password"}
              </button>
            </div>
          </form>
        </section>

      </div>
    </div>
  );
}
