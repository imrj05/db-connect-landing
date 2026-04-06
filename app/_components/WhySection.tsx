import {
  RiFlashlightFill,
  RiCrosshair2Fill,
  RiPlugFill,
  RiComputerLine,
  RiPuzzle2Fill,
} from "react-icons/ri";
import type { IconType } from "react-icons";

type DiffItem = {
  id: string;
  Icon: IconType;
  title: string;
  desc: string;
  accent: string;
  bg: string;
  border: string;
};

const differentiators: DiffItem[] = [
  {
    id: "fast",
    Icon: RiFlashlightFill,
    title: "Blazing fast",
    desc: "No Electron. No web wrapper. Pure native performance with Tauri + Rust backend. Starts in milliseconds.",
    accent: "var(--text-primary)",
    bg: "var(--bg-card)",
    border: "var(--border)",
  },
  {
    id: "minimal",
    Icon: RiCrosshair2Fill,
    title: "Minimalist UI",
    desc: "Every pixel is intentional. No cluttered toolbars or feature bloat — just you and your data.",
    accent: "var(--text-primary)",
    bg: "var(--bg-card)",
    border: "var(--border)",
  },
  {
    id: "multi",
    Icon: RiPlugFill,
    title: "Multi-database",
    desc: "Connect to MySQL, PostgreSQL, MongoDB, Redis, SQLite, and MariaDB — all in one interface.",
    accent: "var(--text-primary)",
    bg: "var(--bg-card)",
    border: "var(--border)",
  },
  {
    id: "offline",
    Icon: RiComputerLine,
    title: "Fully local & offline",
    desc: "No telemetry, no cloud sync. Your connection credentials never leave your machine.",
    accent: "var(--text-primary)",
    bg: "var(--bg-card)",
    border: "var(--border)",
  },
  {
    id: "devfirst",
    Icon: RiPuzzle2Fill,
    title: "Built for developers",
    desc: "Keyboard‑first UX, SQL‑first interface, and real DBA features. Not a toy for non‑technical users.",
    accent: "var(--text-primary)",
    bg: "var(--bg-card)",
    border: "var(--border)",
  },
];

export default function WhySection() {
  return (
    <section
      id="why"
      style={{
        padding: "120px 0",
        position: "relative",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div className="section-container">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <div className="badge" style={{ margin: "0 auto 20px" }}>
            The Difference
          </div>
          <h2
            style={{
              fontSize: "clamp(32px, 4vw, 52px)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "var(--text-primary)",
              marginBottom: 20,
              lineHeight: 1.1,
            }}
          >
            The tools you&apos;ve <span className="gradient-text">Been Waiting For</span>
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: 18,
              maxWidth: 520,
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            We stripped away everything developers hate about traditional 
            GUIs and rebuilt from the ground up for speed.
          </p>
        </div>

        {/* Top row: 3 cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
            marginBottom: 20,
          }}
        >
          {differentiators.slice(0, 3).map((d) => (
            <DiffCard key={d.id} {...d} />
          ))}
        </div>

        {/* Bottom row: 2 wider cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: 20,
          }}
        >
          {differentiators.slice(3).map((d) => (
            <DiffCard key={d.id} {...d} />
          ))}
        </div>
      </div>
    </section>
  );
}

function DiffCard({ Icon, title, desc }: DiffItem) {
  return (
    <div
      className="diff-card"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: 24,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "var(--bg-elevated)",
          color: "var(--text-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid var(--border)",
        }}>
          <Icon size={16} />
        </div>
        <h3
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h3>
      </div>
      <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.65 }}>
        {desc}
      </p>
    </div>
  );
}
