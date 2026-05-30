import type { Category, JobStatus } from '@/types/link';

// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for per-category presentation.
// Components read from here and use the Tailwind color tokens (text-category-*,
// bg-category-*/10, etc.) — they never hardcode hex or pick colors inline. The
// underlying hues live as CSS variables in src/index.css.
// ─────────────────────────────────────────────────────────────────────────────

export interface CategoryMeta {
  label: string;
  // Tailwind class fragments, kept here so color logic stays centralized.
  text: string; // solid accent text (chip label, accent bar)
  tint: string; // ~10% accent wash (chip background, card tint)
  accentBar: string; // left accent bar background (list cards)
  ring: string; // focus / active ring
  chipActive: string; // filled active chip (mobile filter)
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  jobs: {
    label: 'Jobs',
    text: 'text-category-jobs',
    tint: 'bg-category-jobs/10',
    accentBar: 'bg-category-jobs',
    ring: 'ring-category-jobs',
    chipActive: 'bg-category-jobs text-white',
  },
  socials: {
    label: 'Socials',
    text: 'text-category-socials',
    tint: 'bg-category-socials/10',
    accentBar: 'bg-category-socials',
    ring: 'ring-category-socials',
    chipActive: 'bg-category-socials text-white',
  },
  videos: {
    label: 'Videos',
    text: 'text-category-videos',
    tint: 'bg-category-videos/10',
    accentBar: 'bg-category-videos',
    ring: 'ring-category-videos',
    chipActive: 'bg-category-videos text-white',
  },
  articles: {
    label: 'Articles',
    text: 'text-category-articles',
    tint: 'bg-category-articles/10',
    accentBar: 'bg-category-articles',
    ring: 'ring-category-articles',
    chipActive: 'bg-category-articles text-white',
  },
  uncategorized: {
    label: 'Uncategorized',
    text: 'text-category-uncategorized',
    tint: 'bg-category-uncategorized/10',
    accentBar: 'bg-category-uncategorized',
    ring: 'ring-category-uncategorized',
    chipActive: 'bg-primary text-on-primary',
  },
};

export interface StatusMeta {
  label: string;
  text: string;
  tint: string;
  solid: string; // filled pill (desktop direct-select / active state)
}

export const STATUS_META: Record<JobStatus, StatusMeta> = {
  applied: {
    label: 'Applied',
    text: 'text-status-applied',
    tint: 'bg-status-applied/10',
    solid: 'bg-status-applied text-white',
  },
  not_applied: {
    label: 'Not Applied',
    text: 'text-status-not-applied',
    tint: 'bg-status-not-applied/10',
    solid: 'bg-status-not-applied text-white',
  },
  rejected: {
    label: 'Rejected',
    text: 'text-status-rejected',
    tint: 'bg-status-rejected/10',
    solid: 'bg-status-rejected text-white',
  },
};
