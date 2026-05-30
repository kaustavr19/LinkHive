import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Category, JobStatus, Link } from '@/types/link';
import { categorize } from './categorize';
import { fetchTitle } from './metadata';
import { buildSearchBlob } from './search';

// ─────────────────────────────────────────────────────────────────────────────
// IndexedDB wrapper. All data is local, persists offline, and there is no
// account/network. This module is framework-agnostic — the Zustand store calls
// it, so swapping state libraries later touches nothing here.
// ─────────────────────────────────────────────────────────────────────────────

interface LinkHiveDB extends DBSchema {
  links: {
    key: string;
    value: Link;
    indexes: { 'by-createdAt': number; 'by-category': Category };
  };
}

const DB_NAME = 'linkhive';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<LinkHiveDB>> | null = null;

function getDB(): Promise<IDBPDatabase<LinkHiveDB>> {
  if (!dbPromise) {
    dbPromise = openDB<LinkHiveDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore('links', { keyPath: 'id' });
        store.createIndex('by-createdAt', 'createdAt');
        store.createIndex('by-category', 'category');
      },
    });
  }
  return dbPromise;
}

export async function getAllLinks(): Promise<Link[]> {
  const db = await getDB();
  return db.getAll('links');
}

export async function putLink(link: Link): Promise<Link> {
  const db = await getDB();
  await db.put('links', link);
  return link;
}

export async function deleteLink(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('links', id);
}

// ─────────────────────────────────────────────────────────────────────────────
// SAVE FLOW — three deliberately-separate stages, orchestrated by the store:
//
//   saveRaw(url)            → instant raw write ('uncategorized', name = url)
//   categorizeRecord(rec)   → SYNC: bucket + source + heuristic name (instant)
//   enrich(rec)             → ASYNC SEAM: refine the name via metadata (oEmbed),
//                             degrades to the unchanged record offline/on failure
//
// `saveRaw` + `categorizeRecord` are the original instant two-phase save (the
// raw→categorized states the brief described). `enrich` is the async seam the
// brief anticipated: today it fetches an oEmbed title; tomorrow it can await a
// share-sheet payload or a generic metadata proxy. It is intentionally
// SIDE-EFFECT-FREE (no putLink) so the caller can reconcile its result against
// any concurrent user edit before persisting. Keep these three separate — that
// separation is what makes each future enhancement a fill-in, not a refactor.
// ─────────────────────────────────────────────────────────────────────────────

export async function saveRaw(url: string): Promise<Link> {
  const now = Date.now();
  const raw: Link = {
    id: crypto.randomUUID(),
    url,
    name: url,
    category: 'uncategorized',
    source: '',
    pinned: false,
    tags: [],
    createdAt: now,
    searchBlob: '',
  };
  raw.searchBlob = buildSearchBlob(raw);
  return putLink(raw);
}

// Stage 2 — synchronous, instant. Pure: returns the categorized record without
// persisting (the store persists + reflects it).
export function categorizeRecord(record: Link): Link {
  const { category, source, name } = categorize(record.url);

  const status: JobStatus | undefined =
    category === 'jobs' ? (record.status ?? 'not_applied') : undefined;

  const updated: Link = {
    ...record,
    category,
    source,
    // Respect a user edit if the name was already changed away from the raw url.
    name: record.name === record.url ? name : record.name,
    status,
    searchBlob: '',
  };
  updated.searchBlob = buildSearchBlob(updated);
  return updated;
}

// Stage 3 — the async metadata seam. Returns an improved record (better title)
// or the input unchanged. No I/O persistence here, by design.
export async function enrich(record: Link): Promise<Link> {
  const title = await fetchTitle(record.url);
  if (!title || title === record.name) return record;

  const improved: Link = { ...record, name: title, searchBlob: '' };
  improved.searchBlob = buildSearchBlob(improved);
  return improved;
}
