// The five fixed category buckets. Exactly one is auto-assigned per link and it
// drives all navigation, filtering, and color-coding. This is distinct from
// `tags`, which are user-applied, multiple, and orthogonal (see Link.tags).
export type Category =
  | 'jobs'
  | 'socials'
  | 'videos'
  | 'articles'
  | 'uncategorized';

// Job application lifecycle. Only meaningful when category === 'jobs'.
export type JobStatus = 'applied' | 'not_applied' | 'rejected';

export interface Link {
  id: string; // uuid (crypto.randomUUID)
  url: string; // raw, exactly as pasted
  name: string; // editable; auto-derived from the URL, Title Cased
  category: Category; // single auto-assigned bucket
  source: string; // derived: @handle or domain
  status?: JobStatus; // jobs only; defaults to 'not_applied' on a jobs link
  pinned: boolean; // floats to top of browse + search
  // Carried in the data model from v1 so no IndexedDB migration is needed when
  // the tag-selector UI ships (v2). Indexed into searchBlob immediately, so any
  // tags that exist are searchable — but there is no UI to set them yet.
  tags: string[];
  createdAt: number; // epoch ms; default sort is most-recent-first
  // Precomputed lowercase haystack: name + source + url + category + tags.
  // Recomputed on every write so offline search is a single string-contains.
  searchBlob: string;
}

export const CATEGORIES: Category[] = [
  'jobs',
  'socials',
  'videos',
  'articles',
  'uncategorized',
];

// Status cycle order follows the real application lifecycle, not the mockup
// sequence: each mobile tap moves "forward" through the story, looping back to
// the start to undo mistakes.
export const STATUS_CYCLE: JobStatus[] = ['not_applied', 'applied', 'rejected'];

export function nextStatus(current: JobStatus): JobStatus {
  const i = STATUS_CYCLE.indexOf(current);
  return STATUS_CYCLE[(i + 1) % STATUS_CYCLE.length];
}
