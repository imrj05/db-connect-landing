"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState, useSyncExternalStore } from "react";
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";
import { cn } from "@/lib/utils";

const MOCKUPS = [
    { light: "/Screenshot-light-1.png", dark: "/Screenshot-dark-1.png", label: "Dashboard" },
    { light: "/Screenshot-light-2.png", dark: "/Screenshot-dark-2.png", label: "Query Editor" },
    { light: "/Screenshot-light-3.png", dark: "/Screenshot-dark-3.png", label: "Table View" },
];

export default function HeroMockup() {
    const { resolvedTheme } = useTheme();
    const [activeIndex, setActiveIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const mounted = useSyncExternalStore(
        () => () => undefined,
        () => true,
        () => false
    );

    useEffect(() => {
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
        <div className="flex flex-col items-center gap-4">
            <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="relative mx-auto aspect-16/10 w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-card"
            >
                {MOCKUPS.map((mockup, idx) => {
                    const isActive = idx === activeIndex;
                    const imageSrc = isDark ? mockup.dark : mockup.light;
                    return (
                        <Image
                            key={idx}
                            src={imageSrc}
                            alt={`DBConnect App Mockup - ${mockup.label}`}
                            fill
                            sizes="(max-width: 1024px) 100vw, 1280px"
                            priority={idx === 0}
                            className={cn(
                                "left-0 top-0 block h-full w-full object-cover transition-[opacity,transform] duration-700 ease-in-out",
                                isActive ? "relative z-10" : "absolute z-0"
                            )}
                            style={{
                                opacity: mounted && isActive ? 1 : 0,
                                transform: isActive ? "scale(1)" : "scale(1.02)",
                            }}
                        />
                    );
                })}

                <button
                    onClick={handlePrev}
                    className={cn(
                        "absolute left-3 top-1/2 z-20 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white backdrop-blur transition-all duration-300 hover:bg-black/70",
                        isHovered ? "visible opacity-100" : "invisible opacity-0"
                    )}
                    aria-label="Previous screenshot"
                >
                    <RiArrowLeftSLine size={28} />
                </button>

                <button
                    onClick={handleNext}
                    className={cn(
                        "absolute right-3 top-1/2 z-20 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white backdrop-blur transition-all duration-300 hover:bg-black/70",
                        isHovered ? "visible opacity-100" : "invisible opacity-0"
                    )}
                    aria-label="Next screenshot"
                >
                    <RiArrowRightSLine size={28} />
                </button>

                <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/25 px-2.5 py-1.5 backdrop-blur">
                    {MOCKUPS.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveIndex(idx)}
                            className={cn(
                                "h-2 rounded-full border-none p-0 transition-all duration-300 ease-out",
                                idx === activeIndex ? "w-6 bg-white" : "w-2 bg-white/40"
                            )}
                            style={{
                                cursor: "pointer",
                            }}
                            aria-label={`Go to screenshot ${idx + 1}`}
                        />
                    ))}
                </div>
            </div>

            <div className="inline-flex items-center justify-center gap-1 rounded-full border border-border bg-surface p-1">
                {MOCKUPS.map((mockup, idx) => {
                    const isActive = idx === activeIndex;
                    return (
                        <button
                            key={idx}
                            onClick={() => setActiveIndex(idx)}
                            className={cn(
                                "rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200",
                                isActive
                                    ? "bg-card text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {mockup.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
