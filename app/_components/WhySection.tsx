import {
  SpeedIcon,
  MinimalIcon,
  PlugIcon,
  ComputerIcon,
  PuzzleIcon,
} from "./FeatureIcons";
import { Badge } from "@/components/ui/badge";
import type { FC } from "react";

type DiffItem = {
  id: string;
  Icon: FC<any>;
  title: string;
  desc: string;
};

const differentiators: DiffItem[] = [
  {
    id: "fast",
    Icon: SpeedIcon,
    title: "Blazing fast",
    desc: "No Electron. No web wrapper. Pure native performance with Tauri + Rust backend. Starts in milliseconds.",
  },
  {
    id: "minimal",
    Icon: MinimalIcon,
    title: "Minimalist UI",
    desc: "Every pixel is intentional. No cluttered toolbars or feature bloat — just you and your data.",
  },
  {
    id: "multi",
    Icon: PlugIcon,
    title: "Multi-database",
    desc: "Connect to MySQL, PostgreSQL, MongoDB, Redis, SQLite, and MariaDB — all in one interface.",
  },
  {
    id: "offline",
    Icon: ComputerIcon,
    title: "Fully local & offline",
    desc: "No telemetry, no cloud sync. Your connection credentials never leave your machine.",
  },
  {
    id: "devfirst",
    Icon: PuzzleIcon,
    title: "Built for developers",
    desc: "Keyboard‑first UX, SQL‑first interface, and real DBA features. Not a toy for non‑technical users.",
  },
];

export default function WhySection() {
  return (
    <section
      id="why"
      className="relative py-24 md:py-32 bg-background border-t border-border isolate"
    >
      {/* Background Pattern */}
      <div
        className="dot-grid absolute inset-0 opacity-50 pointer-events-none -z-1"
        style={{
          maskImage: "radial-gradient(circle at center, black, transparent 80%)",
          WebkitMaskImage: "radial-gradient(circle at center, black, transparent 80%)",
        }}
      />
      <div className="section-container relative">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-5">The Difference</Badge>
          <h2 className="text-[clamp(28px,3.5vw,40px)] font-extrabold tracking-tight mb-5 text-foreground leading-[1.15]">
            The tools you&apos;ve <span className="gradient-text">Been Waiting For</span>
          </h2>
          <p className="text-secondary text-[16.5px] max-w-[520px] mx-auto leading-relaxed font-medium">
            We stripped away everything developers hate about traditional 
            GUIs and rebuilt from the ground up for speed.
          </p>
        </div>

        {/* Grid layout — 5 items: 3+2, center last row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {differentiators.slice(0, 3).map((d) => (
            <DiffCard key={d.id} {...d} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-[calc(66.666%+10px)] mx-auto mt-5 max-[1023px]:max-w-6xl">
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
    <div className="group p-8 bg-card border border-border rounded-xl transition-all duration-300 hover:shadow-md hover:border-accent/30 hover:-translate-y-1">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg bg-elevated text-foreground flex items-center justify-center border border-border group-hover:bg-accent group-hover:text-white transition-colors duration-300 shadow-sm">
          <Icon size={20} />
        </div>
        <h3 className="text-[19px] font-bold text-foreground tracking-tight">
          {title}
        </h3>
      </div>
      <p className="text-[15px] text-secondary leading-relaxed font-medium">
        {desc}
      </p>
    </div>
  );
}
