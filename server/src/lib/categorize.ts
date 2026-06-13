import type { Category } from '../config/constants.js';

interface CategoryRule {
  category: Exclude<Category, 'uncategorized'>;
  patterns: string[];
}

const CATEGORY_RULES: CategoryRule[] = [
  {
    category: 'videos',
    patterns: ['youtube.com', 'youtu.be', 'vimeo.com'],
  },
  {
    category: 'jobs',
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

const SOCIAL_NON_HANDLE = new Set([
  'explore', 'home', 'search', 'reels', 'p', 'watch', 'hashtag', 'i',
]);

export interface CategorizeResult {
  category: Category;
  source: string;
  name: string;
}

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
  const hostPath = host + url.pathname.toLowerCase();

  let category: Category = 'uncategorized';
  for (const rule of CATEGORY_RULES) {
    if (rule.patterns.some((p) => hostPath.includes(p))) {
      category = rule.category;
      break;
    }
  }

  const source = deriveSource(host, url.pathname, category);

  const name = deriveName(host, url.pathname, source, category);

  return { category, source, name };
}

function parseUrl(raw: string): URL | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    return new URL(trimmed);
  } catch {
    try {
      return new URL('https://' + trimmed);
    } catch {
      return null;
    }
  }
}

function deriveSource(host: string, pathname: string, category: Category): string {
  if (category === 'socials') {
    const segments = pathname.split('/').filter(Boolean);
    const first = segments[0]?.replace(/^@/, '') ?? '';
    if (first && !SOCIAL_NON_HANDLE.has(first.toLowerCase())) {
      return '@' + first;
    }
  }
  return host;
}

function deriveName(host: string, pathname: string, source: string, category: Category): string {
  if (category === 'socials' && source.startsWith('@')) {
    return toTitleCase(source.slice(1));
  }

  const segments = pathname.split('/').filter(Boolean);

  const candidates = segments
    .map((s) => s.replace(/\.[a-z]{2,4}$/, ''))
    .filter((s) => !isOpaqueId(s));

  const best = candidates.length > 0 ? candidates[candidates.length - 1] : null;

  if (best) {
    const deSlugged = deslugify(best);
    const cleaned = deSlugged.replace(/\s+[a-f0-9]{6,}$/i, '');
    return toTitleCase(cleaned || deSlugged);
  }

  const domainParts = host.split('.');
  const label = domainParts.length > 2 ? domainParts[domainParts.length - 2] : domainParts[0];
  return toTitleCase(label);
}

function deslugify(slug: string): string {
  return decodeURIComponent(slug)
    .replace(/\+/g, ' ')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isOpaqueId(s: string): boolean {
  return /^\d+$/.test(s) || (/^[a-f0-9]+$/i.test(s) && s.length >= 8);
}

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'from', 'if', 'in',
  'into', 'is', 'it', 'no', 'nor', 'not', 'of', 'on', 'or', 'so', 'that',
  'the', 'to', 'up', 'via', 'with',
]);

const ACRONYMS = new Set(['ui', 'ux', 'api', 'css', 'html', 'js', 'ts', 'ai', 'ml', 'io']);

function toTitleCase(input: string): string {
  const words = input.split(/\s+/);
  return words
    .map((word, i) => {
      const lower = word.toLowerCase();
      if (ACRONYMS.has(lower)) return word.toUpperCase();
      if (i > 0 && i < words.length - 1 && STOP_WORDS.has(lower)) return lower;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}
