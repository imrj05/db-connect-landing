import { RiHeartFill, RiTwitterFill, RiGithubFill, RiDiscordFill } from "react-icons/ri";
import ThemeToggle from "./ThemeToggle";
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface py-12 pb-8">
      <div className="section-container">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-8 mb-12">
          {/* Brand col */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-6 h-6 flex items-center justify-center">
                <img src="/icons/logo.svg" alt="DBConnect Logo" width="20" height="20" />
              </div>
              <span className="font-bold text-base text-foreground tracking-tight">
                DBConnect
              </span>
              <span className="badge-alpha">Alpha</span>
            </div>
            <p className="text-sm text-secondary leading-relaxed max-w-[240px] mb-6">
              The fast, modern database GUI for desktop. Built for developers by developers.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: RiTwitterFill, href: "#" },
                { Icon: RiGithubFill, href: "https://github.com/imrj05/db-connect" },
                { Icon: RiDiscordFill, href: "#" },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="social-btn w-9 h-9 flex items-center justify-center rounded-md border border-border text-secondary hover:text-foreground hover:bg-elevated transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
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
              links: [
                { label: "Features", href: "/#features" },
                { label: "Databases", href: "/#databases" },
                { label: "Pricing", href: "/#pricing" },
                { label: "Download", href: "https://github.com/imrj05/db-connect/releases/latest" }
              ],
            },
            {
              title: "Legal",
              links: [
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
                { label: "License", href: "https://github.com/imrj05/db-connect/blob/main/LICENSE" }
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-[13px] font-semibold text-foreground uppercase tracking-wider mb-4">
                {col.title}
              </h4>
              <ul className="list-none p-0 m-0 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("http") ? (
                      <a 
                        href={link.href} 
                        className="footer-link text-[13.5px] text-secondary hover:text-foreground transition-colors" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link 
                        href={link.href} 
                        className="footer-link text-[13.5px] text-secondary hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted flex items-center gap-1.5">
            &copy; {year} DBConnect. Made with{" "}
            <RiHeartFill size={12} className="text-pink-400" />{" "}
            for developers.
          </p>
          <div className="flex items-center gap-8">
            <div className="flex gap-5">
              <a 
                href="https://github.com/imrj05/db-connect/blob/main/LICENSE" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[12px] text-muted hover:text-foreground transition-colors"
              >
                MIT License
              </a>
              <Link href="/privacy" className="text-[12px] text-muted hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-[12px] text-muted hover:text-foreground transition-colors">
                Terms
              </Link>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
