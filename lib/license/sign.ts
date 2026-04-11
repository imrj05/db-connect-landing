import crypto from "crypto";
import type { SupportedLicenseAlgorithm } from "@/lib/license/types";
export type LicenseSignaturePayload = {
  email: string;
  expiry: string;
  issued_at: string;
  license_key: string;
  max_devices: number;
  plan: string;
};
const DEFAULT_ALGORITHM: SupportedLicenseAlgorithm = "RSASSA-PKCS1-v1_5";
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
function getPrivateKeyPem(override?: string): string {
  return (
    override ??
    process.env.LICENSE_PRIVATE_KEY ??
    ""
  ).trim();
}
function getCrypto(): Crypto {
  if (typeof globalThis.crypto === "undefined" || !globalThis.crypto.subtle) {
    throw new Error("Web Crypto is unavailable in this runtime");
  }
  return globalThis.crypto;
}
async function importPrivateKey(privateKeyPem: string, algorithm: SupportedLicenseAlgorithm): Promise<CryptoKey> {
  const keyObject = crypto.createPrivateKey(privateKeyPem.replace(/\\n/gu, "\n"));
  const pkcs8Der = keyObject.export({ format: "der", type: "pkcs8" });
  const cryptoApi = getCrypto();
  if (algorithm === "ECDSA-P256") {
    return cryptoApi.subtle.importKey(
      "pkcs8",
      pkcs8Der,
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["sign"],
    );
  }
  return cryptoApi.subtle.importKey(
    "pkcs8",
    pkcs8Der,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
}
export function buildLicenseSignaturePayload(payload: LicenseSignaturePayload): string {
  return stableStringify(payload);
}
export async function signLicensePayload(
  payload: LicenseSignaturePayload,
  options?: {
    algorithm?: SupportedLicenseAlgorithm | string;
    privateKey?: string;
  },
): Promise<string> {
  const privateKeyPem = getPrivateKeyPem(options?.privateKey);
  if (!privateKeyPem) {
    throw new Error("LICENSE_PRIVATE_KEY is not configured");
  }
  const algorithm = normalizeAlgorithm(
    typeof options?.algorithm === "string"
      ? options.algorithm
      : process.env.LICENSE_PRIVATE_KEY_ALGORITHM ?? process.env.LICENSE_PUBLIC_KEY_ALGORITHM,
  );
  const privateKey = await importPrivateKey(privateKeyPem, algorithm);
  const payloadBytes = new TextEncoder().encode(buildLicenseSignaturePayload(payload));
  const cryptoApi = getCrypto();
  const signature = algorithm === "ECDSA-P256"
    ? await cryptoApi.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, privateKey, payloadBytes)
    : await cryptoApi.subtle.sign({ name: "RSASSA-PKCS1-v1_5" }, privateKey, payloadBytes);
  return Buffer.from(signature).toString("base64");
}
export async function buildSignedLicenseData(params: {
  email: string;
  expiry: string;
  issuedAt: string;
  licenseKey: string;
  maxDevices: number;
  plan: string;
}) {
  const signaturePayload: LicenseSignaturePayload = {
    email: params.email,
    expiry: params.expiry,
    issued_at: params.issuedAt,
    license_key: params.licenseKey,
    max_devices: params.maxDevices,
    plan: params.plan,
  };
  return {
    email: params.email,
    expiry: params.expiry,
    issuedAt: params.issuedAt,
    licenseKey: params.licenseKey,
    maxDevices: params.maxDevices,
    plan: params.plan,
    signature: await signLicensePayload(signaturePayload),
    isRevoked: false,
  };
}
