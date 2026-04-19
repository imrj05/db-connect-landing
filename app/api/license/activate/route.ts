import type { NextRequest } from "next/server";

import { createCorsPreflightResponse, withCors } from "@/lib/api/cors";
import { findLicenseByKey, listActivationsByLicenseId, mapLicenseDocumentToLicense, upsertActivation } from "@/lib/license/server";
import { verifyLicense } from "@/lib/license/verify";
import { takeRateLimit } from "@/lib/server-rate-limit";
import { getErrorMessage } from "@/lib/utils";

const ACTIVATE_METHODS = ["POST", "OPTIONS"];

const ACTIVATE_RATE_LIMIT = {
  limit: 10,
  windowMs: 60_000,
};

function getRequestKey(request: NextRequest, licenseKey: string): string {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();

  return `${forwardedFor ?? realIp ?? "unknown"}:${licenseKey}`;
}

function isValidLicenseKey(value: string): boolean {
  return /^[-A-Z0-9]{10,64}$/u.test(value);
}

function isValidDeviceId(value: string): boolean {
  return /^[A-Za-z0-9._:-]{6,128}$/u.test(value);
}

function normalizeDeviceName(value: unknown): string {
  if (typeof value !== "string") {
    return "Unknown device";
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized.slice(0, 120) : "Unknown device";
}

export function OPTIONS(request: NextRequest) {
  return createCorsPreflightResponse(request, ACTIVATE_METHODS);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      device_id?: unknown;
      device_name?: unknown;
      license_key?: unknown;
    };
    const licenseKey = typeof body.license_key === "string" ? body.license_key.trim().toUpperCase() : "";
    const deviceId = typeof body.device_id === "string" ? body.device_id.trim() : "";
    const deviceName = normalizeDeviceName(body.device_name);

    if (!isValidLicenseKey(licenseKey) || !isValidDeviceId(deviceId)) {
      return withCors(request, Response.json({ error: "Invalid activation payload" }, { status: 400 }), ACTIVATE_METHODS);
    }

    const rateLimit = takeRateLimit("license-activate", getRequestKey(request, licenseKey), ACTIVATE_RATE_LIMIT);

    if (rateLimit.limited) {
      return withCors(
        request,
        Response.json(
          { error: "Too many activation attempts. Try again later." },
          {
            status: 429,
            headers: {
              "Retry-After": String(rateLimit.retryAfterSeconds),
            },
          },
        ),
        ACTIVATE_METHODS,
      );
    }

    const licenseDocument = await findLicenseByKey(licenseKey);

    if (!licenseDocument) {
      return withCors(request, Response.json({ error: "License not found" }, { status: 404 }), ACTIVATE_METHODS);
    }

    const verification = await verifyLicense(mapLicenseDocumentToLicense(licenseDocument));

    if (!verification.valid || !verification.normalizedLicense) {
      return withCors(
        request,
        Response.json(
          { error: verification.reason === "revoked" ? "License revoked" : "License is not valid" },
          { status: verification.reason === "revoked" ? 403 : 400 },
        ),
        ACTIVATE_METHODS,
      );
    }

    const activations = await listActivationsByLicenseId(licenseDocument.id);
    const existingActivation = activations.find((activation) => activation.device_id === deviceId);

    if (!existingActivation && activations.length >= verification.normalizedLicense.maxDevices) {
      return withCors(request, Response.json({ error: "No activation slots remaining" }, { status: 409 }), ACTIVATE_METHODS);
    }

    const validatedAt = new Date().toISOString();

    const result = await upsertActivation({
      license: licenseDocument,
      deviceId,
      deviceName,
    });
    const activationCount = existingActivation ? activations.length : activations.length + 1;

    console.info("[license.activate] activation recorded", {
      activationId: result.activationId,
      deviceId,
      isNew: result.isNew,
      licenseKey,
    });

    return withCors(
      request,
      Response.json({
        status: "activated",
        remaining_slots: Math.max(0, verification.normalizedLicense.maxDevices - activationCount),
        license: {
          license_key: verification.normalizedLicense.licenseKey,
          email: verification.normalizedLicense.email,
          plan: verification.normalizedLicense.plan,
          expiry: verification.normalizedLicense.expiry,
          max_devices: verification.normalizedLicense.maxDevices,
          issued_at: verification.normalizedLicense.issuedAt,
          signature: verification.normalizedLicense.signature,
        },
        device_id: deviceId,
        activated: true,
        last_validated_at: validatedAt,
      }),
      ACTIVATE_METHODS,
    );
  } catch (error: unknown) {
    return withCors(
      request,
      Response.json({ error: getErrorMessage(error, "Failed to activate license") }, { status: 500 }),
      ACTIVATE_METHODS,
    );
  }
}
