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
            className="relative isolate overflow-hidden bg-background py-16 md:py-20"
        >
            <div className="section-node-grid mask-radial-fade pointer-events-none absolute inset-0 -z-10 opacity-35" />
            <div className="section-container relative">
                <div className="mb-10 text-center">
                    <Badge className="mb-4">Connectivity</Badge>
                    <h2 className="section-heading mb-4 leading-[1.15]">
                        Works seamlessly with Local & Cloud
                    </h2>
                    <p className="section-copy max-w-[36.25rem]">
                        Connect to any major database directly. No middleman, no heavy
                        drivers — just pure speed.
                    </p>
                </div>

                <div className="mx-auto mb-8 grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {dbList.map((db) => (
                        <div
                            key={db.id}
                            className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card px-4 py-4 text-center transition-colors hover:border-foreground/20"
                        >
                            <div className="text-2xl text-foreground/75 transition-colors duration-200 group-hover:text-foreground">
                                <db.Icon />
                            </div>
                            <span className="text-[13px] font-medium tracking-tight text-foreground">
                                {db.name}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2">
                    {[
                        { Icon: RiHardDriveFill, text: "Local Databases" },
                        { Icon: RiCloudFill, text: "AWS RDS / Supabase" },
                        { Icon: RiShieldCheckFill, text: "Secure Tunnels" },
                    ].map((pill) => (
                        <div
                            key={pill.text}
                            className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-medium text-muted-foreground"
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
