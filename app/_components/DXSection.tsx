import { 
  KeyboardIcon, 
  TerminalIcon, 
  LayoutIcon, 
  FolderIcon, 
  CPUIcon, 
  PaletteIcon 
} from "./FeatureIcons";
import { Badge } from "@/components/ui/badge";

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
      className="relative py-24 md:py-32 bg-surface border-y border-border isolate"
    >
      {/* Background Pattern */}
      <div
        className="dot-grid absolute inset-0 opacity-40 pointer-events-none -z-1"
        style={{
          maskImage: "radial-gradient(circle at center, black, transparent 80%)",
          WebkitMaskImage: "radial-gradient(circle at center, black, transparent 80%)",
        }}
      />
      <div className="section-container relative">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4">Efficiency</Badge>
          <h2 className="text-[clamp(26px,3vw,36px)] font-extrabold tracking-tight mb-4 text-foreground leading-[1.15]">
            Built for Productivity
          </h2>
          <p className="text-secondary text-[16.5px] max-w-[580px] mx-auto leading-relaxed">
             DBConnect is engineered to stay out of your way and keep 
             you in the zone.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {dxFeatures.map((feat) => (
            <div 
              key={feat.title} 
              className="group flex gap-5 items-start p-6 rounded-xl bg-card border border-border hover:border-accent/40 shadow-sm transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-elevated text-foreground flex items-center justify-center flex-shrink-0 text-[20px] shadow-inner group-hover:bg-accent group-hover:text-white transition-colors duration-300">
                <feat.Icon size={20} />
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-foreground mb-2 tracking-tight">
                  {feat.title}
                </h3>
                <p className="text-[14px] text-secondary leading-relaxed">
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
