import type { NextRequest } from "next/server";

const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:1420",
  "http://127.0.0.1:1420",
  "tauri://localhost",
  "https://tauri.localhost",
  "http://tauri.localhost",
];

const DEFAULT_ALLOWED_HEADERS = "Content-Type, Authorization";

function getAllowedOrigins(): Set<string> {
  const configuredOrigins = process.env.LICENSE_API_ALLOWED_ORIGINS
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return new Set([...(configuredOrigins ?? []), ...DEFAULT_ALLOWED_ORIGINS]);
}

function appendVary(headers: Headers, value: string): void {
  const existing = headers.get("Vary");

  if (!existing) {
    headers.set("Vary", value);
    return;
  }

  const values = existing
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (!values.includes(value)) {
    headers.set("Vary", [...values, value].join(", "));
  }
}

function applyCorsHeaders(request: NextRequest, headers: Headers, methods: string[]): boolean {
  const origin = request.headers.get("origin")?.trim();

  appendVary(headers, "Origin");

  if (!origin) {
    return true;
  }

  if (!getAllowedOrigins().has(origin)) {
    return false;
  }

  const requestedHeaders = request.headers.get("access-control-request-headers")?.trim();

  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Methods", methods.join(", "));
  headers.set("Access-Control-Allow-Headers", requestedHeaders || DEFAULT_ALLOWED_HEADERS);
  headers.set("Access-Control-Max-Age", "86400");

  appendVary(headers, "Access-Control-Request-Headers");

  return true;
}

export function withCors(request: NextRequest, response: Response, methods: string[]): Response {
  const allowed = applyCorsHeaders(request, response.headers, methods);

  if (allowed) {
    return response;
  }

  return Response.json(
    { error: "Origin is not allowed" },
    {
      status: 403,
      headers: response.headers,
    },
  );
}

export function createCorsPreflightResponse(request: NextRequest, methods: string[]): Response {
  const headers = new Headers();
  const allowed = applyCorsHeaders(request, headers, methods);

  return new Response(null, {
    status: allowed ? 204 : 403,
    headers,
  });
}
