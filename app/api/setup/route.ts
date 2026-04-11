/**
 * POST /api/setup
 * Admin route: creates the plans, licenses, and activations collections in Appwrite
 * and seeds plan documents. Safe to re-run. Use reset mode to rebuild schema from scratch.
 * Protected by the admin key — pass it as Authorization: Bearer <APPWRITE_ADMIN_KEY>
 *
 * Run once after deployment:
 *   curl -X POST https://your-domain.com/api/setup \
 *     -H "Authorization: Bearer <APPWRITE_ADMIN_KEY>"
 *
 * Rebuild all collections and data:
 *   curl -X POST 'https://your-domain.com/api/setup?reset=true' \
 *     -H "Authorization: Bearer <APPWRITE_ADMIN_KEY>"
 */
import {
  ACTIVATIONS_COLLECTION_ID,
  serverDatabases,
  DatabasesIndexType,
  ID,
  Permission,
  Role,
  DB_ID,
  PLANS_COLLECTION_ID,
  LICENSES_COLLECTION_ID,
  DEVICES_COLLECTION_ID,
} from "@/lib/appwrite-server";
import { PLANS } from "@/lib/plans";
import type { NextRequest } from "next/server";
const PLANS_COL = PLANS_COLLECTION_ID || "plans";
const LICENSES_COL = LICENSES_COLLECTION_ID || "licenses";
const DEVICES_COL = ACTIVATIONS_COLLECTION_ID || DEVICES_COLLECTION_ID || "activations";
const RESET_WAIT_MS = 30_000;
function ignoreExists(err: unknown) {
  const e = err as { code?: number; message?: string };
  if (e.code !== 409 && !e.message?.includes("already exists")) throw err;
}
function isNotFound(err: unknown) {
  const e = err as { code?: number; message?: string };
  return e.code === 404 || e.message?.includes("not found");
}
function ignoreNotFound(err: unknown) {
  if (!isNotFound(err)) throw err;
}
async function ensureCollection(id: string, name: string, permissions: string[]) {
  try {
    await serverDatabases.createCollection(DB_ID, id, name, permissions);
  } catch (err) {
    ignoreExists(err);
  }
}
async function ensureAttributes(ops: Array<() => Promise<unknown>>) {
  for (const op of ops) {
    try {
      await op();
    } catch (err) {
      ignoreExists(err);
    }
  }
}
async function ensureIndexes(ops: Array<() => Promise<unknown>>) {
  for (const op of ops) {
    try {
      await op();
    } catch (err) {
      ignoreExists(err);
    }
  }
}
async function waitForCollectionDeletion(collectionId: string, maxWaitMs = RESET_WAIT_MS) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    try {
      await serverDatabases.getCollection(DB_ID, collectionId);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } catch (err) {
      if (isNotFound(err)) {
        return;
      }
      throw err;
    }
  }
  throw new Error(`Timed out waiting for collection "${collectionId}" to be deleted`);
}
async function resetCollections(collectionIds: string[]) {
  const uniqueIds = [...new Set(collectionIds)];
  for (const collectionId of uniqueIds) {
    try {
      await serverDatabases.deleteCollection(DB_ID, collectionId);
      await waitForCollectionDeletion(collectionId);
    } catch (err) {
      ignoreNotFound(err);
    }
  }
}
async function getSetupOptions(req: NextRequest): Promise<{ reset: boolean }> {
  const resetFromQuery = req.nextUrl.searchParams.get("reset");
  if (resetFromQuery !== null) {
    return {
      reset: resetFromQuery === "true",
    };
  }
  const rawBody = await req.text();
  if (!rawBody.trim()) {
    return { reset: false };
  }
  try {
    const body = JSON.parse(rawBody) as { reset?: unknown };
    return {
      reset: body.reset === true,
    };
  } catch {
    throw new Error("Invalid JSON body");
  }
}
// Poll until all attributes are in "available" state (Appwrite processes them async)
async function waitForAttributes(collectionId: string, expectedCount: number, maxWaitMs = 30_000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    await new Promise((r) => setTimeout(r, 1500));
    const col = await serverDatabases.getCollection(DB_ID, collectionId);
    const ready = (col.attributes as Array<{ status: string }>).filter((a) => a.status === "available").length;
    if (ready >= expectedCount) return;
  }
  throw new Error(`Timed out waiting for attributes on collection "${collectionId}" to become available`);
}
export async function POST(req: NextRequest) {
  // Auth guard
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (!token || token !== process.env.APPWRITE_ADMIN_KEY?.replace(/^["']|["']$/g, "")) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { reset } = await getSetupOptions(req);
    if (reset) {
      await resetCollections([DEVICES_COL, LICENSES_COL, PLANS_COL]);
    }
    // ── Plans ─────────────────────────────────────────────────────────────
    await ensureCollection(PLANS_COL, "Plans", [Permission.read(Role.any())]);
    await ensureAttributes([
      () => serverDatabases.createStringAttribute({ databaseId: DB_ID, collectionId: PLANS_COL, key: "planId", size: 50, required: true }),
      () => serverDatabases.createStringAttribute({ databaseId: DB_ID, collectionId: PLANS_COL, key: "name", size: 100, required: true }),
      () => serverDatabases.createStringAttribute({ databaseId: DB_ID, collectionId: PLANS_COL, key: "priceLabel", size: 50, required: true }),
      () => serverDatabases.createFloatAttribute({ databaseId: DB_ID, collectionId: PLANS_COL, key: "price", required: true }),
      () => serverDatabases.createIntegerAttribute({ databaseId: DB_ID, collectionId: PLANS_COL, key: "pricePaise", required: true }),
      () => serverDatabases.createIntegerAttribute({ databaseId: DB_ID, collectionId: PLANS_COL, key: "maxDevices", required: true }),
      () => serverDatabases.createIntegerAttribute({ databaseId: DB_ID, collectionId: PLANS_COL, key: "durationDays", required: true }),
      () => serverDatabases.createBooleanAttribute({ databaseId: DB_ID, collectionId: PLANS_COL, key: "isPopular", required: true }),
    ]);
    await waitForAttributes(PLANS_COL, 8);
    // Seed plan documents
    const existing = await serverDatabases.listDocuments(DB_ID, PLANS_COL);
    const existingPlanIds = existing.documents.map((d) => (d as unknown as { planId: string }).planId);
    const seeded: string[] = [];
    for (const plan of PLANS) {
      if (existingPlanIds.includes(plan.id)) {
        seeded.push(`${plan.id} (skipped)`);
        continue;
      }
      await serverDatabases.createDocument(DB_ID, PLANS_COL, ID.unique(), {
        planId: plan.id,
        name: plan.name,
        priceLabel: plan.priceLabel,
        price: plan.price,
        pricePaise: plan.pricePaise,
        maxDevices: plan.maxDevices,
        durationDays: plan.durationDays,
        isPopular: plan.popular,
      });
      seeded.push(plan.id);
    }
    // ── Licenses ──────────────────────────────────────────────────────────
    // No collection-level read permission — documents use per-user permissions
    await ensureCollection(LICENSES_COL, "Licenses", []);
    await ensureAttributes([
      () => serverDatabases.createStringAttribute({ databaseId: DB_ID, collectionId: LICENSES_COL, key: "userId", size: 36, required: true }),
      () => serverDatabases.createStringAttribute({ databaseId: DB_ID, collectionId: LICENSES_COL, key: "planId", size: 50, required: true }),
      () => serverDatabases.createStringAttribute({ databaseId: DB_ID, collectionId: LICENSES_COL, key: "planName", size: 100, required: true }),
      () => serverDatabases.createStringAttribute({ databaseId: DB_ID, collectionId: LICENSES_COL, key: "email", size: 255, required: false }),
      () => serverDatabases.createStringAttribute({ databaseId: DB_ID, collectionId: LICENSES_COL, key: "plan", size: 100, required: false }),
      () => serverDatabases.createStringAttribute({ databaseId: DB_ID, collectionId: LICENSES_COL, key: "expiry", size: 50, required: false }),
      () => serverDatabases.createStringAttribute({ databaseId: DB_ID, collectionId: LICENSES_COL, key: "issuedAt", size: 50, required: false }),
      () => serverDatabases.createStringAttribute({ databaseId: DB_ID, collectionId: LICENSES_COL, key: "licenseKey", size: 64, required: true }),
      () => serverDatabases.createStringAttribute({ databaseId: DB_ID, collectionId: LICENSES_COL, key: "status", size: 20, required: true }),
      () => serverDatabases.createStringAttribute({ databaseId: DB_ID, collectionId: LICENSES_COL, key: "expiresAt", size: 50, required: true }),
      () => serverDatabases.createIntegerAttribute({ databaseId: DB_ID, collectionId: LICENSES_COL, key: "maxDevices", required: true }),
      () => serverDatabases.createFloatAttribute({ databaseId: DB_ID, collectionId: LICENSES_COL, key: "price", required: true }),
      () => serverDatabases.createStringAttribute({ databaseId: DB_ID, collectionId: LICENSES_COL, key: "signature", size: 2048, required: false }),
      () => serverDatabases.createBooleanAttribute({ databaseId: DB_ID, collectionId: LICENSES_COL, key: "isRevoked", required: false, xdefault: false }),
    ]);
    await waitForAttributes(LICENSES_COL, 14);
    await ensureIndexes([
      () => serverDatabases.createIndex({
        databaseId: DB_ID,
        collectionId: LICENSES_COL,
        key: "licenseKey_lookup",
        type: DatabasesIndexType.Key,
        attributes: ["licenseKey"],
      }),
    ]);
    // ── Activations ───────────────────────────────────────────────────────
    await ensureCollection(DEVICES_COL, "Activations", []);
    await ensureAttributes([
      () => serverDatabases.createStringAttribute({ databaseId: DB_ID, collectionId: DEVICES_COL, key: "licenseId", size: 36, required: true }),
      () => serverDatabases.createStringAttribute({ databaseId: DB_ID, collectionId: DEVICES_COL, key: "userId", size: 36, required: true }),
      () => serverDatabases.createStringAttribute({ databaseId: DB_ID, collectionId: DEVICES_COL, key: "licenseKey", size: 64, required: false }),
      () => serverDatabases.createStringAttribute({ databaseId: DB_ID, collectionId: DEVICES_COL, key: "deviceId", size: 128, required: false }),
      () => serverDatabases.createStringAttribute({ databaseId: DB_ID, collectionId: DEVICES_COL, key: "deviceName", size: 200, required: true }),
      () => serverDatabases.createStringAttribute({ databaseId: DB_ID, collectionId: DEVICES_COL, key: "platform", size: 50, required: false }),
      () => serverDatabases.createStringAttribute({ databaseId: DB_ID, collectionId: DEVICES_COL, key: "lastSeen", size: 50, required: false }),
      () => serverDatabases.createDatetimeAttribute({ databaseId: DB_ID, collectionId: DEVICES_COL, key: "activatedAt", required: false }),
    ]);
    await waitForAttributes(DEVICES_COL, 7);
    await ensureIndexes([
      () => serverDatabases.createIndex({
        databaseId: DB_ID,
        collectionId: DEVICES_COL,
        key: "activation_license_lookup",
        type: DatabasesIndexType.Key,
        attributes: ["licenseId"],
      }),
      () => serverDatabases.createIndex({
        databaseId: DB_ID,
        collectionId: DEVICES_COL,
        key: "activation_device_lookup",
        type: DatabasesIndexType.Key,
        attributes: ["deviceId"],
      }),
    ]);
    return Response.json({
      ok: true,
      reset,
      collections: {
        plans: PLANS_COL,
        licenses: LICENSES_COL,
        activations: DEVICES_COL,
      },
      seeded,
      message: reset
        ? "Collections were reset and rebuilt successfully."
        : "All collections are ready. Verify your .env has the correct collection IDs.",
    });
  } catch (err) {
    const e = err as { message?: string };
    return Response.json({ error: e.message ?? "Setup failed" }, { status: 500 });
  }
}
