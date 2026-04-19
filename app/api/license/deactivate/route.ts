import type { NextRequest } from "next/server";

import { createCorsPreflightResponse, withCors } from "@/lib/api/cors";
import { deleteActivationByDevice, findLicenseByKey, listActivationsByLicenseId } from "@/lib/license/server";
import { takeRateLimit } from "@/lib/server-rate-limit";
import { getErrorMessage } from "@/lib/utils";

const DEACTIVATE_METHODS = ["POST", "OPTIONS"];

const DEACTIVATE_RATE_LIMIT = {
  limit: 10,
  windowMs: 60_000,
};

function isValidLicenseKey(value: string): boolean {
  return /^[-A-Z0-9]{10,64}$/u.test(value);
}

function isValidDeviceId(value: string): boolean {
  return /^[A-Za-z0-9._:-]{6,128}$/u.test(value);
}

export function OPTIONS(request: NextRequest) {
  return createCorsPreflightResponse(request, DEACTIVATE_METHODS);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      device_id?: unknown;
      license_key?: unknown;
    };
    const licenseKey = typeof body.license_key === "string" ? body.license_key.trim().toUpperCase() : "";
    const deviceId = typeof body.device_id === "string" ? body.device_id.trim() : "";

    if (!isValidLicenseKey(licenseKey) || !isValidDeviceId(deviceId)) {
      return withCors(request, Response.json({ error: "Invalid deactivation payload" }, { status: 400 }), DEACTIVATE_METHODS);
    }

    const requestKey = `${request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown"}:${licenseKey}`;
    const rateLimit = takeRateLimit("license-deactivate", requestKey, DEACTIVATE_RATE_LIMIT);

    if (rateLimit.limited) {
      return withCors(
        request,
        Response.json(
          { error: "Too many deactivation attempts. Try again later." },
          {
            status: 429,
            headers: {
              "Retry-After": String(rateLimit.retryAfterSeconds),
            },
          },
        ),
        DEACTIVATE_METHODS,
      );
    }

    const licenseDocument = await findLicenseByKey(licenseKey);

    if (!licenseDocument) {
      return withCors(request, Response.json({ error: "License not found" }, { status: 404 }), DEACTIVATE_METHODS);
    }

    const deleted = await deleteActivationByDevice({
      licenseId: licenseDocument.id,
      deviceId,
    });

    if (!deleted) {
      return withCors(request, Response.json({ error: "Activation not found" }, { status: 404 }), DEACTIVATE_METHODS);
    }

    const remainingActivations = await listActivationsByLicenseId(licenseDocument.id);
    const maxDevices = Number(licenseDocument.max_devices ?? 0);

    return withCors(
      request,
      Response.json({
        status: "deactivated",
        remaining_slots: Math.max(0, maxDevices - remainingActivations.length),
      }),
      DEACTIVATE_METHODS,
    );
  } catch (error: unknown) {
    return withCors(
      request,
      Response.json({ error: getErrorMessage(error, "Failed to deactivate license") }, { status: 500 }),
      DEACTIVATE_METHODS,
    );
  }
}
