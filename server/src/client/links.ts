import { databases, DATABASE_ID, COLLECTION_LINKS } from './appwrite.js';
import { ID, Query, Permission, Role } from 'appwrite';

export type Category = 'jobs' | 'socials' | 'videos' | 'articles' | 'uncategorized';
export type JobStatus = 'applied' | 'not_applied' | 'rejected';

export interface LinkDoc {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;
  url: string;
  name: string;
  category: Category;
  source: string;
  status: JobStatus | null;
  pinned: boolean;
  tags: string[];
  searchBlob: string;
  ogTitle: string | null;
  ogImage: string | null;
  ogDescription: string | null;
}

export interface ListLinksParams {
  category?: Category;
  status?: JobStatus;
  pinned?: boolean;
  query?: string;
  limit?: number;
  offset?: number;
}

export interface ListLinksResponse {
  total: number;
  documents: LinkDoc[];
}

export async function listLinks(params: ListLinksParams = {}): Promise<ListLinksResponse> {
  const queries: string[] = [
    Query.limit(params.limit || 50),
    Query.offset(params.offset || 0),
    Query.orderDesc('$createdAt'),
  ];

  if (params.category) {
    queries.push(Query.equal('category', params.category));
  }
  if (params.status) {
    queries.push(Query.equal('status', params.status));
  }
  if (params.pinned !== undefined) {
    queries.push(Query.equal('pinned', params.pinned));
  }
  if (params.query) {
    queries.push(Query.search('searchBlob', params.query.toLowerCase()));
  }

  const result = await databases.listDocuments(DATABASE_ID, COLLECTION_LINKS, queries);
  return {
    total: result.total,
    documents: result.documents as unknown as LinkDoc[],
  };
}

export async function createLink(data: {
  userId: string;
  url: string;
  name: string;
  category: Category;
  source: string;
  status: JobStatus | null;
  pinned: boolean;
  tags: string[];
  searchBlob: string;
}): Promise<LinkDoc> {
  const doc = await databases.createDocument(
    DATABASE_ID,
    COLLECTION_LINKS,
    ID.unique(),
    {
      ...data,
      ogTitle: null,
      ogImage: null,
      ogDescription: null,
    },
    [
      Permission.read(Role.user(data.userId)),
      Permission.update(Role.user(data.userId)),
      Permission.delete(Role.user(data.userId)),
    ],
  );
  return doc as unknown as LinkDoc;
}

export async function updateLink(
  linkId: string,
  updates: Partial<{
    name: string;
    category: Category;
    status: JobStatus | null;
    pinned: boolean;
    tags: string[];
    searchBlob: string;
  }>,
): Promise<LinkDoc> {
  const doc = await databases.updateDocument(DATABASE_ID, COLLECTION_LINKS, linkId, updates);
  return doc as unknown as LinkDoc;
}

export async function deleteLink(linkId: string): Promise<void> {
  await databases.deleteDocument(DATABASE_ID, COLLECTION_LINKS, linkId);
}

export async function getLink(linkId: string): Promise<LinkDoc> {
  const doc = await databases.getDocument(DATABASE_ID, COLLECTION_LINKS, linkId);
  return doc as unknown as LinkDoc;
}

export async function getAllLinks(): Promise<LinkDoc[]> {
  const all: LinkDoc[] = [];
  let offset = 0;
  const batchSize = 100;

  while (true) {
    const result = await databases.listDocuments(DATABASE_ID, COLLECTION_LINKS, [
      Query.limit(batchSize),
      Query.offset(offset),
      Query.orderDesc('$createdAt'),
    ]);

    all.push(...(result.documents as unknown as LinkDoc[]));
    if (all.length >= result.total) break;
    offset += batchSize;
  }

  return all;
}
