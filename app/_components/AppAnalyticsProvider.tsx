"use client";

import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { AptabaseProvider, useAptabase } from "@aptabase/react";

type AnalyticsValue = {
    enabled: boolean;
    trackEvent: (eventName: string, props?: Record<string, string | number | boolean>) => void;
};

const noop = () => { };

const AnalyticsContext = createContext<AnalyticsValue>({
    enabled: false,
    trackEvent: noop,
});

function AnalyticsRuntime({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const { trackEvent } = useAptabase();

    useEffect(() => {
        void trackEvent("page_view", {
            path: pathname,
        });
    }, [pathname, trackEvent]);

    const value = useMemo<AnalyticsValue>(
        () => ({
            enabled: true,
            trackEvent: (eventName, props) => {
                void trackEvent(eventName, props);
            },
        }),
        [trackEvent],
    );

    return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}

export function AppAnalyticsProvider({ children }: { children: ReactNode }) {
    const appKey = process.env.NEXT_PUBLIC_APTABASE_APP_KEY;
    const host = process.env.NEXT_PUBLIC_APTABASE_HOST;
    const isEnabled = process.env.NODE_ENV === "production" && Boolean(appKey) && Boolean(host);

    const value = useMemo<AnalyticsValue>(
        () => ({
            enabled: false,
            trackEvent: noop,
        }),
        [],
    );

    if (!isEnabled || !appKey || !host) {
        return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
    }

    return (
        <AptabaseProvider
            appKey={appKey}
            options={{
                host,
            }}
        >
            <AnalyticsRuntime>{children}</AnalyticsRuntime>
        </AptabaseProvider>
    );
}

export function useAppAnalytics() {
    return useContext(AnalyticsContext);
}
