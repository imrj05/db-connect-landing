import nodemailer from "nodemailer";

type AuthEmailPayload = {
    html: string;
    subject: string;
    text: string;
    to: string;
};

type AuthActionEmailOptions = {
    ctaLabel: string;
    intro: string;
    label: string;
    securityNote: string;
    subject: string;
    title: string;
    url: string;
};

function getBaseUrl() {
    return process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
}

function escapeHtml(value: string) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function buildAuthActionEmail({ ctaLabel, intro, label, securityNote, subject, title, url }: AuthActionEmailOptions) {
    const safeCtaLabel = escapeHtml(ctaLabel);
    const safeIntro = escapeHtml(intro);
    const safeLabel = escapeHtml(label);
    const safeNote = escapeHtml(securityNote);
    const safeSubject = escapeHtml(subject);
    const safeTitle = escapeHtml(title);
    const safeUrl = escapeHtml(url);
    const preheader = escapeHtml(`${title} with your secure DBConnect link.`);
    const logoUrl = escapeHtml(buildAbsoluteUrl("/icons/128x128.png"));

    const html = `<!doctype html>
<html lang="en">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${safeSubject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f5f7fb; color: #111827; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
        <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; visibility: hidden; mso-hide: all;">
            ${preheader}
        </div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; background-color: #f5f7fb;">
            <tr>
                <td align="center" style="padding: 32px 16px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 620px; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 0 0 16px 0; text-align: center;">
                                <img src="${logoUrl}" alt="DBConnect" width="44" height="44" style="display: inline-block; width: 44px; height: 44px; border: 0; outline: none; text-decoration: none;" />
                            </td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #e5e7eb; border-radius: 28px; background-color: #ffffff; padding: 40px 36px; box-shadow: 0 20px 60px rgba(17, 24, 39, 0.08);">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 0 0 12px 0; font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #6366f1;">
                                            ${safeLabel}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 0 0 16px 0; font-size: 34px; line-height: 40px; font-weight: 700; letter-spacing: -0.03em; color: #111827;">
                                            ${safeTitle}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 0 0 28px 0; font-size: 16px; line-height: 28px; color: #4b5563;">
                                            ${safeIntro}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 0 0 28px 0;">
                                            <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse: separate;">
                                                <tr>
                                                    <td align="center" style="border-radius: 14px; background-color: #111827;">
                                                        <a href="${safeUrl}" style="display: inline-block; padding: 14px 22px; font-size: 15px; font-weight: 600; line-height: 20px; color: #ffffff; text-decoration: none;">
                                                            ${safeCtaLabel}
                                                        </a>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 0 0 28px 0;">
                                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 18px; background-color: #f9fafb;">
                                                <tr>
                                                    <td style="padding: 18px 20px; font-size: 14px; line-height: 22px; color: #6b7280;">
                                                        ${safeNote}
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="border-top: 1px solid #e5e7eb; padding: 24px 0 0 0; font-size: 13px; line-height: 22px; color: #6b7280;">
                                            If the button above does not work, copy and paste this secure link into your browser:<br />
                                            <a href="${safeUrl}" style="color: #111827; word-break: break-all; text-decoration: underline;">${safeUrl}</a>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 18px 12px 0 12px; text-align: center; font-size: 12px; line-height: 20px; color: #6b7280;">
                                This secure email was sent by DBConnect to help you access your account.
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
</html>`;

    const text = [
        title,
        "",
        intro,
        "",
        `${ctaLabel}: ${url}`,
        "",
        securityNote,
        "",
        `If the button above does not work, copy and paste this secure link into your browser: ${url}`,
    ].join("\n");

    return {
        subject,
        text,
        html,
    };
}

function getFromAddress() {
    const configuredFrom = process.env.SMTP_FROM?.trim();
    const senderName = process.env.SMTP_FROM_NAME?.trim() || "DBConnect";

    if (!configuredFrom) {
        return `${senderName} <no-reply@dbconnect.local>`;
    }

    if (configuredFrom.includes("<") && configuredFrom.includes(">")) {
        return configuredFrom;
    }

    return `${senderName} <${configuredFrom}>`;
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
    const from = getFromAddress();

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

export function buildResetPasswordEmail(url: string) {
    return buildAuthActionEmail({
        subject: "Reset your DBConnect password",
        label: "Password Reset",
        title: "Reset your password",
        intro: "We received a request to reset the password for your DBConnect account. Use the secure link below to choose a new password.",
        ctaLabel: "Reset password",
        url,
        securityNote: "If you did not request a password reset, you can safely ignore this email. Your password will stay unchanged until you create a new one.",
    });
}

export function buildVerifyEmail(url: string) {
    return buildAuthActionEmail({
        subject: "Verify your DBConnect email",
        label: "Email Verification",
        title: "Confirm your email",
        intro: "Verify this email address to finish setting up your DBConnect account and unlock secure access across your devices.",
        ctaLabel: "Verify email",
        url,
        securityNote: "If you did not create a DBConnect account, you can safely ignore this email. No further action is required.",
    });
}

export function buildAbsoluteUrl(path: string) {
    return new URL(path, getBaseUrl()).toString();
}
