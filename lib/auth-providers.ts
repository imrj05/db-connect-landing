export type OAuthProvider = "google" | "github";

type OAuthProviderOption = {
    id: OAuthProvider;
    label: string;
};

export const oauthProviders: OAuthProviderOption[] = [
    ...(process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true"
        ? [{ id: "google", label: "Google" } satisfies OAuthProviderOption]
        : []),
    ...(process.env.NEXT_PUBLIC_GITHUB_AUTH_ENABLED === "true"
        ? [{ id: "github", label: "GitHub" } satisfies OAuthProviderOption]
        : []),
];
