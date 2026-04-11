import { 
  SiMysql, 
  SiPostgresql, 
  SiMongodb, 
  SiMariadb, 
  SiRedis, 
  SiSqlite 
} from "react-icons/si";
import { RiCloudFill, RiHardDriveFill, RiShieldCheckFill } from "react-icons/ri";
import { Badge } from "@/components/ui/badge";

const dbList = [
  { id: "mysql", Icon: SiMysql, name: "MySQL" },
  { id: "postgres", Icon: SiPostgresql, name: "PostgreSQL" },
  { id: "mongodb", Icon: SiMongodb, name: "MongoDB" },
  { id: "mariadb", Icon: SiMariadb, name: "MariaDB" },
  { id: "redis", Icon: SiRedis, name: "Redis" },
  { id: "sqlite", Icon: SiSqlite, name: "SQLite" },
];

export default function DatabasesSection() {
  return (
    <section
      id="databases"
      className="relative py-24 md:py-32 bg-surface border-y border-border isolate"
    >
      {/* Background Pattern */}
      <div
        className="dot-grid absolute inset-0 opacity-40 pointer-events-none -z-1"
        style={{
          maskImage: "radial-gradient(circle at center, black, transparent 80%)",
          WebkitMaskImage: "radial-gradient(circle at center, black, transparent 80%)",
        }}
      />
      <div className="section-container relative">
        {/* Header */}
        <div className="text-center mb-14">
          <Badge className="mb-4">Connectivity</Badge>
          <h2 className="text-[clamp(26px,3vw,36px)] font-extrabold tracking-tight mb-4 text-foreground leading-[1.15]">
            Works seamlessly with Local & Cloud
          </h2>
          <p className="text-secondary text-[16.5px] max-w-[580px] mx-auto leading-relaxed">
            Connect to any major database directly. No middleman, no heavy 
            drivers — just pure speed.
          </p>
        </div>

        {/* Database Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-6xl mx-auto mb-12">
          {dbList.map((db) => (
            <div
              key={db.id}
              className="glass-card flex flex-col items-center gap-3 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:bg-card/80 group"
            >
              <div className="text-[28px] text-foreground opacity-70 group-hover:opacity-100 group-hover:text-accent transition-all duration-300">
                <db.Icon />
              </div>
              <span className="text-[13px] font-semibold text-foreground tracking-tight">
                {db.name}
              </span>
            </div>
          ))}
        </div>

        {/* Capabilities pills */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {[
            { Icon: RiHardDriveFill, text: "Local Databases" },
            { Icon: RiCloudFill, text: "AWS RDS / Supabase" },
            { Icon: RiShieldCheckFill, text: "Secure Tunnels" },
          ].map((pill) => (
            <div
              key={pill.text}
              className="flex items-center gap-2 text-[12.5px] px-4 py-2 bg-elevated border border-border text-foreground rounded-full font-medium"
            >
              <pill.Icon size={14} className="opacity-60" />
              {pill.text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
