import type { NextRequest } from "next/server";

import { createCorsPreflightResponse, withCors } from "@/lib/api/cors";
import { findLicenseByKey, mapLicenseDocumentToLicense } from "@/lib/license/server";
import { verifyLicense } from "@/lib/license/verify";
import { takeRateLimit } from "@/lib/server-rate-limit";
import { getErrorMessage } from "@/lib/utils";

export const dynamic = "force-dynamic";

const VALIDATE_METHODS = ["GET", "OPTIONS"];

const VALIDATE_RATE_LIMIT = {
  limit: 30,
  windowMs: 60_000,
};

function isValidLicenseKey(value: string): boolean {
  return /^[-A-Z0-9]{10,64}$/u.test(value);
}

export function OPTIONS(request: NextRequest) {
  return createCorsPreflightResponse(request, VALIDATE_METHODS);
}

export async function GET(request: NextRequest) {
  try {
    const key = request.nextUrl.searchParams.get("key")?.trim().toUpperCase() ?? "";

    if (!isValidLicenseKey(key)) {
      return withCors(request, Response.json({ valid: false, error: "Invalid license key" }, { status: 400 }), VALIDATE_METHODS);
    }

    const requestKey = `${request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown"}:${key}`;
    const rateLimit = takeRateLimit("license-validate", requestKey, VALIDATE_RATE_LIMIT);

    if (rateLimit.limited) {
      return withCors(
        request,
        Response.json(
          { valid: false, error: "Too many validation attempts. Try again later." },
          {
            status: 429,
            headers: {
              "Cache-Control": "no-store",
              "Retry-After": String(rateLimit.retryAfterSeconds),
            },
          },
        ),
        VALIDATE_METHODS,
      );
    }

    const licenseDocument = await findLicenseByKey(key);

    if (!licenseDocument) {
      return withCors(
        request,
        Response.json(
          { valid: false, expiry: null, plan: null },
          { status: 404, headers: { "Cache-Control": "no-store" } },
        ),
        VALIDATE_METHODS,
      );
    }

    const verification = await verifyLicense(mapLicenseDocumentToLicense(licenseDocument));

    return withCors(
      request,
      Response.json(
        {
          valid: verification.valid,
          expiry: verification.expiry,
          plan: verification.plan,
        },
        {
          status: verification.valid ? 200 : verification.reason === "revoked" ? 403 : 400,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      ),
      VALIDATE_METHODS,
    );
  } catch (error: unknown) {
    return withCors(
      request,
      Response.json(
        { valid: false, error: getErrorMessage(error, "Failed to validate license") },
        { status: 500, headers: { "Cache-Control": "no-store" } },
      ),
      VALIDATE_METHODS,
    );
  }
}
