/**
 * POST /api/setup
 * One-time route: creates the plans, licenses, and devices collections in Appwrite
 * and seeds plan documents. Fully idempotent — safe to re-run.
 * Protected by the admin key — pass it as Authorization: Bearer <APPWRITE_ADMIN_KEY>
 *
 * Run once after deployment:
 *   curl -X POST https://your-domain.com/api/setup \
 *     -H "Authorization: Bearer <APPWRITE_ADMIN_KEY>"
 */
import {
  serverDatabases,
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
const DEVICES_COL = DEVICES_COLLECTION_ID || "devices";
function ignoreExists(err: unknown) {
  const e = err as { code?: number; message?: string };
  if (e.code !== 409 && !e.message?.includes("already exists")) throw err;
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
    const existingPlanIds = existing.documents.map((d) => (d as { planId: string }).planId);
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
      () => serverDatabases.createStringAttribute({ databaseId: DB_ID, collectionId: LICENSES_COL, key: "licenseKey", size: 64, required: true }),
      () => serverDatabases.createStringAttribute({ databaseId: DB_ID, collectionId: LICENSES_COL, key: "status", size: 20, required: true }),
      () => serverDatabases.createStringAttribute({ databaseId: DB_ID, collectionId: LICENSES_COL, key: "expiresAt", size: 50, required: true }),
      () => serverDatabases.createIntegerAttribute({ databaseId: DB_ID, collectionId: LICENSES_COL, key: "maxDevices", required: true }),
      () => serverDatabases.createFloatAttribute({ databaseId: DB_ID, collectionId: LICENSES_COL, key: "price", required: true }),
    ]);
    await waitForAttributes(LICENSES_COL, 8);
    // ── Devices ───────────────────────────────────────────────────────────
    await ensureCollection(DEVICES_COL, "Devices", []);
    await ensureAttributes([
      () => serverDatabases.createStringAttribute({ databaseId: DB_ID, collectionId: DEVICES_COL, key: "licenseId", size: 36, required: true }),
      () => serverDatabases.createStringAttribute({ databaseId: DB_ID, collectionId: DEVICES_COL, key: "userId", size: 36, required: true }),
      () => serverDatabases.createStringAttribute({ databaseId: DB_ID, collectionId: DEVICES_COL, key: "deviceName", size: 200, required: true }),
      () => serverDatabases.createStringAttribute({ databaseId: DB_ID, collectionId: DEVICES_COL, key: "platform", size: 50, required: false }),
      () => serverDatabases.createStringAttribute({ databaseId: DB_ID, collectionId: DEVICES_COL, key: "lastSeen", size: 50, required: false }),
    ]);
    await waitForAttributes(DEVICES_COL, 5);
    return Response.json({
      ok: true,
      collections: {
        plans: PLANS_COL,
        licenses: LICENSES_COL,
        devices: DEVICES_COL,
      },
      seeded,
      message: "All collections ready. Verify your .env has the correct collection IDs.",
    });
  } catch (err) {
    const e = err as { message?: string };
    return Response.json({ error: e.message ?? "Setup failed" }, { status: 500 });
  }
}
