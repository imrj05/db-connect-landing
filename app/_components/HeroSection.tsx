import HeroMockup from "./HeroMockup";
import { RiAppleFill, RiWindowsFill } from "react-icons/ri";
import { SparkleIcon } from "./FeatureIcons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
export default function HeroSection() {
    return (
        <section
            id="hero"
            className="relative isolate overflow-hidden bg-background pb-14 pt-24 md:pb-20 md:pt-32"
        >
            <div className="dot-grid mask-hero-grid pointer-events-none absolute inset-0 -z-10 opacity-55" />
            <div className="section-container relative">
                <div className="animate-fade-in-up mb-5 flex justify-center">
                    <Badge className="px-2.5 py-1 text-[11px] font-medium">
                        <SparkleIcon size={14} className="mr-1.5 text-brand" />
                        <span>Native support for MariaDB & SQLite</span>
                    </Badge>
                </div>
                <h1
                    className="hero-heading animate-fade-in-up delay-100 mx-auto mb-4 max-w-4xl"
                >
                    A Fast, Modern Database GUI <br />
                    for macOS & Windows
                </h1>
                <p
                    className="animate-fade-in-up delay-200 mx-auto mb-7 max-w-xl text-center text-sm leading-6 text-muted-foreground md:text-[15px]"
                >
                    Connect, query, and manage MySQL, PostgreSQL, MongoDB, Redis,
                    SQLite, and more — all in one professional interface.
                </p>
                <div
                    className="animate-fade-in-up delay-300 mb-10 flex flex-wrap items-center justify-center gap-2.5"
                >
                    <Button asChild size="lg" className="h-10 px-4.5 text-[13px] font-medium">
                        <a
                            id="download-mac"
                            href="https://github.com/imrj05/db-connect/releases/latest"
                        >
                            <RiAppleFill size={18} />
                            Download for macOS
                        </a>
                    </Button>
                    <Button asChild variant="secondary" size="lg" className="h-10 px-4.5 text-[13px] font-medium">
                        <a
                            id="download-win"
                            href="https://github.com/imrj05/db-connect/releases/latest"
                        >
                            <RiWindowsFill size={18} />
                            Download for Windows
                        </a>
                    </Button>
                    <Button asChild variant="secondary" size="lg" className="h-10 px-4.5 text-[13px] font-medium">
                        <a id="view-docs" href="#">
                            Documentation
                        </a>
                    </Button>
                </div>
                <div className="animate-fade-in-up delay-300 mb-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] text-muted-foreground">
                    <span>Native desktop app</span>
                    <span className="hidden h-3 w-px bg-border sm:block" />
                    <span>Keyboard-first workflow</span>
                    <span className="hidden h-3 w-px bg-border sm:block" />
                    <span>Works offline</span>
                </div>
                <div className="animate-fade-in-up delay-300 relative mt-6">
                    <HeroMockup />
                </div>
            </div>
        </section>
    );
}
