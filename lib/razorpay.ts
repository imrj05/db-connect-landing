import Razorpay from "razorpay";

type RazorpayMode = "live" | "test";

type RazorpayConfig = {
    keyId: string;
    keySecret: string;
    mode: RazorpayMode;
    webhookSecret: string;
};

function readMode(): RazorpayMode {
    return process.env.RAZORPAY_MODE?.trim().toLowerCase() === "live" ? "live" : "test";
}

function readLegacyConfig(): RazorpayConfig {
    return {
        keyId: (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "").trim(),
        keySecret: (process.env.RAZORPAY_KEY_SECRET ?? "").trim(),
        mode: readMode(),
        webhookSecret: (process.env.RAZORPAY_WEBHOOK_SECRET ?? "").trim(),
    };
}

export function getRazorpayConfig(): RazorpayConfig {
    const mode = readMode();

    if (mode === "live") {
        const liveKeyId = (process.env.NEXT_PUBLIC_RAZORPAY_LIVE_KEY_ID ?? "").trim();
        const liveKeySecret = (process.env.RAZORPAY_LIVE_KEY_SECRET ?? "").trim();
        const liveWebhookSecret = (process.env.RAZORPAY_LIVE_WEBHOOK_SECRET ?? "").trim();

        if (liveKeyId && liveKeySecret) {
            return {
                keyId: liveKeyId,
                keySecret: liveKeySecret,
                mode,
                webhookSecret: liveWebhookSecret,
            };
        }
    }

    const testKeyId = (process.env.NEXT_PUBLIC_RAZORPAY_TEST_KEY_ID ?? "").trim();
    const testKeySecret = (process.env.RAZORPAY_TEST_KEY_SECRET ?? "").trim();
    const testWebhookSecret = (process.env.RAZORPAY_TEST_WEBHOOK_SECRET ?? "").trim();

    if (testKeyId && testKeySecret) {
        return {
            keyId: testKeyId,
            keySecret: testKeySecret,
            mode: "test",
            webhookSecret: testWebhookSecret,
        };
    }

    return readLegacyConfig();
}

export function createRazorpayClient() {
    const config = getRazorpayConfig();

    return new Razorpay({
        key_id: config.keyId,
        key_secret: config.keySecret,
    });
}
