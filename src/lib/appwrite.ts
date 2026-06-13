import { Client, Account, Databases, Functions, Storage } from 'appwrite';

// ─────────────────────────────────────────────────────────────────────────────
// Appwrite Web SDK — Client-side integration.
// Uses the user's session (no API key needed on the frontend).
// ─────────────────────────────────────────────────────────────────────────────

const client = new Client();

client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '6964f1eb0012a14d9b3e');

export const account = new Account(client);
export const databases = new Databases(client);
export const functions = new Functions(client);
export const storage = new Storage(client);

export { client };

export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || 'linkhive_db';
export const COLLECTION_LINKS = import.meta.env.VITE_APPWRITE_COLLECTION_LINKS || 'links';
