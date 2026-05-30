import type { Link } from '@/types/link';

// Precompute the lowercase haystack: name + source + url + category + tags.
// Recompute this on every write so offline search stays a single substring test.
export function buildSearchBlob(
  parts: Pick<Link, 'name' | 'source' | 'url' | 'category' | 'tags'>,
): string {
  return [parts.name, parts.source, parts.url, parts.category, ...parts.tags]
    .join(' ')
    .toLowerCase();
}

// Which field a query matched, for the "Matches name / source / category" hint
// in search results.
export type MatchField = 'name' | 'source' | 'category' | 'tags' | 'url';

export function matchField(link: Link, query: string): MatchField | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  if (link.name.toLowerCase().includes(q)) return 'name';
  if (link.source.toLowerCase().includes(q)) return 'source';
  if (link.category.toLowerCase().includes(q)) return 'category';
  if (link.tags.some((t) => t.toLowerCase().includes(q))) return 'tags';
  if (link.url.toLowerCase().includes(q)) return 'url';
  return null;
}

export function searchLinks(links: Link[], query: string): Link[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return sortLinks(links.filter((l) => l.searchBlob.includes(q)));
}

// Pinned float to top; within each group, most-recent first.
export function sortLinks(links: Link[]): Link[] {
  return [...links].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.createdAt - a.createdAt;
  });
}
