"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { 
  RiSunLine, 
  RiMoonClearLine, 
  RiComputerLine 
} from "react-icons/ri";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return (
    <div style={{ width: 104, height: 32, background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", opacity: 0.5 }} />
  );

  const options = [
    { value: "light", Icon: RiSunLine, label: "Light" },
    { value: "system", Icon: RiComputerLine, label: "System" },
    { value: "dark", Icon: RiMoonClearLine, label: "Dark" },
  ];

  const currentIndex = options.findIndex((opt) => opt.value === theme);
  const activeIndex = currentIndex === -1 ? 1 : currentIndex; // Default to system if not found

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "2px",
        position: "relative",
        width: "100px",
        height: "32px",
      }}
    >
      {/* Sliding Active Background (Shadcn style) */}
      <div
        style={{
          position: "absolute",
          top: "2px",
          left: "2px",
          width: "30px",
          height: "26px",
          background: "var(--bg-elevated)",
          borderRadius: "var(--radius-sm)",
          transform: `translateX(${activeIndex * 32}px)`,
          transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          pointerEvents: "none",
          zIndex: 0,
          border: "1px solid var(--border)",
        }}
      />

      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          title={`Set theme to ${opt.label}`}
          style={{
            flex: 1,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: "none",
            color: theme === opt.value ? "var(--text-primary)" : "var(--text-muted)",
            cursor: "pointer",
            position: "relative",
            zIndex: 1,
            transition: "color 0.2s ease",
            padding: 0,
            width: "32px",
          }}
        >
          <opt.Icon size={14} />
        </button>
      ))}
    </div>
  );
}
