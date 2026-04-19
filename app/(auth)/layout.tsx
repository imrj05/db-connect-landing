"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { RiArrowLeftLine } from "react-icons/ri";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 py-24">
            <div className="dot-grid mask-radial-fade pointer-events-none absolute inset-0 opacity-30" />

            <div className="absolute left-6 top-8 z-10 sm:left-8">
                <Link href="/" className="nav-link gap-2 text-sm">
                    <RiArrowLeftLine />
                    Back to Home
                </Link>
            </div>

            <div className="relative z-10 w-full max-w-sm">
                <div className="mb-8 flex flex-col items-center gap-3 text-center">
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-elevated ring-1 ring-border/80">
                        <Image src="/icons/logo.svg" alt="DBConnect Logo" width={32} height={32} />
                    </div>
                    <h1 className="flex items-center gap-1 text-xl font-extrabold tracking-tight text-foreground">
                        DBConnect
                        <span className="badge-alpha ml-1">Alpha</span>
                    </h1>
                </div>

                {children}
            </div>
        </div>
    );
}
