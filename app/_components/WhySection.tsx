import {
    SpeedIcon,
    MinimalIcon,
    PlugIcon,
    ComputerIcon,
    PuzzleIcon,
} from "./FeatureIcons";
import { Badge } from "@/components/ui/badge";
import type { FC } from "react";

type IconComponent = FC<{ size?: number; className?: string }>;

type DiffItem = {
    id: string;
    Icon: IconComponent;
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
            className="relative isolate overflow-hidden bg-background py-16 md:py-20"
        >
            <div className="section-soft-rings mask-radial-fade pointer-events-none absolute inset-0 -z-10 opacity-40" />
            <div className="section-container relative">
                <div className="mb-10 text-center">
                    <Badge className="mb-5">The Difference</Badge>
                    <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                        Why developers switch to DBConnect
                    </h2>
                    <p className="mx-auto max-w-xl text-sm leading-6 text-muted-foreground md:text-[15px]">
                        A quieter interface, native performance, and database workflows that stay close to how technical teams actually work.
                    </p>
                </div>

                <div className="mx-auto grid max-w-5xl grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {differentiators.slice(0, 3).map((d) => (
                        <DiffCard key={d.id} {...d} />
                    ))}
                </div>
                <div className="mx-auto mt-3 grid max-w-5xl grid-cols-1 gap-3 md:grid-cols-2 lg:max-w-[calc(66.666%-0.375rem)]">
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
        <div className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-foreground/20">
            <div className="mb-4 flex items-center gap-3">
                <div className="icon-tile group-hover:bg-elevated group-hover:text-foreground">
                    <Icon size={20} />
                </div>
                <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
                    {title}
                </h3>
            </div>
            <p className="text-[13px] leading-5 text-muted-foreground">
                {desc}
            </p>
        </div>
    );
}
