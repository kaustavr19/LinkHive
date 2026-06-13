import { Client, Account, Databases, Functions, Storage } from 'appwrite';

const client = new Client();

client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '');

export const account = new Account(client);
export const databases = new Databases(client);
export const functions = new Functions(client);
export const storage = new Storage(client);

export { client };

export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || 'linkhive_db';
export const COLLECTION_LINKS = import.meta.env.VITE_APPWRITE_COLLECTION_LINKS || 'links';
export const COLLECTION_USERS = import.meta.env.VITE_APPWRITE_COLLECTION_USERS || 'user_profiles';
export const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID || 'link_thumbnails';
