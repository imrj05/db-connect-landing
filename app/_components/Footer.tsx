import { RiHeartFill, RiTwitterFill, RiGithubFill, RiDiscordFill, RiDatabase2Fill } from "react-icons/ri";
import ThemeToggle from "./ThemeToggle";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        background: "var(--bg-surface)",
        padding: "48px 0 32px",
      }}
    >
      <div className="section-container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 32,
            marginBottom: 48,
          }}
        >
          {/* Brand col */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "var(--radius-sm)",
                  background: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--bg-base)",
                }}
              >
                <RiDatabase2Fill size={14} />
              </div>
              <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                DBConnect
              </span>
            </div>
            <p
              style={{
                fontSize: 14,
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                maxWidth: 240,
                marginBottom: 24,
              }}
            >
              The fast, modern database GUI for desktop. Built for developers by developers.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              {[
                { Icon: RiTwitterFill, href: "#" },
                { Icon: RiGithubFill, href: "#" },
                { Icon: RiDiscordFill, href: "#" },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="social-btn"
                >
                  <social.Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links cols */}
          {[
            {
              title: "Product",
              links: ["Features", "Databases", "Roadmap", "Changelog"],
            },
            {
              title: "Resources",
              links: ["Documentation", "API Reference", "Support", "Community"],
            },
            {
              title: "Company",
              links: ["About", "Blog", "Careers", "Legal"],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: 16,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {col.title}
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {col.links.map((link) => (
                  <li key={link} style={{ marginBottom: 10 }}>
                    <a href="#" className="footer-link">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            paddingTop: 32,
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <p style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
            &copy; {year} DBConnect. Made with{" "}
            <RiHeartFill size={12} color="#f472b6" />{" "}
            for developers.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <div style={{ display: "flex", gap: 20 }}>
              {["MIT License", "Privacy", "Terms"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="footer-link-sm"
                >
                  {item}
                </a>
              ))}
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
