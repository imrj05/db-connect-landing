import HeroMockup from "./HeroMockup";
import { RiAppleFill, RiWindowsFill } from "react-icons/ri";
import { SparkleIcon } from "./FeatureIcons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative pt-32 md:pt-48 pb-20 md:pb-32 overflow-hidden bg-background isolate"
    >
      {/* Background Dot Grid */}
      <div
        className="dot-grid absolute inset-0 opacity-80 pointer-events-none -z-1"
        style={{
          maskImage: "radial-gradient(ellipse 60% 50% at 50% 0%, black 20%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 0%, black 20%, transparent 80%)",
        }}
      />

      <div className="section-container relative">
        {/* Badge */}
        <div className="flex justify-center mb-8 animate-fade-in-up">
          <Badge className="group py-1 px-3">
            <SparkleIcon size={14} className="mr-1.5 text-accent" />
            <span>Native support for MariaDB & SQLite</span>
          </Badge>
        </div>

        {/* Headline */}
        <h1
          className="animate-fade-in-up delay-100 text-center text-[clamp(2rem,5vw,3.75rem)] font-extrabold tracking-tight leading-[1.05] mb-6 max-w-4xl mx-auto text-foreground"
        >
          A Fast, Modern Database GUI <br />
          for macOS & Windows
        </h1>

        {/* Subheadline */}
        <p
          className="animate-fade-in-up delay-200 text-center text-[clamp(0.9375rem,1.6vw,1.125rem)] text-secondary max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
        >
          Connect, query, and manage MySQL, PostgreSQL, MongoDB, Redis, 
          SQLite, and more — all in one professional interface.
        </p>

        {/* Primary CTA Buttons */}
        <div
          className="animate-fade-in-up delay-300 flex flex-wrap justify-center items-center gap-3 mb-20"
        >
          <Button asChild size="lg" className="h-12 px-8 font-semibold">
            <a
              id="download-mac"
              href="https://github.com/imrj05/db-connect/releases/latest"
            >
              <RiAppleFill size={18} />
              Download for macOS
            </a>
          </Button>
          <Button asChild variant="secondary" size="lg" className="h-12 px-8 font-semibold">
            <a
              id="download-win"
              href="https://github.com/imrj05/db-connect/releases/latest"
            >
              <RiWindowsFill size={18} />
              Download for Windows
            </a>
          </Button>
          <Button asChild variant="secondary" size="lg" className="h-12 px-8 font-medium">
            <a id="view-docs" href="#">
              Documentation
            </a>
          </Button>
        </div>

        {/* App Mockup with concise elevation & glow */}
        <div className="animate-fade-in-up delay-300 mt-10 relative group">
          {/* Subtle Glow behind the mockup */}
          <div 
            className="absolute -inset-4 bg-[radial-gradient(circle,rgba(99,102,241,0.15)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -z-1"
          />
          <HeroMockup />
        </div>
      </div>
    </section>
  );
}
