import {
    SecurityIcon,
    ChartIcon,
    RobotIcon,
    ManagementIcon,
    TeamIcon,
} from "./FeatureIcons";
import { Badge } from "@/components/ui/badge";
import type { FC } from "react";

type IconComponent = FC<{ size?: number; className?: string }>;

type RoadmapTask = {
    label: string;
    desc: string;
    status: "completed" | "in-progress" | "planned";
};

type RoadmapGroup = {
    title: string;
    period: string;
    Icon: IconComponent;
    tasks: RoadmapTask[];
};

const roadmapData: RoadmapGroup[] = [
    {
        title: "Connectivity & Security",
        period: "Q1 2024",
        Icon: SecurityIcon,
        tasks: [
            { label: "SSH Tunneling", desc: "Securely connect to remote instances via bastion hosts.", status: "completed" },
            { label: "Full SSL/TLS Support", desc: "Native support for custom CA and identity files.", status: "completed" },
        ],
    },
    {
        title: "Visual Tools",
        period: "Q2 2024",
        Icon: ChartIcon,
        tasks: [
            { label: "ER Diagram Generator", desc: "Visualize your database schema automatically.", status: "in-progress" },
            { label: "Schema Visualization", desc: "Interactive explorer for complex relationships.", status: "planned" },
        ],
    },
    {
        title: "AI & Intelligence",
        period: "Q2 2024",
        Icon: RobotIcon,
        tasks: [
            { label: "Natural Language to SQL", desc: "Describe what you need in plain English.", status: "planned" },
            { label: "AI Query Generation", desc: "Auto-generate boilerplate SQL for common tasks.", status: "planned" },
        ],
    },
    {
        title: "Developer Features",
        period: "Q3 2024",
        Icon: ManagementIcon,
        tasks: [
            { label: "Schema Versioning", desc: "Track changes to your database structure over time.", status: "planned" },
            { label: "Migration Tools", desc: "Generate and run migrations from the UI.", status: "planned" },
        ],
    },
    {
        title: "Collaboration",
        period: "Q4 2024",
        Icon: TeamIcon,
        tasks: [
            { label: "Team Workspaces", desc: "Sync connections across your engineering team.", status: "planned" },
            { label: "Shared Connections", desc: "Securely share database access with teammates.", status: "planned" },
        ],
    },
];

export default function RoadmapSection() {
    return (
        <section
            id="roadmap"
            className="relative isolate overflow-hidden bg-background py-16 md:py-20"
        >
            <div className="section-timeline-grid mask-radial-fade pointer-events-none absolute inset-0 -z-10 opacity-30" />
            <div className="section-container relative">
                <div className="mb-10 text-center">
                    <Badge className="mb-4">The Roadmap</Badge>
                    <h2 className="section-heading mb-4 leading-[1.15]">
                        Developing the Future of Data
                    </h2>
                    <p className="section-copy max-w-[36.25rem]">
                        Our mission is to build the fastest, most capable database client
                        for modern development workflows.
                    </p>
                </div>

                <div className="mx-auto grid max-w-5xl grid-cols-1 gap-3 md:grid-cols-2">
                    {roadmapData.map((group) => (
                        <div
                            key={group.title}
                            className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5"
                        >
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex size-7 items-center justify-center rounded-md border border-border bg-elevated text-foreground">
                                        <group.Icon size={18} className="text-foreground" />
                                    </div>
                                    <h3 className="text-sm font-semibold tracking-tight text-foreground">
                                        {group.title}
                                    </h3>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    {group.period}
                                </span>
                            </div>

                            <div className="flex flex-col gap-3">
                                {group.tasks.map((task) => (
                                    <div
                                        key={task.label}
                                        className={`flex items-start gap-3 ${task.status === "completed" ? "opacity-60" : "opacity-100"}`}
                                    >
                                        <div
                                            className={`mt-1 w-3.5 h-3.5 rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0
                        ${task.status !== "planned" ? "border-foreground" : "border-border"}
                        ${task.status === "completed" ? "bg-foreground" : "bg-transparent"}
                      `}
                                        >
                                            {task.status === "completed" && (
                                                <svg width="8" height="8" viewBox="0 0 10 10" fill="none" className="block">
                                                    <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-card" />
                                                </svg>
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-[13px] font-medium leading-tight text-foreground">
                                                {task.label}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
