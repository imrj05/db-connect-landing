import { Client, Databases, IndexType, ID, Permission, Query, Role, Users } from "node-appwrite";

const strip = (v: string | undefined, fallback = "") =>
  (v || fallback).replace(/^["']|["']$/g, "");

const client = new Client()
  .setEndpoint(strip(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT, "https://cloud.appwrite.io/v1"))
  .setProject(strip(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID))
  .setKey(strip(process.env.APPWRITE_ADMIN_KEY));

export const serverDatabases = new Databases(client);
export const serverUsers = new Users(client);
export { IndexType, ID, Permission, Role, Query };

export const DB_ID = strip(process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID);
export const LICENSES_COLLECTION_ID = strip(process.env.NEXT_PUBLIC_APPWRITE_USER_LICENSE_COLLECTION_ID);
export const PLANS_COLLECTION_ID = strip(process.env.NEXT_PUBLIC_APPWRITE_PLANS_COLLECTION_ID, "plans");
export const DEVICES_COLLECTION_ID = strip(process.env.NEXT_PUBLIC_APPWRITE_DEVICES_COLLECTION_ID);
export const ACTIVATIONS_COLLECTION_ID = strip(
  process.env.NEXT_PUBLIC_APPWRITE_ACTIVATIONS_COLLECTION_ID,
  DEVICES_COLLECTION_ID,
);
