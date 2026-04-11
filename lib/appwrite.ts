import { Client, Account, Databases } from "appwrite";

const strip = (v: string | undefined, fallback = "") =>
  (v || fallback).replace(/^["']|["']$/g, "");

export const client = new Client();

client
  .setEndpoint(strip(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT, "https://cloud.appwrite.io/v1"))
  .setProject(strip(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID, "YOUR_PROJECT_ID"));

export const account = new Account(client);
export const databases = new Databases(client);

export const DB_ID = strip(process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID);
export const LICENSES_COLLECTION_ID = strip(process.env.NEXT_PUBLIC_APPWRITE_USER_LICENSE_COLLECTION_ID);
export const DEVICES_COLLECTION_ID = strip(process.env.NEXT_PUBLIC_APPWRITE_DEVICES_COLLECTION_ID);
export const ACTIVATIONS_COLLECTION_ID = strip(
  process.env.NEXT_PUBLIC_APPWRITE_ACTIVATIONS_COLLECTION_ID,
  DEVICES_COLLECTION_ID,
);

export default client;
