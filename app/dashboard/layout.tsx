import { AppShell } from "@/app/_components/AppShell";
import { isAdminEmail } from "@/lib/admin-auth";
import { getServerSession } from "@/lib/auth-server";

const baseNavItems = [
    { href: "/dashboard", label: "Overview", icon: "dashboard" as const },
    { href: "/dashboard/billing", label: "Billing", icon: "billing" as const },
    { href: "/dashboard/profile", label: "Profile", icon: "profile" as const },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession();
    const navItems = isAdminEmail(session?.user.email)
        ? [...baseNavItems, { href: "/admin", label: "Admin", icon: "users" as const }]
        : baseNavItems;

    return (
        <AppShell
            homeHref="/dashboard"
            navItems={navItems}
            title="DBConnect"
            subtitle="Workspace and license management"
        >
            {children}
        </AppShell>
    );
}
