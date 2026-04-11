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
          <Badge className="mb-4">Capabilities</Badge>
          <h2 className="text-[clamp(26px,3vw,36px)] font-extrabold tracking-tight mb-4 text-foreground leading-[1.15]">
            Built for Developer Flow
          </h2>
          <p className="text-secondary text-[16.5px] max-w-[580px] mx-auto leading-relaxed">
            We&apos;ve combined native performance with a minimal interface 
            to help you ship faster and manage better.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {features.map((feature, idx) => (
            <div
              key={feature.title}
              className="group flex flex-col h-full p-8 glass-card bg-card border border-border rounded-xl transition-all duration-300 hover:shadow-lg hover:border-accent/30 hover:-translate-y-1 relative overflow-hidden"
            >
              {/* Subtle accent glow on hover */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Icon Container */}
              <div className="w-12 h-12 rounded-lg bg-elevated text-foreground flex items-center justify-center text-2xl mb-6 border border-border group-hover:bg-accent group-hover:text-white transition-colors duration-300 shadow-sm">
                {feature.icon}
              </div>

              {/* Text content */}
              <h3 className="text-xl font-bold text-foreground tracking-tight mb-3">
                {feature.title}
              </h3>
              <p className="text-[15px] text-secondary leading-relaxed mb-8">
                {feature.subtitle}
              </p>
              
              <ul className="list-none flex flex-col gap-4 mt-auto">
                {feature.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-[14px] text-secondary leading-tight group-hover:text-foreground/80 transition-colors duration-200"
                  >
                    <RiCheckboxCircleFill
                      className="text-accent flex-shrink-0 mt-0.5 opacity-80"
                      size={18}
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
