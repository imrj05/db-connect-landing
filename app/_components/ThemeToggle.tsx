"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { 
  RiSunLine, 
  RiMoonClearLine, 
  RiComputerLine 
} from "react-icons/ri";
import { cn } from "@/lib/utils";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return (
    <div className="w-[100px] h-8 bg-elevated rounded-md opacity-50 border border-border" />
  );

  const options = [
    { value: "light", Icon: RiSunLine, label: "Light" },
    { value: "system", Icon: RiComputerLine, label: "System" },
    { value: "dark", Icon: RiMoonClearLine, label: "Dark" },
  ];

  const currentIndex = options.findIndex((opt) => opt.value === theme);
  const activeIndex = currentIndex === -1 ? 1 : currentIndex; // Default to system if not found

  return (
    <div className="inline-flex items-center bg-surface border border-border rounded-md p-0.5 relative w-[100px] h-8">
      {/* Sliding Active Background (Shadcn style) */}
      <div
        className={cn(
          "absolute top-0.5 left-0.5 w-[30px] h-[26px] bg-elevated rounded-sm border border-border pointer-events-none z-0 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
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
            "flex-1 h-full flex items-center justify-center bg-transparent border-none cursor-pointer relative z-1 transition-colors duration-200 p-0 w-8",
            theme === opt.value ? "text-foreground" : "text-muted"
          )}
        >
          <opt.Icon size={14} />
        </button>
      ))}
    </div>
  );
}
