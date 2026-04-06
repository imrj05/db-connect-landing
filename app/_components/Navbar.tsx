"use client";

import Link from "next/link";
import { RiDatabase2Fill } from "react-icons/ri";

export default function Navbar() {
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
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "64px",
        }}
      >
        {/* Logo */}
        <a
          href="#"
          className="logo-link"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "var(--radius-md)",
              background: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: "var(--bg-base)",
            }}
          >
            <RiDatabase2Fill size={16} />
          </div>
          <span
            style={{
              fontWeight: 700,
              fontSize: 16,
              letterSpacing: "-0.03em",
              color: "var(--text-primary)",
            }}
          >
            DBConnect
          </span>
        </a>

        {/* Nav Links */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {[
            { label: "Features", href: "#features" },
            { label: "Databases", href: "#databases" },
            { label: "Roadmap", href: "#roadmap" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="nav-link"
              style={{ padding: "8px 16px" }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/login" className="nav-link" style={{ fontSize: 13, fontWeight: 600, padding: "8px 12px" }}>
            Sign In
          </Link>
          <Link href="/signup" className="btn-primary" style={{ padding: "8px 16px", fontSize: 13, fontWeight: 600 }}>
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  );
}
