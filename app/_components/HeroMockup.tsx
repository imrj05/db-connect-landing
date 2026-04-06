"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { RiCheckFill } from "react-icons/ri";

export default function HeroMockup() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 1000,
        margin: "0 auto",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-lg)",
        position: "relative",
        background: "var(--bg-card)",
      }}
    >
      {/* Titlebar */}
      <div
        style={{
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          overflowX: "auto",
        }}
      >
        {[
          { label: "users", active: true },
          { label: "orders", active: false },
          { label: "analytics.sql", active: false },
        ].map((tab) => (
          <div
            key={tab.label}
            style={{
              padding: "10px 20px",
              fontSize: 12,
              fontFamily: "var(--font-mono)",
              color: tab.active ? "var(--text-primary)" : "var(--text-muted)",
              borderBottom: tab.active ? "2px solid var(--text-primary)" : "2px solid transparent",
              background: tab.active ? "var(--bg-elevated)" : "transparent",
              whiteSpace: "nowrap",
              cursor: "default",
              fontWeight: tab.active ? 600 : 400,
            }}
          >
            {tab.label}
          </div>
        ))}
      </div>

      {/* Body: left sidebar + main content */}
      <div style={{ display: "flex", height: 420, background: isDark ? "#09090b" : "#ffffff" }}>
        {/* Sidebar */}
        <div
          style={{
            width: 200,
            borderRight: "1px solid var(--border)",
            background: "var(--bg-surface)",
            display: "flex",
            flexDirection: "column",
            padding: "12px 0",
            flexShrink: 0,
          }}
        >
          {/* Connection groups */}
          {[
            {
              label: "Production",
              color: "#ef4444",
              tables: ["users", "orders", "products"],
            },
            {
              label: "Staging",
              color: "#f59e0b",
              tables: ["users", "sessions"],
            },
            { label: "Local", color: "#22c55e", tables: ["dev_db"] },
          ].map((group) => (
            <div key={group.label} style={{ marginBottom: 8 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 14px",
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: group.color,
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {group.label}
                </span>
              </div>
              {group.tables.map((table) => (
                <div
                  key={table}
                  style={{
                    padding: "6px 14px 6px 26px",
                    fontSize: 12,
                    fontFamily: "var(--font-mono)",
                    color:
                      group.label === "Production" && table === "users"
                        ? "var(--text-primary)"
                        : "var(--text-secondary)",
                    background:
                      group.label === "Production" && table === "users"
                        ? "var(--bg-elevated)"
                        : "transparent",
                    cursor: "default",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <rect x="1" y="1" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                  </svg>
                  {table}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Main area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Query editor */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--border)",
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              lineHeight: 1.7,
              background: "var(--bg-card)",
            }}
          >
            <div style={{ display: "flex", gap: 16 }}>
              {/* Line numbers */}
              <div
                style={{
                  color: "var(--text-muted)",
                  userSelect: "none",
                  textAlign: "right",
                  minWidth: 20,
                  opacity: 0.5,
                }}
              >
                {[1, 2, 3].map((n) => (
                  <div key={n}>{n}</div>
                ))}
              </div>
              {/* Code */}
              <div>
                <div>
                  <span style={{ color: "#818cf8", fontWeight: 600 }}>SELECT</span>
                  <span style={{ color: "var(--text-primary)" }}> id, name, email</span>
                </div>
                <div>
                  <span style={{ color: "#818cf8", fontWeight: 600 }}>FROM</span>
                  <span style={{ color: "var(--text-primary)" }}> users</span>
                </div>
                <div>
                  <span style={{ color: "#818cf8", fontWeight: 600 }}>WHERE</span>
                  <span style={{ color: "var(--text-primary)" }}> created_at &gt; </span>
                  <span style={{ color: "#4ade80" }}>&apos;2024-01-01&apos;</span>
                </div>
              </div>
            </div>

            {/* Toolbar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginTop: 16,
              }}
            >
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  background: "var(--primary)",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  color: "var(--primary-foreground)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Run Query
              </button>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                }}
              >
                ⌘↵
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 11,
                  color: "#22c55e",
                  background: "rgba(34,197,94,0.1)",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontWeight: 600,
                }}
              >
                <RiCheckFill size={14} />
                Execution Success
              </span>
            </div>
          </div>

          {/* Results table */}
          <div style={{ flex: 1, overflow: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 12,
                fontFamily: "var(--font-mono)",
              }}
            >
              <thead>
                <tr style={{ background: "var(--bg-surface)" }}>
                  {["id", "name", "email", "role"].map((col) => (
                    <th
                      key={col}
                      style={{
                        padding: "10px 14px",
                        textAlign: "left",
                        color: "var(--text-muted)",
                        fontWeight: 600,
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        borderBottom: "1px solid var(--border)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 1, name: "Alice Johnson", email: "alice@acme.io", role: "admin" },
                  { id: 2, name: "Bob Chen", email: "bob@devco.com", role: "user" },
                  { id: 3, name: "Carol Diaz", email: "carol@startup.dev", role: "user" },
                ].map((row, i) => (
                  <tr
                    key={row.id}
                    style={{
                      background: i % 2 === 0 ? "transparent" : "var(--bg-surface)",
                    }}
                  >
                    <td style={{ padding: "8px 14px", color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}>{row.id}</td>
                    <td style={{ padding: "8px 14px", color: "var(--text-primary)", borderBottom: "1px solid var(--border)" }}>{row.name}</td>
                    <td style={{ padding: "8px 14px", color: "var(--text-primary)", borderBottom: "1px solid var(--border)" }}>{row.email}</td>
                    <td style={{ padding: "8px 14px", borderBottom: "1px solid var(--border)" }}>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: "var(--radius-sm)",
                          fontSize: 11,
                          fontWeight: 600,
                          background: "var(--bg-elevated)",
                          color: "var(--text-secondary)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        {row.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
