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
            className="relative isolate overflow-hidden bg-background py-16 md:py-20"
        >
            <div className="section-workflow-grid mask-radial-fade pointer-events-none absolute inset-0 -z-10 opacity-30" />
            <div className="section-container relative">
                <div className="mb-10 text-center">
                    <Badge className="mb-4">Efficiency</Badge>
                    <h2 className="section-heading mb-4 leading-[1.15]">
                        Built for Productivity
                    </h2>
                    <p className="section-copy max-w-xl">
                        DBConnect is engineered to stay out of your way and keep
                        you in the zone.
                    </p>
                </div>

                <div className="mx-auto grid max-w-5xl grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {dxFeatures.map((feat) => (
                        <div
                            key={feat.title}
                            className="group flex items-start gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/20"
                        >
                            <div className="icon-tile shrink-0 text-[18px] group-hover:bg-elevated group-hover:text-foreground">
                                <feat.Icon size={20} />
                            </div>
                            <div>
                                <h3 className="mb-1.5 text-[15px] font-semibold tracking-tight text-foreground">
                                    {feat.title}
                                </h3>
                                <p className="text-[13px] leading-5 text-muted-foreground">
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
