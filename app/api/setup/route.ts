/**
 * POST /api/setup
 * One-time route: creates the "plans" collection in Appwrite and seeds plan documents.
 * Protected by the admin key — pass it as Authorization: Bearer <APPWRITE_ADMIN_KEY>
 *
 * Run once after deployment:
 *   curl -X POST https://your-domain.com/api/setup \
 *     -H "Authorization: Bearer <APPWRITE_ADMIN_KEY>"
 */
import { serverDatabases, ID, Permission, Role, DB_ID, PLANS_COLLECTION_ID } from "@/lib/appwrite-server";
import { PLANS } from "@/lib/plans";
import type { NextRequest } from "next/server";
const COLLECTION_ID = PLANS_COLLECTION_ID || "plans";
// Poll until all attributes are in "available" state (Appwrite processes them async)
async function waitForAttributes(expectedCount: number, maxWaitMs = 30_000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    await new Promise((r) => setTimeout(r, 1500));
    const col = await serverDatabases.getCollection(DB_ID, COLLECTION_ID);
    const ready = col.attributes.filter((a: any) => a.status === "available").length;
    if (ready >= expectedCount) return;
  }
  throw new Error("Timed out waiting for Appwrite attributes to become available");
}
export async function POST(req: NextRequest) {
  // Auth guard
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (!token || token !== process.env.APPWRITE_ADMIN_KEY?.replace(/^["']|["']$/g, "")) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    // 1. Create collection (idempotent — skip if it already exists)
    try {
      await serverDatabases.createCollection(
        DB_ID,
        COLLECTION_ID,
        "Plans",
        [Permission.read(Role.any())]
      );
    } catch (err) {
      const e = err as { code?: number; message?: string };
      if (e.code !== 409 && !e.message?.includes("already exists")) throw err;
    }

    // 2. Create each attribute independently (idempotent — skip if already exists)
    const attributeOps: Array<() => Promise<unknown>> = [
      () => serverDatabases.createStringAttribute({ databaseId: DB_ID, collectionId: COLLECTION_ID, key: "planId", size: 50, required: true }),
      () => serverDatabases.createStringAttribute({ databaseId: DB_ID, collectionId: COLLECTION_ID, key: "name", size: 100, required: true }),
      () => serverDatabases.createStringAttribute({ databaseId: DB_ID, collectionId: COLLECTION_ID, key: "priceLabel", size: 50, required: true }),
      () => serverDatabases.createFloatAttribute({ databaseId: DB_ID, collectionId: COLLECTION_ID, key: "price", required: true }),
      () => serverDatabases.createIntegerAttribute({ databaseId: DB_ID, collectionId: COLLECTION_ID, key: "pricePaise", required: true }),
      () => serverDatabases.createIntegerAttribute({ databaseId: DB_ID, collectionId: COLLECTION_ID, key: "maxDevices", required: true }),
      () => serverDatabases.createIntegerAttribute({ databaseId: DB_ID, collectionId: COLLECTION_ID, key: "durationDays", required: true }),
      () => serverDatabases.createBooleanAttribute({ databaseId: DB_ID, collectionId: COLLECTION_ID, key: "isPopular", required: true }),
    ];
    for (const op of attributeOps) {
      try {
        await op();
      } catch (err) {
        const e = err as { code?: number; message?: string };
        if (e.code !== 409 && !e.message?.includes("already exists")) throw err;
      }
    }

    // 3. Wait for attributes to be ready before inserting documents
    await waitForAttributes(8);
    // 4. Seed / upsert plan documents
    const existing = await serverDatabases.listDocuments(DB_ID, COLLECTION_ID);
    const existingPlanIds = existing.documents.map((d: any) => d.planId);
    const seeded: string[] = [];
    for (const plan of PLANS) {
      if (existingPlanIds.includes(plan.id)) {
        seeded.push(`${plan.id} (skipped — already exists)`);
        continue;
      }
      await serverDatabases.createDocument(DB_ID, COLLECTION_ID, ID.unique(), {
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
    return Response.json({
      ok: true,
      collectionId: COLLECTION_ID,
      seeded,
      message: `Plans collection ready. Set NEXT_PUBLIC_APPWRITE_PLANS_COLLECTION_ID=${COLLECTION_ID} in your .env if not already done.`,
    });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
