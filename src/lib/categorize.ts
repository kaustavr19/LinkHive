import type { Category } from '@/types/link';

// ─────────────────────────────────────────────────────────────────────────────
// EDITABLE RULE TABLE
// Add domains here and nothing else changes. Each pattern is matched (as a
// substring) against the lowercased "host + pathname" of the URL, so you can
// scope a rule to a path (e.g. 'linkedin.com/jobs') or a whole domain
// (e.g. 'youtube.com'). First matching rule wins, in array order.
// ─────────────────────────────────────────────────────────────────────────────
export interface CategoryRule {
  category: Exclude<Category, 'uncategorized'>;
  patterns: string[];
}

export const CATEGORY_RULES: CategoryRule[] = [
  {
    category: 'videos',
    patterns: ['youtube.com', 'youtu.be', 'vimeo.com'],
  },
  {
    category: 'jobs',
    // Path-scoped where the domain is general-purpose (linkedin), domain-wide
    // for dedicated ATS providers.
    patterns: [
      'linkedin.com/jobs',
      'indeed.com',
      'greenhouse.io',
      'lever.co',
      'ashbyhq.com',
      'workable.com',
    ],
  },
  {
    category: 'socials',
    patterns: [
      'instagram.com',
      'x.com',
      'twitter.com',
      'tiktok.com',
      'facebook.com',
      'threads.net',
    ],
  },
  {
    category: 'articles',
    patterns: ['medium.com', 'substack.com', 'dev.to', 'hashnode.dev'],
  },
];

// Social path segments that are never handles (so we don't render "@explore").
const SOCIAL_NON_HANDLE = new Set([
  'explore',
  'home',
  'search',
  'reels',
  'p',
  'watch',
  'hashtag',
  'i',
]);

export interface CategorizeResult {
  category: Category;
  source: string;
  name: string;
}

// Pure, synchronous, no network. Never throws on a malformed URL — degrades to
// a best-effort 'uncategorized' result.
export function categorize(rawUrl: string): CategorizeResult {
  const url = parseUrl(rawUrl);

  if (!url) {
    const fallback = rawUrl.trim();
    return {
      category: 'uncategorized',
      source: '',
      name: fallback ? toTitleCase(deslugify(fallback)) : 'Untitled',
    };
  }

  const host = url.hostname.replace(/^www\./, '').toLowerCase();
  const haystack = `${host}${url.pathname}`.toLowerCase();

  const category = matchCategory(haystack);
  const source = deriveSource(category, host, url);
  const name = deriveName(category, host, url);

  return { category, source, name };
}

function parseUrl(rawUrl: string): URL | null {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;
  // Accept bare domains like "medium.com/foo" by assuming https.
  const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  try {
    return new URL(withProtocol);
  } catch {
    return null;
  }
}

function matchCategory(haystack: string): Category {
  for (const rule of CATEGORY_RULES) {
    if (rule.patterns.some((p) => haystack.includes(p))) {
      return rule.category;
    }
  }
  return 'uncategorized';
}

function deriveSource(category: Category, host: string, url: URL): string {
  if (category === 'socials') {
    const first = firstPathSegment(url);
    if (first) {
      const handle = first.replace(/^@/, '');
      if (handle && !SOCIAL_NON_HANDLE.has(handle.toLowerCase())) {
        return `@${handle}`;
      }
    }
  }
  return host;
}

function deriveName(category: Category, host: string, url: URL): string {
  const segments = pathSegments(url);

  // Socials: the meaningful name is usually the handle (first segment), not a
  // deep path. Fall through to the domain label for post/reserved/id paths.
  if (category === 'socials') {
    const first = segments[0];
    if (first && !SOCIAL_NON_HANDLE.has(first.toLowerCase()) && scoreSegment(first) > 0) {
      return toTitleCase(deslugify(stripExtension(first)));
    }
  }

  // Pick the most title-like path segment rather than blindly the last one —
  // so ".../jobs/senior-designer/4012" yields "Senior Designer", not "4012".
  const best = bestSegment(segments);
  if (best) {
    const cleaned = stripTrailingId(deslugify(best));
    if (cleaned) return toTitleCase(cleaned);
  }

  // Homepage / no usable slug → registrable-ish domain label.
  const parts = host.split('.');
  const label = parts.length >= 2 ? parts[parts.length - 2] : parts[0];
  return toTitleCase(label);
}

function pathSegments(url: URL): string[] {
  return url.pathname.split('/').filter(Boolean);
}

function firstPathSegment(url: URL): string | undefined {
  return pathSegments(url)[0];
}

function stripExtension(segment: string): string {
  return segment.replace(/\.[a-z0-9]{1,5}$/i, '');
}

const ID_LIKE = /^[a-z0-9]{6,}$/i;
const NUMERIC = /^\d+$/;

// Heuristic "how title-like is this segment": pure numbers and opaque ids score
// low so they lose to human-readable slugs.
function scoreSegment(rawSegment: string): number {
  const s = stripExtension(decodeSafe(rawSegment));
  if (NUMERIC.test(s)) return -1;
  // looks like a random id: long, alphanumeric, has a digit, no word separators
  if (ID_LIKE.test(s) && /\d/.test(s) && !/[-_+]/.test(s)) return 0;
  const letters = (s.match(/[a-zA-Z]/g) ?? []).length;
  return letters;
}

// Choose the highest-scoring segment; on a tie prefer the later (more specific)
// one. Returns the extension-stripped raw slug, or undefined if none qualify.
function bestSegment(segments: string[]): string | undefined {
  let best: string | undefined;
  let bestScore = 0; // require a positive score (at least some letters)
  segments.forEach((seg) => {
    const score = scoreSegment(seg);
    if (score >= bestScore && score > 0) {
      bestScore = score;
      best = stripExtension(decodeSafe(seg));
    }
  });
  return best;
}

// De-slug: turn "the-future_of+ui" into "the future of ui".
function deslugify(segment: string): string {
  return decodeSafe(segment)
    .replace(/[-_+]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Drop a trailing opaque id token (medium-style hashes, e.g.
// "...minimalist-ui-a1b2c3d4") when it looks like a random id, not a word.
function stripTrailingId(text: string): string {
  const words = text.split(' ');
  if (words.length > 1) {
    const tail = words[words.length - 1];
    const looksLikeId = ID_LIKE.test(tail) && /\d/.test(tail);
    if (looksLikeId) return words.slice(0, -1).join(' ');
  }
  return text;
}

function decodeSafe(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

// Small words kept lowercase (except first/last); these are common in titles.
const STOPWORDS = new Set([
  'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'from', 'in', 'nor', 'of',
  'on', 'or', 'the', 'to', 'via', 'vs', 'with',
]);

// Tokens that should render with specific casing rather than Title Case.
const ACRONYMS: Record<string, string> = {
  ui: 'UI', ux: 'UX', api: 'API', css: 'CSS', html: 'HTML', js: 'JS',
  ai: 'AI', ml: 'ML', ios: 'iOS', faq: 'FAQ', seo: 'SEO', sql: 'SQL',
  php: 'PHP', http: 'HTTP', https: 'HTTPS', sdk: 'SDK', cli: 'CLI',
  pdf: 'PDF', id: 'ID', usa: 'USA', uk: 'UK', ceo: 'CEO', cto: 'CTO',
  saas: 'SaaS', npm: 'npm', tedx: 'TEDx',
};

function toTitleCase(text: string): string {
  const words = text.split(' ').filter(Boolean);
  return words
    .map((w, i) => {
      const lw = w.toLowerCase();
      if (ACRONYMS[lw]) return ACRONYMS[lw];
      const isEdge = i === 0 || i === words.length - 1;
      if (!isEdge && STOPWORDS.has(lw)) return lw;
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(' ');
}
