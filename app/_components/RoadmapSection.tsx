import {
  SecurityIcon,
  ChartIcon,
  RobotIcon,
  ManagementIcon,
  TeamIcon,
} from "./FeatureIcons";
import { Badge } from "@/components/ui/badge";
import type { FC } from "react";

type RoadmapTask = {
  label: string;
  desc: string;
  status: "completed" | "in-progress" | "planned";
};

type RoadmapGroup = {
  title: string;
  period: string;
  Icon: FC<any>;
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
          <Badge className="mb-4">The Roadmap</Badge>
          <h2 className="text-[clamp(26px,3vw,36px)] font-extrabold tracking-tight mb-4 text-foreground leading-[1.15]">
            Developing the Future of Data
          </h2>
          <p className="text-secondary text-[16.5px] max-w-[580px] mx-auto leading-relaxed">
            Our mission is to build the fastest, most capable database client 
            for modern development workflows.
          </p>
        </div>

        {/* Roadmap Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {roadmapData.map((group) => (
            <div
              key={group.title}
              className="group flex flex-col h-full p-6 glass-card bg-card border border-border rounded-lg"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-elevated text-foreground flex items-center justify-center border border-border">
                    <group.Icon size={18} className="text-foreground" />
                  </div>
                  <h3 className="text-base font-bold text-foreground tracking-tight">
                    {group.title}
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
                  {group.period}
                </span>
              </div>

              <div className="flex flex-col gap-4">
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
                      <div className="text-[13.5px] font-semibold text-foreground leading-tight">
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
