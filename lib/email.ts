import nodemailer from "nodemailer";

type AuthEmailPayload = {
    html: string;
    subject: string;
    text: string;
    to: string;
};

function getBaseUrl() {
    return process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
}

function getTransport() {
    const host = process.env.SMTP_HOST;
    const port = Number.parseInt(process.env.SMTP_PORT ?? "587", 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
        return null;
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
            user,
            pass,
        },
    });
}

export async function sendAuthEmail({ html, subject, text, to }: AuthEmailPayload) {
    const transport = getTransport();
    const from = process.env.SMTP_FROM ?? "DBConnect <no-reply@dbconnect.local>";

    if (!transport) {
        console.info(`[auth.email] ${subject} -> ${to}\n${text}`);
        return;
    }

    await transport.sendMail({
        from,
        to,
        subject,
        text,
        html,
    });
}

export function buildAbsoluteUrl(path: string) {
    return new URL(path, getBaseUrl()).toString();
}
