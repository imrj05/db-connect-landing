import {
  ACTIVATIONS_COLLECTION_ID,
  DB_ID,
  ID,
  LICENSES_COLLECTION_ID,
  Permission,
  Query,
  Role,
  serverDatabases,
} from "@/lib/appwrite-server";
import type { LicenseLike } from "@/lib/license/types";

export type LicenseDocument = {
  $id: string;
  $sequence: string;
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  userId?: string;
  email?: string;
  plan?: string;
  planId?: string;
  planName?: string;
  expiry?: string;
  expiresAt?: string;
  issued_at?: string;
  issuedAt?: string;
  license_key?: string;
  licenseKey?: string;
  max_devices?: number;
  maxDevices?: number;
  signature?: string;
  is_revoked?: boolean;
  isRevoked?: boolean;
  status?: string;
};

export type ActivationDocument = {
  $id: string;
  $sequence: string;
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  licenseId?: string;
  licenseKey?: string;
  deviceId?: string;
  deviceName?: string;
  activatedAt?: string;
  lastSeen?: string;
};

export function getLicenseLookupKey(value: string): string {
  return value.trim().toUpperCase();
}

export function mapLicenseDocumentToLicense(document: LicenseDocument): LicenseLike {
  return {
    license_key: document.license_key ?? document.licenseKey,
    email: document.email,
    plan: document.plan ?? document.planId ?? document.planName,
    expiry: document.expiry ?? document.expiresAt,
    max_devices: document.max_devices ?? document.maxDevices,
    issued_at: document.issued_at ?? document.issuedAt ?? document.$createdAt,
    signature: document.signature,
    is_revoked: document.is_revoked ?? document.isRevoked,
  };
}

export async function findLicenseByKey(licenseKey: string): Promise<LicenseDocument | null> {
  const response = await serverDatabases.listDocuments<LicenseDocument>(DB_ID, LICENSES_COLLECTION_ID, [
    Query.equal("licenseKey", getLicenseLookupKey(licenseKey)),
    Query.limit(1),
  ]);

  return response.documents[0] ?? null;
}

export async function listActivationsByLicenseId(licenseId: string): Promise<ActivationDocument[]> {
  const response = await serverDatabases.listDocuments<ActivationDocument>(DB_ID, ACTIVATIONS_COLLECTION_ID, [
    Query.equal("licenseId", licenseId),
    Query.limit(100),
  ]);

  return response.documents;
}

export async function findActivationByDevice(
  licenseId: string,
  deviceId: string,
): Promise<ActivationDocument | null> {
  try {
    const response = await serverDatabases.listDocuments<ActivationDocument>(DB_ID, ACTIVATIONS_COLLECTION_ID, [
      Query.equal("licenseId", licenseId),
      Query.equal("deviceId", deviceId),
      Query.limit(1),
    ]);

    return response.documents[0] ?? null;
  } catch {
    const activations = await listActivationsByLicenseId(licenseId);
    return activations.find((activation) => activation.deviceId === deviceId) ?? null;
  }
}

export async function upsertActivation(params: {
  license: LicenseDocument;
  deviceId: string;
  deviceName: string;
}): Promise<{ activationId: string; isNew: boolean }> {
  const now = new Date().toISOString();
  const existing = await findActivationByDevice(params.license.$id, params.deviceId);
  const permissions = params.license.userId
    ? [
        Permission.read(Role.user(params.license.userId)),
        Permission.update(Role.user(params.license.userId)),
        Permission.delete(Role.user(params.license.userId)),
      ]
    : undefined;

  if (existing) {
    await serverDatabases.updateDocument(DB_ID, ACTIVATIONS_COLLECTION_ID, existing.$id, {
      deviceId: params.deviceId,
      deviceName: params.deviceName,
      activatedAt: existing.activatedAt ?? now,
      lastSeen: now,
    });

    return {
      activationId: existing.$id,
      isNew: false,
    };
  }

  const created = await serverDatabases.createDocument(
    DB_ID,
    ACTIVATIONS_COLLECTION_ID,
    ID.unique(),
    {
      licenseId: params.license.$id,
      licenseKey: getLicenseLookupKey(params.license.licenseKey ?? params.license.license_key ?? ""),
      userId: params.license.userId ?? "",
      deviceId: params.deviceId,
      deviceName: params.deviceName,
      activatedAt: now,
      lastSeen: now,
    },
    permissions,
  );

  return {
    activationId: created.$id,
    isNew: true,
  };
}

export async function deleteActivationByDevice(params: {
  licenseId: string;
  deviceId: string;
}): Promise<boolean> {
  const activation = await findActivationByDevice(params.licenseId, params.deviceId);

  if (!activation) {
    return false;
  }

  await serverDatabases.deleteDocument(DB_ID, ACTIVATIONS_COLLECTION_ID, activation.$id);
  return true;
}
