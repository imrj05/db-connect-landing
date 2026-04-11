import type { NextRequest } from "next/server";

import { findLicenseByKey, listActivationsByLicenseId, mapLicenseDocumentToLicense, upsertActivation } from "@/lib/license/server";
import { verifyLicense } from "@/lib/license/verify";
import { takeRateLimit } from "@/lib/server-rate-limit";
import { getErrorMessage } from "@/lib/utils";

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
      return Response.json({ error: "Invalid activation payload" }, { status: 400 });
    }

    const rateLimit = takeRateLimit("license-activate", getRequestKey(request, licenseKey), ACTIVATE_RATE_LIMIT);

    if (rateLimit.limited) {
      return Response.json(
        { error: "Too many activation attempts. Try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        },
      );
    }

    const licenseDocument = await findLicenseByKey(licenseKey);

    if (!licenseDocument) {
      return Response.json({ error: "License not found" }, { status: 404 });
    }

    const verification = await verifyLicense(mapLicenseDocumentToLicense(licenseDocument));

    if (!verification.valid || !verification.normalizedLicense) {
      return Response.json(
        { error: verification.reason === "revoked" ? "License revoked" : "License is not valid" },
        { status: verification.reason === "revoked" ? 403 : 400 },
      );
    }

    const activations = await listActivationsByLicenseId(licenseDocument.$id);
    const existingActivation = activations.find((activation) => activation.deviceId === deviceId);

    if (!existingActivation && activations.length >= verification.normalizedLicense.maxDevices) {
      return Response.json({ error: "No activation slots remaining" }, { status: 409 });
    }

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

    return Response.json({
      status: "activated",
      remaining_slots: Math.max(0, verification.normalizedLicense.maxDevices - activationCount),
    });
  } catch (error: unknown) {
    return Response.json({ error: getErrorMessage(error, "Failed to activate license") }, { status: 500 });
  }
}
