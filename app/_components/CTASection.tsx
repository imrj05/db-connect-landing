import { RiAppleFill, RiGithubFill } from "react-icons/ri";
import { getLatestRelease } from "@/lib/github";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function CTASection() {
  const latestRelease = await getLatestRelease();
  const version = latestRelease?.tag_name || "v0.9.8"; // Fallback to v0.9.8 if fetch fails

  return (
    <section
      id="download"
      className="relative py-24 md:py-40 overflow-hidden text-center bg-background isolate"
    >
      {/* Background Pattern */}
      <div
        className="dot-grid absolute inset-0 opacity-50 pointer-events-none -z-1"
        style={{
          maskImage: "radial-gradient(circle at center, black, transparent 80%)",
          WebkitMaskImage: "radial-gradient(circle at center, black, transparent 80%)",
        }}
      />
      {/* Background gradients */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.05)_0%,transparent_60%)] pointer-events-none -z-1"
      />

      <div className="section-container relative">
        <div className="p-8 md:p-16 bg-card border border-border rounded-lg shadow-sm">
          <Badge className="mx-auto mb-6">Get Started</Badge>
          <h2 className="text-[clamp(30px,4vw,48px)] font-extrabold tracking-tight text-foreground mb-5 leading-[1.15]">
            Built for developers who <br />
            live in their database.
          </h2>
          <p className="text-secondary text-[17px] max-w-[600px] mx-auto mb-10 leading-relaxed font-medium">
            Experience the fastest native database client ever built. 
            Download today and upgrade your workflow.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="h-12 px-8 font-semibold rounded-md">
              <a
                id="final-download-btn"
                href="https://github.com/imrj05/db-connect/releases/latest"
              >
                <RiAppleFill size={18} />
                Download Now
              </a>
            </Button>
            <Button asChild variant="secondary" size="lg" className="h-12 px-8 font-semibold rounded-md">
              <a
                id="final-github-btn"
                href="https://github.com/imrj05/db-connect"
              >
                <RiGithubFill size={18} />
                View on GitHub
              </a>
            </Button>
          </div>

          <div className="mt-10 flex items-center justify-center gap-6">
            <span className="text-[13px] text-muted flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
              Latest Version: {version}
            </span>
            <div className="w-px h-4 bg-border" />
            <span className="text-[13px] text-muted">
              License: MIT
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
