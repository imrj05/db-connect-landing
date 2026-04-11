"use client";

import { RiCheckboxCircleFill, RiDownloadCloudFill, RiRocketFill } from "react-icons/ri";
import { SparkleIcon } from "./FeatureIcons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const features = [
  "Unlimited database connections",
  "All core database drivers (MySQL, PG, SQLite...)",
  "Advanced SQL Editor with Autocomplete",
  "Schema Visualizer & ER Diagrams",
  "Multi-tab Workspace",
  "Native macOS & Windows support",
  "Secure SSH & SSL Tunneling",
  "Import/Export (CSV, JSON, SQL)",
];

export default function PricingSection() {
  return (
    <section
      id="pricing"
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
      {/* Background radial accent */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle,rgba(79,70,229,0.03)_0%,transparent_70%)] pointer-events-none -z-1"
      />

      <div className="section-container relative">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4">Simple Pricing</Badge>
          <h2 className="text-[clamp(26px,3vw,36px)] font-extrabold tracking-tight mb-4 text-foreground leading-[1.15]">
            Transparent, Simple, Free.
          </h2>
          <p className="text-secondary text-[16.5px] max-w-[580px] mx-auto leading-relaxed">
            DBConnect is currently in Alpha. We believe in providing the best 
            tools to developers without barriers during our early stages.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="flex justify-center">
          <div className="relative w-full max-w-[540px] p-8 md:p-12 glass-card bg-card border border-border rounded-2xl shadow-2xl transition-all duration-500 hover:border-accent/30 group">
            {/* Featured Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-accent text-white px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg group-hover:scale-105 transition-transform duration-300">
              <SparkleIcon size={14} className="text-white animate-pulse" />
              Alpha Access
            </div>

            <div className="text-center mb-10">
              <div className="text-xs font-bold text-accent mb-3 uppercase tracking-[0.2em]">
                Early Adopter Plan
              </div>
              <div className="flex items-baseline justify-center gap-1.5 mb-2">
                <span className="text-6xl font-extrabold text-foreground tracking-tighter">$0</span>
                <span className="text-lg text-secondary font-medium">/ month</span>
              </div>
              <p className="text-[15px] text-secondary font-medium">
                No credit card. No license keys. Just build.
              </p>
            </div>

            <div className="h-px bg-[linear-gradient(90deg,transparent,var(--border),transparent)] mb-10 opacity-60" />

            <div className="mb-10">
              <div className="text-[12px] font-bold text-foreground mb-6 uppercase tracking-[0.15em] opacity-80">
                Full-Feature Access
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-[14px] text-secondary leading-tight group-hover:text-foreground/90 transition-colors duration-300"
                  >
                    <RiCheckboxCircleFill
                      className="text-accent flex-shrink-0 mt-0.5"
                      size={18}
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button asChild className="w-full h-auto py-5 text-lg font-bold flex items-center justify-center gap-3 rounded-xl shadow-lg hover:shadow-accent/20 transition-all duration-300">
              <a href="https://github.com/imrj05/db-connect/releases/latest">
                <RiDownloadCloudFill size={22} />
                Get Started for Free
              </a>
            </Button>
            
            <div className="text-center mt-6">
              <span className="text-[12px] text-muted flex items-center justify-center gap-2 font-medium">
                <RiRocketFill size={16} className="text-accent/60" />
                Join 1,000+ developers in Alpha
              </span>
            </div>
          </div>
        </div>

        {/* Note about future */}
        <div className="text-center mt-12">
          <p className="text-[13px] text-muted max-w-[500px] mx-auto italic">
            * As we reach maturity, we might introduce paid plans for teams and enterprise users, 
            but the core features will always remain accessible for individual developers.
          </p>
        </div>
      </div>
    </section>
  );
}
