"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";

const MOCKUPS = [
  { light: "/Screenshot-light-1.png", dark: "/Screenshot-dark-1.png", label: "Dashboard" },
  { light: "/Screenshot-light-2.png", dark: "/Screenshot-dark-2.png", label: "Query Editor" },
  { light: "/Screenshot-light-3.png", dark: "/Screenshot-dark-3.png", label: "Table View" },
];

export default function HeroMockup() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Auto-advance
    const interval = setInterval(() => {
      if (!isHovered) {
        setActiveIndex((current) => (current + 1) % MOCKUPS.length);
      }
    }, 4500);
    return () => clearInterval(interval);
  }, [isHovered]);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  const handleNext = () => {
    setActiveIndex((current) => (current + 1) % MOCKUPS.length);
  };

  const handlePrev = () => {
    setActiveIndex((current) => (current - 1 + MOCKUPS.length) % MOCKUPS.length);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", alignItems: "center" }}>
      {/* Main Image Container */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: "100%",
          maxWidth: 1000,
          margin: "0 auto",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-lg)",
          position: "relative",
          background: "var(--bg-card)",
          aspectRatio: "16/10", // Maintains layout integrity, prevents shifting
        }}
      >
        {MOCKUPS.map((mockup, idx) => {
          const isActive = idx === activeIndex;
          const imageSrc = isDark ? mockup.dark : mockup.light;
          return (
            <img
              key={idx}
              src={imageSrc}
              alt={`DBConnect App Mockup - ${mockup.label}`}
              style={{
                position: isActive ? "relative" : "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "block",
                objectFit: "cover",
                transition: "opacity 0.6s ease-in-out, transform 0.6s ease-in-out",
                opacity: mounted && isActive ? 1 : 0,
                transform: isActive ? "scale(1)" : "scale(1.02)",
                zIndex: isActive ? 1 : 0,
              }}
            />
          );
        })}

        {/* Previous Button */}
        <button
          onClick={handlePrev}
          style={{
            position: "absolute",
            left: 16,
            top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(0,0,0,0.5)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "50%",
            width: 44,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 10,
            opacity: isHovered ? 1 : 0,
            visibility: isHovered ? "visible" : "hidden",
            transition: "all 0.3s ease",
            backdropFilter: "blur(8px)",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.8)")}
          onMouseOut={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.5)")}
          aria-label="Previous screenshot"
        >
          <RiArrowLeftSLine size={28} />
        </button>

        {/* Next Button */}
        <button
          onClick={handleNext}
          style={{
            position: "absolute",
            right: 16,
            top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(0,0,0,0.5)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "50%",
            width: 44,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 10,
            opacity: isHovered ? 1 : 0,
            visibility: isHovered ? "visible" : "hidden",
            transition: "all 0.3s ease",
            backdropFilter: "blur(8px)",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.8)")}
          onMouseOut={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.5)")}
          aria-label="Next screenshot"
        >
          <RiArrowRightSLine size={28} />
        </button>

        {/* Progress Dots Bottom */}
        <div 
          style={{
            position: "absolute",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 8,
            zIndex: 10,
            background: "rgba(0,0,0,0.3)",
            padding: "8px 12px",
            borderRadius: "20px",
            backdropFilter: "blur(8px)",
          }}
        >
          {MOCKUPS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              style={{
                width: idx === activeIndex ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: idx === activeIndex ? "#fff" : "rgba(255,255,255,0.4)",
                border: "none",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "pointer",
                padding: 0,
              }}
              aria-label={`Go to screenshot ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Modern Segmented Navigation below */}
      <div 
        style={{ 
          display: "inline-flex", 
          justifyContent: "center", 
          gap: 6,
          background: "var(--bg-surface)",
          padding: 6,
          borderRadius: 24,
          border: "1px solid var(--border)",
        }}
      >
        {MOCKUPS.map((mockup, idx) => {
          const isActive = idx === activeIndex;
          return (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              style={{
                padding: "8px 20px",
                borderRadius: "18px",
                border: "none",
                background: isActive ? "var(--bg-card)" : "transparent",
                color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)" : "none",
              }}
            >
              {mockup.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

