import { RiCheckboxCircleFill } from "react-icons/ri";
import { 
  QueryIcon, 
  TableIcon, 
  ManagementIcon, 
  SecurityIcon 
} from "./FeatureIcons";

const features = [
  {
    title: "Fast & Powerful Querying",
    subtitle: "SQL editor built for speed with professional features.",
    icon: <QueryIcon />,
    color: "var(--text-primary)",
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
    color: "var(--text-primary)",
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
    color: "var(--text-primary)",
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
    color: "var(--text-primary)",
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
            Capabilities
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
            Built for Developer Flow
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
            We&apos;ve combined native performance with a minimal interface 
            to help you ship faster and manage better.
          </p>
        </div>

        {/* Feature Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 20,
          }}
        >
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group"
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                background: "var(--bg-card)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border)",
              }}
            >
              {/* Icon Container */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "var(--radius-md)",
                  background: "var(--bg-elevated)",
                  color: "var(--text-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  marginBottom: 20,
                  border: "1px solid var(--border)",
                }}
              >
                {feature.icon}
              </div>

              {/* Text content */}
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.02em",
                  marginBottom: 10,
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                  marginBottom: 20,
                }}
              >
                {feature.subtitle}
              </p>
              
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12, marginTop: "auto" }}>
                {feature.items.map((item) => (
                  <li
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      fontSize: 13.5,
                      color: "var(--text-secondary)",
                      lineHeight: 1.4,
                    }}
                  >
                    <RiCheckboxCircleFill
                      style={{ color: "var(--text-primary)", flexShrink: 0, marginTop: 2, opacity: 0.8 }}
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
