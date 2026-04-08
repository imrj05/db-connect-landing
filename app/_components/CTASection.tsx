import { RiAppleFill, RiGithubFill } from "react-icons/ri";
import { getLatestRelease } from "@/lib/github";

export default async function CTASection() {
  const latestRelease = await getLatestRelease();
  const version = latestRelease?.tag_name || "v0.9.8"; // Fallback to v0.9.8 if fetch fails

  return (
    <section
      id="download"
      style={{
        padding: "160px 0",
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
        background: "var(--bg-base)",
      }}
    >
      {/* Background gradients */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, rgba(99,102,241,0.05) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      <div className="section-container" style={{ position: "relative" }}>
        <div 
          style={{ 
            padding: "64px 32px", 
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div className="badge" style={{ margin: "0 auto 24px" }}>
            Get Started
          </div>
          <h2
            style={{
              fontSize: "clamp(32px, 4vw, 56px)",
              fontWeight: 800,
              letterSpacing: "-0.05em",
              color: "var(--text-primary)",
              marginBottom: 20,
              lineHeight: 1.1,
            }}
          >
            Built for developers who <br />
            live in their database.
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: 18,
              maxWidth: 600,
              margin: "0 auto 40px",
              lineHeight: 1.6,
            }}
          >
            Experience the fastest native database client ever built. 
            Download today and upgrade your workflow.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 12,
            }}
          >
            <a
              id="final-download-btn"
              href="https://github.com/imrj05/db-connect/releases/latest"
              className="btn-primary"
              style={{ fontWeight: 600, borderRadius: "8px" }}
            >
              <RiAppleFill size={18} />
              Download Now
            </a>
            <a
              id="final-github-btn"
              href="https://github.com/imrj05/db-connect"
              className="btn-secondary"
              style={{ fontWeight: 600, borderRadius: "8px" }}
            >
              <RiGithubFill size={18} />
              View on GitHub
            </a>
          </div>

          <div
            style={{
              marginTop: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 24,
            }}
          >
            <span style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--neon-primary)" }} />
              Latest Version: {version}
            </span>
            <div style={{ width: 1, height: 16, background: "var(--border)" }} />
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
              License: MIT
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
