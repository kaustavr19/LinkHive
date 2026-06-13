export const CATEGORIES = ['jobs', 'socials', 'videos', 'articles', 'uncategorized'] as const;
export type Category = (typeof CATEGORIES)[number];

export const JOB_STATUSES = ['applied', 'not_applied', 'rejected'] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export interface LinkDocument {
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

export interface UserProfileDocument {
  $id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  preferences: string;
}
