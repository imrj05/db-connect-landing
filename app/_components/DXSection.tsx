import { 
  KeyboardIcon, 
  TerminalIcon, 
  LayoutIcon, 
  FolderIcon, 
  CPUIcon, 
  PaletteIcon 
} from "./FeatureIcons";

const dxFeatures = [
  {
    title: "Keyboard-First",
    desc: "Lightning fast shortcuts (⌘K, ⌘↵) for every action. Never touch your mouse if you don't want to.",
    Icon: KeyboardIcon,
  },
  {
    title: "Command Palette",
    desc: "A powerful unified search and command interface to access features instantly.",
    Icon: TerminalIcon,
  },
  {
    title: "Multi-Tab Workspace",
    desc: "Keep dozens of queries open and organized in a familiar tabbed interface.",
    Icon: LayoutIcon,
  },
  {
    title: "Grouped Connections",
    desc: "Organize your databases into logical groups like Production, Staging, and Local Dev.",
    Icon: FolderIcon,
  },
  {
    title: "Native Performance",
    desc: "Built with Tauri and a high-performance Rust backend. No Electron bloat, just speed.",
    Icon: CPUIcon,
  },
  {
    title: "Dark & Light Support",
    desc: "Beautifully crafted themes that respect your system settings and reduce eye strain.",
    Icon: PaletteIcon,
  },
];

export default function DXSection() {
  return (
    <section 
      id="dx" 
      style={{ 
        padding: "100px 0", 
        background: "var(--bg-surface)",
        position: "relative",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div className="section-container">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div className="badge" style={{ margin: "0 auto 16px" }}>
            Efficiency
          </div>
          <h2
            style={{
              fontSize: "clamp(28px, 3.5vw, 48px)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "var(--text-primary)",
              marginBottom: 16,
              lineHeight: 1.1,
            }}
          >
            Built for Productivity
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: 17,
              maxWidth: 580,
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
             DBConnect is engineered to stay out of your way and keep 
             you in the zone.
          </p>
        </div>

        {/* Feature grid */}
        <div 
          style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", 
            gap: 20 
          }}
        >
          {dxFeatures.map((feat) => (
            <div 
              key={feat.title} 
              className="group"
              style={{
                padding: "20px",
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
                borderRadius: "var(--radius-lg)",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
              }}
            >
              <div 
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "var(--radius-md)",
                  background: "var(--bg-elevated)",
                  color: "var(--text-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: 18,
                }}
              >
                <feat.Icon size={18} color="var(--text-primary)" />
              </div>
              <div>
                <h3 
                  style={{ 
                    fontSize: 16, 
                    fontWeight: 700, 
                    color: "var(--text-primary)", 
                    marginBottom: 6,
                    letterSpacing: "-0.01em" 
                  }}
                >
                  {feat.title}
                </h3>
                <p 
                  style={{ 
                    fontSize: 13.5, 
                    color: "var(--text-secondary)", 
                    lineHeight: 1.6 
                  }}
                >
                  {feat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
