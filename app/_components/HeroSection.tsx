import HeroMockup from "./HeroMockup";
import { RiSparklingFill, RiAppleFill, RiWindowsFill, RiGithubFill } from "react-icons/ri";

export default function HeroSection() {
  return (
    <section
      id="hero"
      style={{
        position: "relative",
        paddingTop: "140px",
        paddingBottom: "100px",
        overflow: "hidden",
        backgroundColor: "var(--bg-base)",
      }}
    >
      {/* Background Dot Grid */}
      <div
        className="dot-grid"
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.5,
          maskImage: "radial-gradient(ellipse 60% 50% at 50% 0%, black 20%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 0%, black 20%, transparent 80%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div className="section-container" style={{ position: "relative", zIndex: 1 }}>
        {/* Badge */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }} className="animate-fade-in-up">
          <div className="badge">
            <RiSparklingFill size={12} style={{ marginRight: 6, color: "var(--accent)" }} />
            <span>Native support for MariaDB & SQLite</span>
          </div>
        </div>

        {/* Headline */}
        <h1
          className="animate-fade-in-up delay-100"
          style={{
            textAlign: "center",
            fontSize: "clamp(40px, 5.5vw, 76px)",
            fontWeight: 800,
            letterSpacing: "-0.05em",
            marginBottom: 20,
            maxWidth: 1000,
            margin: "0 auto 20px",
            color: "var(--text-primary)",
          }}
        >
          A Fast, Modern Database GUI <br />
          for macOS & Windows
        </h1>

        {/* Subheadline */}
        <p
          className="animate-fade-in-up delay-200"
          style={{
            textAlign: "center",
            fontSize: "clamp(16px, 1.8vw, 19px)",
            color: "var(--text-secondary)",
            maxWidth: 640,
            margin: "0 auto 40px",
            lineHeight: 1.6,
            letterSpacing: "-0.01em",
          }}
        >
          Connect, query, and manage MySQL, PostgreSQL, MongoDB, Redis, 
          SQLite, and more — all in one professional interface.
        </p>

        {/* Primary CTA Buttons */}
        <div
          className="animate-fade-in-up delay-300"
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: 12,
            marginBottom: 80,
          }}
        >
          <a
            id="download-mac"
            href="#"
            className="btn-primary"
            style={{ fontWeight: 600 }}
          >
            <RiAppleFill size={18} />
            Download for macOS
          </a>
          <a
            id="download-win"
            href="#"
            className="btn-secondary"
            style={{ fontWeight: 600 }}
          >
            <RiWindowsFill size={18} />
            Download for Windows
          </a>
          <a
            id="view-docs"
            href="#"
            className="btn-secondary"
            style={{ fontWeight: 500 }}
          >
            Documentation
          </a>
        </div>

        {/* App Mockup with concise elevation */}
        <div 
          className="animate-fade-in-up delay-300"
          style={{ 
            marginTop: 40,
            position: "relative",
          }}
        >
          <HeroMockup />
        </div>
      </div>
    </section>
  );
}
