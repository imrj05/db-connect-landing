import {
  RiShieldKeyholeLine,
  RiBarChartBoxLine,
  RiRobotLine,
  RiSettings4Line,
  RiTeamLine,
} from "react-icons/ri";
import type { IconType } from "react-icons";

type RoadmapTask = {
  label: string;
  desc: string;
  status: "completed" | "in-progress" | "planned";
};

type RoadmapGroup = {
  title: string;
  period: string;
  Icon: IconType;
  tasks: RoadmapTask[];
};

const roadmapData: RoadmapGroup[] = [
  {
    title: "Connectivity & Security",
    period: "Q1 2024",
    Icon: RiShieldKeyholeLine,
    tasks: [
      { label: "SSH Tunneling", desc: "Securely connect to remote instances via bastion hosts.", status: "completed" },
      { label: "Full SSL/TLS Support", desc: "Native support for custom CA and identity files.", status: "completed" },
    ],
  },
  {
    title: "Visual Tools",
    period: "Q2 2024",
    Icon: RiBarChartBoxLine,
    tasks: [
      { label: "ER Diagram Generator", desc: "Visualize your database schema automatically.", status: "in-progress" },
      { label: "Schema Visualization", desc: "Interactive explorer for complex relationships.", status: "planned" },
    ],
  },
  {
    title: "AI & Intelligence",
    period: "Q2 2024",
    Icon: RiRobotLine,
    tasks: [
      { label: "Natural Language to SQL", desc: "Describe what you need in plain English.", status: "planned" },
      { label: "AI Query Generation", desc: "Auto-generate boilerplate SQL for common tasks.", status: "planned" },
    ],
  },
  {
    title: "Developer Features",
    period: "Q3 2024",
    Icon: RiSettings4Line,
    tasks: [
      { label: "Schema Versioning", desc: "Track changes to your database structure over time.", status: "planned" },
      { label: "Migration Tools", desc: "Generate and run migrations from the UI.", status: "planned" },
    ],
  },
  {
    title: "Collaboration",
    period: "Q4 2024",
    Icon: RiTeamLine,
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
      style={{
        padding: "100px 0",
        position: "relative",
        background: "var(--bg-base)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div className="section-container">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div className="badge" style={{ margin: "0 auto 16px" }}>
            The Roadmap
          </div>
          <h2
            style={{
              fontSize: "clamp(28px, 3.5vw, 48px)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "var(--text-primary)",
              marginBottom: 16,
              lineHeight: 1.1,
            }}
          >
            Developing the Future of Data
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: 17,
              maxWidth: 580,
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Our mission is to build the fastest, most capable database client 
            for modern development workflows.
          </p>
        </div>

        {/* Roadmap Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {roadmapData.map((group) => (
            <div
              key={group.title}
              className="glass-card"
              style={{ 
                padding: "24px", 
                height: "100%",
                background: "var(--bg-card)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 24,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-elevated)",
                    color: "var(--text-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid var(--border)",
                  }}>
                    <group.Icon size={16} />
                  </div>
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {group.title}
                  </h3>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  {group.period}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {group.tasks.map((task) => (
                  <div
                    key={task.label}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      opacity: task.status === "completed" ? 0.6 : 1,
                    }}
                  >
                    <div
                      style={{
                        marginTop: 4,
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        border: "1.5px solid",
                        borderColor: task.status !== "planned" ? "var(--text-primary)" : "var(--border)",
                        background: task.status === "completed" ? "var(--text-primary)" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {task.status === "completed" && (
                        <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2 2 4-4" stroke="var(--bg-card)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>
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
