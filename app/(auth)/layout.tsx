"use client";

import React from "react";
import Link from "next/link";
import { RiArrowLeftLine } from "react-icons/ri";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--bg-base)",
        position: "relative",
        padding: "24px",
        overflow: "hidden",
      }}
    >
      {/* Background Decoration */}
      <div
        className="dot-grid"
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.3,
          maskImage: "radial-gradient(circle at 50% 50%, black, transparent 80%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 50%, black, transparent 80%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Back to Home */}
      <div
        style={{
          position: "absolute",
          top: "32px",
          left: "32px",
          zIndex: 10,
        }}
      >
        <Link
          href="/"
          className="nav-link"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          <RiArrowLeftLine />
          Back to Home
        </Link>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img src="/icons/logo.svg" alt="DBConnect Logo" width="32" height="32" />
          </div>
          <h1
            style={{
              fontSize: "20px",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "var(--text-primary)",
            }}
          >
            DBConnect
          </h1>
        </div>

        {children}
      </div>
    </div>
  );
}
