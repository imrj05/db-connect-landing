"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import {
    RiSunLine,
    RiMoonClearLine,
    RiComputerLine
} from "react-icons/ri";
import { cn } from "@/lib/utils";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const mounted = useSyncExternalStore(
        () => () => undefined,
        () => true,
        () => false
    );

    if (!mounted) return <div className="h-8 w-[100px] rounded-md border border-border bg-elevated opacity-50" />;

    const options = [
        { value: "light", Icon: RiSunLine, label: "Light" },
        { value: "system", Icon: RiComputerLine, label: "System" },
        { value: "dark", Icon: RiMoonClearLine, label: "Dark" },
    ];

    const currentIndex = options.findIndex((opt) => opt.value === theme);
    const activeIndex = currentIndex === -1 ? 1 : currentIndex; // Default to system if not found

    return (
        <div className="inline-flex items-center bg-surface border border-border rounded-md p-0.5 relative w-[100px] h-8">
            <div
                className={cn(
                    "pointer-events-none absolute left-0.5 top-0.5 z-0 h-[26px] w-[30px] rounded-sm border border-border bg-elevated transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    activeIndex === 0 && "translate-x-0",
                    activeIndex === 1 && "translate-x-8",
                    activeIndex === 2 && "translate-x-16"
                )}
            />

            {options.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    title={`Set theme to ${opt.label}`}
                    className={cn(
                        "relative z-10 flex h-full w-8 flex-1 items-center justify-center bg-transparent p-0 transition-colors duration-200",
                        theme === opt.value ? "text-foreground" : "text-muted-foreground"
                    )}
                >
                    <opt.Icon size={14} />
                </button>
            ))}
        </div>
    );
}
