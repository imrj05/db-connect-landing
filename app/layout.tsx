import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono, Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import { ThemeProvider } from "./_components/ThemeProvider";
import { Toaster } from "sonner";
const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });
const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-space-grotesk",
    display: "swap",
});
const mono = IBM_Plex_Mono({
    weight: ["400", "500", "600", "700"],
    subsets: ["latin"],
    variable: "--font-mono",
    display: "swap",
});
export const metadata: Metadata = {
    metadataBase: new URL("https://db-connect.rajeshwarkashyap.in"),
    title: "DB Connect — Professional Database GUI for Modern Teams",
    description:
        "The fastest, native database client for macOS and Windows. Optimized for productivity, performance, and modern developer workflows.",
    icons: {
        icon: [
            { url: "/icons/icon.ico" },
            { url: "/icons/icon.png", type: "image/png" },
        ],
        shortcut: "/icons/icon.ico",
        apple: "/icons/icon.png",
    },
};
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
            <body className={cn(spaceGrotesk.variable, mono.variable, "bg-background text-foreground")}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <Toaster richColors position="bottom-right" />
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
