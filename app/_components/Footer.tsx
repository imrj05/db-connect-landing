import { RiHeartFill, RiTwitterFill, RiGithubFill, RiDiscordFill } from "react-icons/ri";
import ThemeToggle from "./ThemeToggle";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function Footer() {
    const year = new Date().getFullYear();
    const footerColumns = [
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
            title: "Resources",
            links: [
                { label: "GitHub", href: "https://github.com/imrj05/db-connect" },
                { label: "Release Notes", href: "https://github.com/imrj05/db-connect/releases/latest" },
                { label: "Roadmap", href: "/#roadmap" },
                { label: "Support", href: "/login" }
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
    ];

    return (
        <footer className="bg-background py-10 sm:py-12">
            <div className="section-container">
                <div className="relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-background/60 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.06)] backdrop-blur-xl supports-backdrop-filter:bg-background/55 sm:p-8">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-foreground/12 to-transparent" />
                    <div className="pointer-events-none absolute inset-0 section-soft-rings opacity-50" />

                    <div className="relative z-10 mb-8 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.8fr)] lg:items-start">
                        <div className="max-w-sm">
                            <div className="mb-4 flex items-center gap-2.5">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-background/80 shadow-sm">
                                    <img src="/icons/logo.svg" alt="DBConnect Logo" width="22" height="22" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-base font-semibold tracking-tight text-foreground">
                                            DBConnect
                                        </span>
                                        <Badge variant="alpha" className="ml-0">
                                            Alpha
                                        </Badge>
                                    </div>
                                    <p className="mt-1 text-[13px] text-muted-foreground">
                                        Native database tooling for focused developer workflows.
                                    </p>
                                </div>
                            </div>

                            <p className="mb-6 max-w-72 text-[13px] leading-6 text-muted-foreground">
                                A fast, local-first database GUI for teams who want native performance,
                                keyboard-first workflows, and a cleaner interface for everyday data work.
                            </p>

                            <div className="flex flex-wrap gap-2.5">
                                <Link
                                    href="/signup"
                                    className="inline-flex items-center rounded-full border border-border/70 bg-background/75 px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-background"
                                >
                                    Get Started
                                </Link>
                                <a
                                    href="https://github.com/imrj05/db-connect/releases/latest"
                                    className="inline-flex items-center rounded-full px-3.5 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Download Latest
                                </a>
                            </div>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {footerColumns.map((col) => (
                                <div key={col.title} className="rounded-2xl border border-border/65 bg-background/50 p-4">
                                    <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/70">
                                        {col.title}
                                    </h4>
                                    <ul className="space-y-2.5">
                                        {col.links.map((link) => (
                                            <li key={link.label}>
                                                {link.href.startsWith("http") ? (
                                                    <a
                                                        href={link.href}
                                                        className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        {link.label}
                                                    </a>
                                                ) : (
                                                    <Link
                                                        href={link.href}
                                                        className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
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
                    </div>

                    <div className="relative z-10 flex flex-col gap-4 rounded-2xl border border-border/65 bg-background/55 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                                &copy; {year} DBConnect. Made with
                                <RiHeartFill size={12} className="text-pink-400" />
                                for developers.
                            </p>
                            <p className="mt-1 text-[12px] text-muted-foreground">
                                macOS and Windows support. MIT licensed.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
                            <div className="flex gap-2">
                                {[
                                    { Icon: RiTwitterFill, href: "#" },
                                    { Icon: RiGithubFill, href: "https://github.com/imrj05/db-connect" },
                                    { Icon: RiDiscordFill, href: "#" },
                                ].map((social, i) => (
                                    <a
                                        key={i}
                                        href={social.href}
                                        className="social-btn size-9 rounded-full border-border/70 bg-background/75"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <social.Icon size={18} />
                                    </a>
                                ))}
                            </div>

                            <div className="flex items-center gap-4">
                                <a
                                    href="https://github.com/imrj05/db-connect/blob/main/LICENSE"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[12px] text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    MIT License
                                </a>
                                <Link href="/privacy" className="text-[12px] text-muted-foreground transition-colors hover:text-foreground">
                                    Privacy
                                </Link>
                                <Link href="/terms" className="text-[12px] text-muted-foreground transition-colors hover:text-foreground">
                                    Terms
                                </Link>
                                <ThemeToggle />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
