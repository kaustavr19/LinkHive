export function buildSearchBlob(
  parts: { name: string; source: string; url: string; category: string; tags: string[] },
): string {
  return [parts.name, parts.source, parts.url, parts.category, ...parts.tags]
    .join(' ')
    .toLowerCase();
}
