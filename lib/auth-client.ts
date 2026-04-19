"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    basePath: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    sessionOptions: {
        refetchOnWindowFocus: true,
    },
});
