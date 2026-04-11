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
            className="relative isolate overflow-hidden bg-background py-16 md:py-20"
        >
            <div className="section-cta-beams mask-radial-fade pointer-events-none absolute inset-0 -z-10 opacity-35" />
            <div className="section-container relative">
                <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-6 text-center md:p-8">
                    <Badge className="mx-auto mb-5">Get Started</Badge>
                    <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                        Built for developers who <br />
                        live in their database.
                    </h2>
                    <p className="mx-auto mb-6 max-w-xl text-sm leading-6 text-muted-foreground md:text-[15px]">
                        Experience the fastest native database client ever built.
                        Download today and upgrade your workflow.
                    </p>

                    <div className="flex flex-wrap justify-center gap-2.5">
                        <Button asChild size="lg" className="h-10 rounded-lg px-4.5 text-[13px] font-medium">
                            <a
                                id="final-download-btn"
                                href="https://github.com/imrj05/db-connect/releases/latest"
                            >
                                <RiAppleFill size={18} />
                                Download Now
                            </a>
                        </Button>
                        <Button asChild variant="secondary" size="lg" className="h-10 rounded-lg px-4.5 text-[13px] font-medium">
                            <a
                                id="final-github-btn"
                                href="https://github.com/imrj05/db-connect"
                            >
                                <RiGithubFill size={18} />
                                View on GitHub
                            </a>
                        </Button>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground md:gap-5">
                        <span className="flex items-center gap-1.5 text-[13px]">
                            <div className="h-1.5 w-1.5 rounded-full bg-brand" />
                            Latest Version: {version}
                        </span>
                        <div className="w-px h-4 bg-border" />
                        <span className="text-[13px]">
                            License: MIT
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
