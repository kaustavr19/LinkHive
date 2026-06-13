import { Client, Databases, ID, Permission, Role, Query } from 'node-appwrite';
import { categorize } from '../lib/categorize.js';
import { buildSearchBlob } from '../lib/search.js';
import { CreateLinkSchema, UpdateLinkSchema, BulkImportSchema } from '../lib/validation.js';

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'linkhive_db';
const COLLECTION_LINKS = process.env.APPWRITE_COLLECTION_LINKS || 'links';

interface AppwriteRequest {
  headers: Record<string, string>;
  method: string;
  url: string;
  path: string;
  body: string;
  bodyRaw: string;
  query: Record<string, string>;
}

interface AppwriteResponse {
  send: (body: string, statusCode?: number, headers?: Record<string, string>) => void;
  json: (body: unknown, statusCode?: number, headers?: Record<string, string>) => void;
}

interface AppwriteContext {
  req: AppwriteRequest;
  res: AppwriteResponse;
  log: (message: string) => void;
  error: (message: string) => void;
}

function getClient(): Databases {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID || '')
    .setKey(process.env.APPWRITE_API_KEY || '');
  return new Databases(client);
}

function parsePath(path: string): { action: string; id?: string } {
  const segments = (path || '/').replace(/^\/+|\/+$/g, '').split('/');
  const first = segments[0] || '';

  if (first === 'bulk-import') return { action: 'bulk-import' };
  if (first === 'export') return { action: 'export' };
  if (first && first !== '') return { action: 'single', id: first };
  return { action: 'root' };
}

export default async function (context: AppwriteContext) {
  const { req, res, error } = context;

  const userId = req.headers['x-appwrite-user-id'];
  if (!userId) {
    return res.json({ error: 'Unauthorized' }, 401);
  }

  const { action, id } = parsePath(req.path);
  const method = req.method?.toUpperCase();

  try {
    if (method === 'POST' && action === 'bulk-import') {
      return await handleBulkImport(context, userId);
    }

    if (method === 'GET' && action === 'export') {
      return await handleExport(context, userId);
    }

    if (method === 'POST' && action === 'root') {
      return await handleCreate(context, userId);
    }

    if (method === 'GET' && action === 'root') {
      return await handleGetLinks(context, userId);
    }

    if (method === 'PATCH' && action === 'single' && id) {
      return await handleUpdate(context, userId, id);
    }

    if (method === 'DELETE' && action === 'single' && id) {
      return await handleDelete(context, userId, id);
    }

    if (method === 'GET' && action === 'single' && id) {
      return await handleGetSingle(context, userId, id);
    }

    return res.json({ error: 'Not found', path: req.path, method }, 404);
  } catch (e: any) {
    error(`Unhandled error: ${e.message}`);
    return res.json({ error: 'Internal server error' }, 500);
  }
}

async function handleCreate(context: AppwriteContext, userId: string) {
  const { req, res, log } = context;

  let body: unknown;
  try {
    body = JSON.parse(req.body || '{}');
  } catch {
    return res.json({ error: 'Invalid JSON body' }, 400);
  }

  const parsed = CreateLinkSchema.safeParse(body);
  if (!parsed.success) {
    return res.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const { url, name: userProvidedName, category: userCategory, tags } = parsed.data;

  const detected = categorize(url);
  const category = userCategory || detected.category;
  const name = userProvidedName || detected.name;
  const source = detected.source;
  const status = category === 'jobs' ? 'not_applied' : null;

  const linkData = {
    userId,
    url,
    name,
    category,
    source,
    status,
    pinned: false,
    tags: tags || [],
    searchBlob: buildSearchBlob({ name, source, url, category, tags: tags || [] }),
    ogTitle: null,
    ogImage: null,
    ogDescription: null,
  };

  const databases = getClient();

  const doc = await databases.createDocument(
    DATABASE_ID,
    COLLECTION_LINKS,
    ID.unique(),
    linkData,
    [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ],
  );

  log(`Link created: ${doc.$id} — ${category} — ${name}`);
  return res.json({ success: true, link: doc }, 201);
}

async function handleGetLinks(context: AppwriteContext, userId: string) {
  const { req, res } = context;

  const {
    category,
    status,
    pinned,
    q,
    limit: limitStr,
    offset: offsetStr,
    sort,
  } = req.query || {};

  const limit = Math.min(parseInt(limitStr || '50', 10), 100);
  const offset = parseInt(offsetStr || '0', 10);

  const queries: string[] = [
    Query.equal('userId', userId),
    Query.limit(limit),
    Query.offset(offset),
  ];

  if (category) queries.push(Query.equal('category', category));
  if (status) queries.push(Query.equal('status', status));
  if (pinned === 'true') queries.push(Query.equal('pinned', true));
  if (q && q.trim()) queries.push(Query.search('searchBlob', q.trim().toLowerCase()));

  if (sort === 'oldest') {
    queries.push(Query.orderAsc('$createdAt'));
  } else {
    queries.push(Query.orderDesc('pinned'));
    queries.push(Query.orderDesc('$createdAt'));
  }

  const databases = getClient();
  const result = await databases.listDocuments(DATABASE_ID, COLLECTION_LINKS, queries);

  return res.json({
    success: true,
    total: result.total,
    links: result.documents,
    limit,
    offset,
  });
}

async function handleGetSingle(context: AppwriteContext, userId: string, linkId: string) {
  const { res } = context;
  const databases = getClient();

  const doc = await databases.getDocument(DATABASE_ID, COLLECTION_LINKS, linkId);
  if (doc.userId !== userId) {
    return res.json({ error: 'Forbidden' }, 403);
  }

  return res.json({ success: true, link: doc });
}

async function handleUpdate(context: AppwriteContext, userId: string, linkId: string) {
  const { req, res, log } = context;

  let body: unknown;
  try {
    body = JSON.parse(req.body || '{}');
  } catch {
    return res.json({ error: 'Invalid JSON body' }, 400);
  }

  const parsed = UpdateLinkSchema.safeParse(body);
  if (!parsed.success) {
    return res.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const databases = getClient();
  const existing = await databases.getDocument(DATABASE_ID, COLLECTION_LINKS, linkId);

  if (existing.userId !== userId) {
    return res.json({ error: 'Forbidden' }, 403);
  }

  const updates: Record<string, unknown> = {};
  const input = parsed.data;

  if (input.name !== undefined) updates.name = input.name;
  if (input.category !== undefined) {
    updates.category = input.category;
    if (input.category === 'jobs' && !existing.status) {
      updates.status = 'not_applied';
    } else if (input.category !== 'jobs') {
      updates.status = null;
    }
  }
  if (input.status !== undefined) updates.status = input.status;
  if (input.pinned !== undefined) updates.pinned = input.pinned;
  if (input.tags !== undefined) updates.tags = input.tags;

  const merged = { ...existing, ...updates };
  updates.searchBlob = buildSearchBlob({
    name: merged.name,
    source: merged.source,
    url: merged.url,
    category: merged.category,
    tags: merged.tags || [],
  });

  const doc = await databases.updateDocument(DATABASE_ID, COLLECTION_LINKS, linkId, updates);

  log(`Link updated: ${linkId}`);
  return res.json({ success: true, link: doc });
}

async function handleDelete(context: AppwriteContext, userId: string, linkId: string) {
  const { res, log } = context;
  const databases = getClient();

  const existing = await databases.getDocument(DATABASE_ID, COLLECTION_LINKS, linkId);
  if (existing.userId !== userId) {
    return res.json({ error: 'Forbidden' }, 403);
  }

  await databases.deleteDocument(DATABASE_ID, COLLECTION_LINKS, linkId);

  log(`Link deleted: ${linkId}`);
  return res.json({ success: true, deleted: linkId });
}

async function handleBulkImport(context: AppwriteContext, userId: string) {
  const { req, res, log } = context;

  let body: unknown;
  try {
    body = JSON.parse(req.body || '{}');
  } catch {
    return res.json({ error: 'Invalid JSON body' }, 400);
  }

  const parsed = BulkImportSchema.safeParse(body);
  if (!parsed.success) {
    return res.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const databases = getClient();
  const results: { url: string; id?: string; error?: string }[] = [];

  for (const item of parsed.data.links) {
    const detected = categorize(item.url);
    const category = item.category || detected.category;
    const name = item.name || detected.name;
    const source = detected.source;
    const tags = item.tags || [];
    const status = category === 'jobs' ? 'not_applied' : null;

    const linkData = {
      userId,
      url: item.url,
      name,
      category,
      source,
      status,
      pinned: false,
      tags,
      searchBlob: buildSearchBlob({ name, source, url: item.url, category, tags }),
      ogTitle: null,
      ogImage: null,
      ogDescription: null,
    };

    try {
      const doc = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_LINKS,
        ID.unique(),
        linkData,
        [
          Permission.read(Role.user(userId)),
          Permission.update(Role.user(userId)),
          Permission.delete(Role.user(userId)),
        ],
      );
      results.push({ url: item.url, id: doc.$id });
    } catch (e: any) {
      results.push({ url: item.url, error: e.message });
    }
  }

  const created = results.filter((r) => r.id).length;
  const failed = results.filter((r) => r.error).length;

  log(`Bulk import: ${created} created, ${failed} failed`);
  return res.json({ success: true, created, failed, results }, 201);
}

async function handleExport(context: AppwriteContext, userId: string) {
  const { req, res, log } = context;
  const format = req.query?.format || 'json';
  const databases = getClient();

  const allLinks: Record<string, unknown>[] = [];
  let offset = 0;
  const batchSize = 100;

  while (true) {
    const batch = await databases.listDocuments(DATABASE_ID, COLLECTION_LINKS, [
      Query.equal('userId', userId),
      Query.limit(batchSize),
      Query.offset(offset),
      Query.orderDesc('$createdAt'),
    ]);

    allLinks.push(
      ...batch.documents.map((doc) => ({
        url: doc.url,
        name: doc.name,
        category: doc.category,
        source: doc.source,
        status: doc.status,
        pinned: doc.pinned,
        tags: doc.tags,
        createdAt: doc.$createdAt,
      })),
    );

    if (allLinks.length >= batch.total) break;
    offset += batchSize;
  }

  log(`Exporting ${allLinks.length} links for user ${userId}`);

  if (format === 'csv') {
    const header = 'url,name,category,source,status,pinned,tags,createdAt';
    const rows = allLinks.map((l: any) =>
      [
        `"${l.url}"`,
        `"${(l.name || '').replace(/"/g, '""')}"`,
        l.category,
        `"${l.source}"`,
        l.status || '',
        l.pinned,
        `"${(l.tags || []).join(';')}"`,
        l.createdAt,
      ].join(','),
    );
    const csv = [header, ...rows].join('\n');
    return res.send(csv, 200, {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="linkhive-export.csv"',
    });
  }

  return res.json({
    exportedAt: new Date().toISOString(),
    count: allLinks.length,
    links: allLinks,
  });
}
