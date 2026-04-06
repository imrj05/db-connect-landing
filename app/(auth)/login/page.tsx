"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RiMailLine, RiLockLine, RiGoogleFill, RiGithubFill, RiLoader5Line } from "react-icons/ri";
import { toast } from "sonner";
import { account } from "@/lib/appwrite";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Create session
      await account.createEmailPasswordSession(email, password);
      
      toast.success("Welcome back! You've successfully signed in.");
      router.push("/");
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="glass-card animate-fade-in-up"
      style={{
        padding: "32px",
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-lg)",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <h2
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
            marginBottom: "8px",
          }}
        >
          Sign in to DBConnect
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
          Welcome back! Please enter your details.
        </p>
      </div>


      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Email */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}>
            Email Address
          </label>
          <div style={{ position: "relative" }}>
            <RiMailLine 
               style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} 
               size={18} 
            />
            <input
              type="email"
              required
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px 10px 40px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                color: "var(--text-primary)",
                fontSize: "14px",
                outline: "none",
                transition: "border-color 0.2s ease",
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--text-primary)"}
              onBlur={(e) => e.target.style.borderColor = "var(--border)"}
            />
          </div>
        </div>

        {/* Password */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}>
              Password
            </label>
            <a href="#" style={{ fontSize: "12px", color: "var(--text-secondary)", textDecoration: "none" }}>
              Forgot password?
            </a>
          </div>
          <div style={{ position: "relative" }}>
            <RiLockLine 
               style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} 
               size={18} 
            />
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px 10px 40px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                color: "var(--text-primary)",
                fontSize: "14px",
                outline: "none",
                transition: "border-color 0.2s ease",
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--text-primary)"}
              onBlur={(e) => e.target.style.borderColor = "var(--border)"}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{ width: "100%", padding: "10px", marginTop: "8px", position: "relative" }}
        >
          {loading ? <RiLoader5Line className="animate-spin" size={20} /> : "Sign in"}
        </button>
      </form>

      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "24px 0" }}>
        <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
        <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase" }}>Or continue with</span>
        <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
      </div>

      {/* Social Logins */}
      <div style={{ display: "flex", gap: "12px" }}>
        <button
          className="btn-secondary"
          style={{ flex: 1, padding: "10px", fontSize: "14px" }}
          onClick={() => console.log("Google login")}
        >
          <RiGoogleFill size={18} />
          Google
        </button>
        <button
          className="btn-secondary"
          style={{ flex: 1, padding: "10px", fontSize: "14px" }}
          onClick={() => console.log("GitHub login")}
        >
          <RiGithubFill size={18} />
          GitHub
        </button>
      </div>

      <p style={{ textAlign: "center", fontSize: "14px", color: "var(--text-secondary)", marginTop: "24px" }}>
        Don&apos;t have an account?{" "}
        <Link href="/signup" style={{ color: "var(--text-primary)", fontWeight: 600, textDecoration: "none" }}>
          Sign up
        </Link>
      </p>
    </div>
  );
}
