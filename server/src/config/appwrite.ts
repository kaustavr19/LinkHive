import { Client, Account, Databases, Storage, Functions } from 'node-appwrite';
import 'dotenv/config';

const client = new Client();

client
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

export { client };

export const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'linkhive_db';
export const COLLECTION_LINKS = process.env.APPWRITE_COLLECTION_LINKS || 'links';
export const COLLECTION_USERS = process.env.APPWRITE_COLLECTION_USERS || 'user_profiles';
export const BUCKET_ID = process.env.APPWRITE_BUCKET_ID || 'link_thumbnails';
