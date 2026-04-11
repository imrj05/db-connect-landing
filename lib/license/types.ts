export type LicenseLike = {
  license_key?: unknown;
  licenseKey?: unknown;
  email?: unknown;
  plan?: unknown;
  expiry?: unknown;
  expiresAt?: unknown;
  max_devices?: unknown;
  maxDevices?: unknown;
  issued_at?: unknown;
  issuedAt?: unknown;
  signature?: unknown;
  is_revoked?: unknown;
  isRevoked?: unknown;
} & Record<string, unknown>;

export type NormalizedLicense = {
  email: string;
  expiry: string;
  issuedAt: string;
  licenseKey: string;
  maxDevices: number;
  plan: string;
  signature: string;
  isRevoked: boolean;
};

export type LicenseVerificationFailureReason =
  | "invalid_payload"
  | "missing_public_key"
  | "invalid_signature"
  | "invalid_expiry"
  | "expired"
  | "revoked";

export type LicenseVerificationResult = {
  valid: boolean;
  expiry: string | null;
  plan: string | null;
  normalizedLicense: NormalizedLicense | null;
  integrityVerified: boolean;
  reason?: LicenseVerificationFailureReason;
};

export type SupportedLicenseAlgorithm = "RSASSA-PKCS1-v1_5" | "ECDSA-P256";
