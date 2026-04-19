import { AppShell } from "@/app/_components/AppShell";
import { requireAdminPageSession } from "@/lib/admin-auth";

const navItems = [
    { href: "/admin", label: "Overview", icon: "dashboard" as const },
    { href: "/admin/users", label: "Users", icon: "users" as const },
    { href: "/admin/licenses", label: "Licenses", icon: "licenses" as const },
    { href: "/admin/activations", label: "Activations", icon: "activations" as const },
    { href: "/admin/plans", label: "Plans", icon: "plans" as const },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    await requireAdminPageSession();

    return (
        <AppShell
            homeHref="/admin"
            navItems={navItems}
            title="DBConnect Admin"
            subtitle="Subscriptions, licenses, users, and plans"
        >
            {children}
        </AppShell>
    );
}
