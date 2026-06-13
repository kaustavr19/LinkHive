import { Client, Databases } from 'node-appwrite';
import { scrapeMetadata } from '../lib/metadata.js';
import { buildSearchBlob } from '../lib/search.js';

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'linkhive_db';
const COLLECTION_LINKS = process.env.APPWRITE_COLLECTION_LINKS || 'links';

interface AppwriteRequest {
  headers: Record<string, string>;
  body: string;
  bodyRaw: string;
}

interface AppwriteResponse {
  json: (body: unknown, statusCode?: number) => void;
  empty: () => void;
}

interface AppwriteContext {
  req: AppwriteRequest;
  res: AppwriteResponse;
  log: (message: string) => void;
  error: (message: string) => void;
}

export default async function (context: AppwriteContext) {
  const { req, res, log, error } = context;

  let document: Record<string, any>;
  try {
    const payload = JSON.parse(req.body || req.bodyRaw || '{}');
    document = payload;
  } catch {
    error('Failed to parse event payload');
    return res.empty();
  }

  const linkId = document.$id;
  const url = document.url;

  if (!linkId || !url) {
    log('No linkId or url in payload, skipping enrichment');
    return res.empty();
  }

  log(`Enriching link: ${linkId} — ${url}`);

  const metadata = await scrapeMetadata(url);

  if (!metadata.title && !metadata.image && !metadata.description) {
    log('No metadata found, skipping update');
    return res.empty();
  }

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID || '')
    .setKey(process.env.APPWRITE_API_KEY || '');

  const databases = new Databases(client);

  try {
    const current = await databases.getDocument(DATABASE_ID, COLLECTION_LINKS, linkId);

    const updates: Record<string, unknown> = {};

    if (metadata.title && current.name === document.name) {
      updates.name = metadata.title;
    }

    if (metadata.image) updates.ogImage = metadata.image;
    if (metadata.description) updates.ogDescription = metadata.description;
    if (metadata.title) updates.ogTitle = metadata.title;

    if (updates.name) {
      const merged = { ...current, ...updates };
      updates.searchBlob = buildSearchBlob({
        name: merged.name as string,
        source: merged.source,
        url: merged.url,
        category: merged.category,
        tags: merged.tags || [],
      });
    }

    if (Object.keys(updates).length > 0) {
      await databases.updateDocument(DATABASE_ID, COLLECTION_LINKS, linkId, updates);
      log(`Enriched: ${linkId} — title="${metadata.title}", image=${!!metadata.image}`);
    } else {
      log(`No updates needed for ${linkId}`);
    }

    return res.json({ success: true, enriched: Object.keys(updates) });
  } catch (e: any) {
    error(`Enrichment failed for ${linkId}: ${e.message}`);
    return res.json({ error: 'Enrichment failed' }, 500);
  }
}
