import { functions } from './appwrite';
import type { Category, JobStatus, Link } from '@/types/link';
import { ExecutionMethod } from 'appwrite';

// ─────────────────────────────────────────────────────────────────────────────
// API client — calls the deployed Appwrite "links-api" function.
// Replaces the old IndexedDB-based db.ts for all CRUD operations.
// ─────────────────────────────────────────────────────────────────────────────

const FUNCTION_ID = 'links-api';

interface ApiResponse<T = unknown> {
  success?: boolean;
  error?: string;
  link?: T;
  links?: T[];
  total?: number;
}

async function call<T = unknown>(
  method: string,
  path: string,
  body?: unknown,
): Promise<ApiResponse<T>> {
  const execution = await functions.createExecution(
    FUNCTION_ID,
    body ? JSON.stringify(body) : undefined,
    false, // async = false (wait for response)
    path,
    method as ExecutionMethod,
  );

  const responseBody = execution.responseBody;
  if (!responseBody) {
    throw new Error('Empty response from function');
  }

  const parsed = JSON.parse(responseBody);

  if (parsed.error) {
    throw new Error(parsed.error);
  }

  return parsed;
}

// ── Adapters: Appwrite document → frontend Link type ─────────────────────────

function docToLink(doc: any): Link {
  return {
    id: doc.$id,
    url: doc.url,
    name: doc.name,
    category: doc.category as Category,
    source: doc.source || '',
    status: doc.status as JobStatus | undefined,
    pinned: doc.pinned ?? false,
    tags: doc.tags || [],
    createdAt: new Date(doc.$createdAt).getTime(),
    searchBlob: doc.searchBlob || '',
  };
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function fetchLinks(params?: {
  category?: Category;
  status?: JobStatus;
  pinned?: boolean;
  q?: string;
  limit?: number;
  offset?: number;
  sort?: 'newest' | 'oldest';
}): Promise<{ links: Link[]; total: number }> {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.status) query.set('status', params.status);
  if (params?.pinned) query.set('pinned', 'true');
  if (params?.q) query.set('q', params.q);
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.offset) query.set('offset', String(params.offset));
  if (params?.sort) query.set('sort', params.sort);

  const qs = query.toString();
  const path = qs ? `/?${qs}` : '/';
  const res = await call<any>('GET', path);

  return {
    links: (res.links || []).map(docToLink),
    total: res.total || 0,
  };
}

export async function createLink(data: {
  url: string;
  name?: string;
  category?: Category;
  tags?: string[];
}): Promise<Link> {
  const res = await call<any>('POST', '/', data);
  return docToLink(res.link);
}

export async function updateLink(
  id: string,
  data: {
    name?: string;
    category?: Category;
    status?: JobStatus;
    pinned?: boolean;
    tags?: string[];
  },
): Promise<Link> {
  const res = await call<any>('PATCH', `/${id}`, data);
  return docToLink(res.link);
}

export async function deleteLink(id: string): Promise<void> {
  await call('DELETE', `/${id}`);
}
