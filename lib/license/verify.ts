import type {
  LicenseLike,
  LicenseVerificationResult,
  NormalizedLicense,
  SupportedLicenseAlgorithm,
} from "@/lib/license/types";

const LICENSE_CORE_KEYS = new Set([
  "license_key",
  "licenseKey",
  "email",
  "plan",
  "expiry",
  "expiresAt",
  "max_devices",
  "maxDevices",
  "issued_at",
  "issuedAt",
]);

const DEFAULT_ALGORITHM: SupportedLicenseAlgorithm = "RSASSA-PKCS1-v1_5";

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function readBoolean(value: unknown): boolean {
  return value === true || value === "true";
}

function readInteger(value: unknown): number {
  if (typeof value === "number" && Number.isInteger(value)) {
    return value;
  }

  if (typeof value === "string" && /^\d+$/u.test(value.trim())) {
    return Number.parseInt(value, 10);
  }

  return Number.NaN;
}

function getCrypto(): Crypto {
  if (typeof globalThis.crypto === "undefined" || !globalThis.crypto.subtle) {
    throw new Error("Web Crypto is unavailable in this runtime");
  }

  return globalThis.crypto;
}

function decodeBase64(value: string): Uint8Array {
  const normalized = value.replace(/\s+/gu, "");

  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(normalized, "base64"));
  }

  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function pemToBinary(publicKey: string): ArrayBuffer {
  const pemBody = publicKey
    .replace(/-----BEGIN PUBLIC KEY-----/gu, "")
    .replace(/-----END PUBLIC KEY-----/gu, "")
    .replace(/\\n/gu, "\n")
    .trim();

  return decodeBase64(pemBody).buffer as ArrayBuffer;
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  const objectValue = value as Record<string, unknown>;
  const keys = Object.keys(objectValue).sort();

  return `{${keys
    .map((key) => `${JSON.stringify(key)}:${stableStringify(objectValue[key])}`)
    .join(",")}}`;
}

function normalizeAlgorithm(value?: string | null): SupportedLicenseAlgorithm {
  const normalized = value?.trim().toUpperCase();

  if (normalized === "ECDSA" || normalized === "ECDSA-P256") {
    return "ECDSA-P256";
  }

  return DEFAULT_ALGORITHM;
}

function getConfiguredPublicKey(override?: string): string {
  return (
    override ??
    process.env.NEXT_PUBLIC_LICENSE_PUBLIC_KEY ??
    process.env.LICENSE_PUBLIC_KEY ??
    ""
  ).trim();
}

function normalizeLicense(license: LicenseLike): NormalizedLicense | null {
  const normalized: NormalizedLicense = {
    email: readString(license.email),
    expiry: readString(license.expiry ?? license.expiresAt),
    issuedAt: readString(license.issued_at ?? license.issuedAt),
    licenseKey: readString(license.license_key ?? license.licenseKey).toUpperCase(),
    maxDevices: readInteger(license.max_devices ?? license.maxDevices),
    plan: readString(license.plan),
    signature: readString(license.signature),
    isRevoked: readBoolean(license.is_revoked ?? license.isRevoked),
  };

  if (
    !normalized.email ||
    !normalized.expiry ||
    !normalized.issuedAt ||
    !normalized.licenseKey ||
    !normalized.plan ||
    !normalized.signature ||
    !Number.isInteger(normalized.maxDevices) ||
    normalized.maxDevices <= 0
  ) {
    return null;
  }

  return normalized;
}

function buildRawCorePayload(license: LicenseLike): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(license)) {
    if (key.startsWith("$") || !LICENSE_CORE_KEYS.has(key) || typeof value === "undefined") {
      continue;
    }

    payload[key] = value;
  }

  return payload;
}

function buildPayloadCandidates(license: LicenseLike, normalized: NormalizedLicense): string[] {
  const rawCorePayload = buildRawCorePayload(license);
  const snakePayload = {
    license_key: normalized.licenseKey,
    email: normalized.email,
    plan: normalized.plan,
    expiry: normalized.expiry,
    max_devices: normalized.maxDevices,
    issued_at: normalized.issuedAt,
  };
  const camelPayload = {
    licenseKey: normalized.licenseKey,
    email: normalized.email,
    plan: normalized.plan,
    expiresAt: normalized.expiry,
    maxDevices: normalized.maxDevices,
    issuedAt: normalized.issuedAt,
  };
  const candidates = new Set<string>([
    JSON.stringify(rawCorePayload),
    JSON.stringify(snakePayload),
    JSON.stringify(camelPayload),
    stableStringify(snakePayload),
    stableStringify(camelPayload),
  ]);

  return [...candidates].filter((candidate) => candidate !== "{}" && candidate.length > 0);
}

async function importPublicKey(publicKey: string, algorithm: SupportedLicenseAlgorithm): Promise<CryptoKey> {
  const crypto = getCrypto();
  const keyData = publicKey.includes("BEGIN PUBLIC KEY")
    ? pemToBinary(publicKey)
    : (decodeBase64(publicKey).buffer as ArrayBuffer);

  if (algorithm === "ECDSA-P256") {
    return crypto.subtle.importKey(
      "spki",
      keyData,
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["verify"],
    );
  }

  return crypto.subtle.importKey(
    "spki",
    keyData,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );
}

async function verifyCandidate(
  publicKey: CryptoKey,
  candidate: string,
  signature: string,
  algorithm: SupportedLicenseAlgorithm,
): Promise<boolean> {
  const crypto = getCrypto();
  const payload = new TextEncoder().encode(candidate);
  const signatureBytes = decodeBase64(signature) as Uint8Array<ArrayBuffer>;

  if (algorithm === "ECDSA-P256") {
    return crypto.subtle.verify(
      { name: "ECDSA", hash: "SHA-256" },
      publicKey,
      signatureBytes,
      payload,
    );
  }

  return crypto.subtle.verify(
    { name: "RSASSA-PKCS1-v1_5" },
    publicKey,
    signatureBytes,
    payload,
  );
}

function isExpired(expiry: string): boolean | null {
  if (expiry.toLowerCase() === "lifetime") {
    return false;
  }

  const parsed = new Date(expiry);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.getTime() < Date.now();
}

export async function verifyLicense(
  license: LicenseLike,
  options?: {
    publicKey?: string;
    algorithm?: SupportedLicenseAlgorithm | string;
  },
): Promise<LicenseVerificationResult> {
  const normalized = normalizeLicense(license);

  if (!normalized) {
    return {
      valid: false,
      expiry: null,
      plan: null,
      normalizedLicense: null,
      integrityVerified: false,
      reason: "invalid_payload",
    };
  }

  if (normalized.isRevoked) {
    return {
      valid: false,
      expiry: normalized.expiry,
      plan: normalized.plan,
      normalizedLicense: normalized,
      integrityVerified: false,
      reason: "revoked",
    };
  }

  const publicKeyPem = getConfiguredPublicKey(options?.publicKey);

  if (!publicKeyPem) {
    return {
      valid: false,
      expiry: normalized.expiry,
      plan: normalized.plan,
      normalizedLicense: normalized,
      integrityVerified: false,
      reason: "missing_public_key",
    };
  }

  const algorithm = normalizeAlgorithm(
    typeof options?.algorithm === "string"
      ? options.algorithm
      : process.env.NEXT_PUBLIC_LICENSE_PUBLIC_KEY_ALGORITHM ?? process.env.LICENSE_PUBLIC_KEY_ALGORITHM,
  );
  const importedPublicKey = await importPublicKey(publicKeyPem, algorithm);
  const payloadCandidates = buildPayloadCandidates(license, normalized);

  let integrityVerified = false;

  for (const candidate of payloadCandidates) {
    if (await verifyCandidate(importedPublicKey, candidate, normalized.signature, algorithm)) {
      integrityVerified = true;
      break;
    }
  }

  if (!integrityVerified) {
    return {
      valid: false,
      expiry: normalized.expiry,
      plan: normalized.plan,
      normalizedLicense: normalized,
      integrityVerified: false,
      reason: "invalid_signature",
    };
  }

  const expired = isExpired(normalized.expiry);

  if (expired === null) {
    return {
      valid: false,
      expiry: normalized.expiry,
      plan: normalized.plan,
      normalizedLicense: normalized,
      integrityVerified: true,
      reason: "invalid_expiry",
    };
  }

  if (expired) {
    return {
      valid: false,
      expiry: normalized.expiry,
      plan: normalized.plan,
      normalizedLicense: normalized,
      integrityVerified: true,
      reason: "expired",
    };
  }

  return {
    valid: true,
    expiry: normalized.expiry,
    plan: normalized.plan,
    normalizedLicense: normalized,
    integrityVerified: true,
  };
}
