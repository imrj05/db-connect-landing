import { RiCheckboxCircleFill } from "react-icons/ri";
import {
    QueryIcon,
    TableIcon,
    ManagementIcon,
    SecurityIcon
} from "./FeatureIcons";
import { Badge } from "@/components/ui/badge";

const features = [
    {
        title: "Fast & Powerful Querying",
        subtitle: "SQL editor built for speed with professional features.",
        icon: <QueryIcon />,
        items: [
            "Syntax highlighting & Autocomplete",
            "Multi-tab query workspace",
            "Query history & saved snippets",
            "Execution time + EXPLAIN plans",
        ],
    },
    {
        title: "Smart Data Viewer",
        subtitle: "Spreadsheet-style interface that handles millions of rows.",
        icon: <TableIcon />,
        items: [
            "Inline editing + Modal view",
            "Robust sorting, filtering, & search",
            "Column visibility & resizing",
            "Efficient pagination & lazy loading",
        ],
    },
    {
        title: "Database Management",
        subtitle: "Take full control of your schema and data.",
        icon: <ManagementIcon />,
        items: [
            "Create, alter, & drop tables",
            "Manage indexes & relationships",
            "Insert, update, & delete rows",
            "CSV, JSON, & SQL Import/Export",
        ],
    },
    {
        title: "Security & Reliability",
        subtitle: "Your credentials never leave your machine.",
        icon: <SecurityIcon />,
        items: [
            "AES-256 encrypted connections",
            "OS Keychain integration",
            "Safe mode for production queries",
            "Pre-save connection testing",
        ],
    },
];

export default function FeaturesSection() {
    return (
        <section
            id="features"
            className="relative isolate overflow-hidden bg-background py-16 md:py-20"
        >
            <div className="section-tech-lines mask-radial-fade pointer-events-none absolute inset-0 -z-10 opacity-35" />
            <div className="section-container relative">
                <div className="mb-10 text-center">
                    <Badge className="mb-4">Capabilities</Badge>
                    <h2 className="section-heading mb-4 leading-[1.15]">
                        Built for Developer Flow
                    </h2>
                    <p className="section-copy max-w-[36.25rem]">
                        We&apos;ve combined native performance with a minimal interface
                        to help you ship faster and manage better.
                    </p>
                </div>

                <div className="mx-auto grid max-w-5xl grid-cols-1 gap-3 md:grid-cols-2">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-colors duration-200 hover:border-foreground/20"
                        >
                            <div className="icon-tile mb-4 text-xl group-hover:bg-elevated group-hover:text-foreground">
                                {feature.icon}
                            </div>

                            <h3 className="mb-2 text-base font-semibold tracking-tight text-foreground">
                                {feature.title}
                            </h3>
                            <p className="mb-5 text-sm leading-6 text-muted-foreground">
                                {feature.subtitle}
                            </p>

                            <ul className="mt-auto flex flex-col gap-2.5">
                                {feature.items.map((item) => (
                                    <li
                                        key={item}
                                        className="flex items-start gap-2.5 text-[13px] leading-5 text-muted-foreground"
                                    >
                                        <RiCheckboxCircleFill
                                            className="mt-0.5 shrink-0 text-brand opacity-80"
                                            size={16}
                                        />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
