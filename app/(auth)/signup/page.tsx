"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RiUserLine, RiMailLine, RiLockLine, RiGoogleFill, RiGithubFill, RiLoader5Line } from "react-icons/ri";
import { toast } from "sonner";
import { account } from "@/lib/appwrite";
import { ID } from "appwrite";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Create user account
      await account.create(ID.unique(), email, password, name);
      
      // Automatically log them in after signup
      await account.createEmailPasswordSession(email, password);
      
      toast.success("Account created successfully! Welcome to DBConnect.");
      router.push("/");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
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
          Create an Account
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
          Join DBConnect and start managing your data better.
        </p>
      </div>


      <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Name */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}>
            Full Name
          </label>
          <div style={{ position: "relative" }}>
            <RiUserLine 
               style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} 
               size={18} 
            />
            <input
              type="text"
              required
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
          <label style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}>
            Password
          </label>
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
          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Must be at least 8 characters.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{ width: "100%", padding: "10px", marginTop: "8px", position: "relative" }}
        >
          {loading ? <RiLoader5Line className="animate-spin" size={20} /> : "Get Started"}
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
          onClick={() => console.log("Google signup")}
        >
          <RiGoogleFill size={18} />
          Google
        </button>
        <button
          className="btn-secondary"
          style={{ flex: 1, padding: "10px", fontSize: "14px" }}
          onClick={() => console.log("GitHub signup")}
        >
          <RiGithubFill size={18} />
          GitHub
        </button>
      </div>

      <p style={{ textAlign: "center", fontSize: "14px", color: "var(--text-secondary)", marginTop: "24px" }}>
        Already have an account?{" "}
        <Link href="/login" style={{ color: "var(--text-primary)", fontWeight: 600, textDecoration: "none" }}>
          Log in
        </Link>
      </p>
    </div>
  );
}
