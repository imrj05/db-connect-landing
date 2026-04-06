import { 
  SiMysql, 
  SiPostgresql, 
  SiMongodb, 
  SiMariadb, 
  SiRedis, 
  SiSqlite 
} from "react-icons/si";
import { RiCloudFill, RiHardDriveFill, RiShieldCheckFill } from "react-icons/ri";

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
      style={{
        padding: "100px 0",
        position: "relative",
        background: "var(--bg-base)",
      }}
    >
      <div className="section-container">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="badge" style={{ margin: "0 auto 16px" }}>
            Connectivity
          </div>
          <h2
            style={{
              fontSize: "clamp(28px, 3.5vw, 48px)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              marginBottom: 16,
              color: "var(--text-primary)",
              lineHeight: 1.1,
            }}
          >
            Works seamlessly with Local & Cloud
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
            Connect to any major database directly. No middleman, no heavy 
            drivers — just pure speed.
          </p>
        </div>

        {/* Database Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 16,
            maxWidth: 1000,
            margin: "0 auto 48px",
          }}
        >
          {dbList.map((db) => (
            <div
              key={db.id}
              className="glass-card"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                padding: "24px 16px",
                textAlign: "center",
                background: "var(--bg-card)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border)",
              }}
            >
              <div 
                style={{ 
                  fontSize: 28,
                  color: "var(--text-primary)",
                  opacity: 0.7,
                }}
              >
                <db.Icon />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                {db.name}
              </span>
            </div>
          ))}
        </div>

        {/* Capabilities pills */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {[
            { Icon: RiHardDriveFill, text: "Local Databases" },
            { Icon: RiCloudFill, text: "AWS RDS / Supabase" },
            { Icon: RiShieldCheckFill, text: "Secure Tunnels" },
          ].map((pill) => (
            <div
              key={pill.text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12.5,
                padding: "8px 16px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                borderRadius: "99px",
                fontWeight: 500,
              }}
            >
              <pill.Icon size={14} style={{ opacity: 0.6 }} />
              {pill.text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
