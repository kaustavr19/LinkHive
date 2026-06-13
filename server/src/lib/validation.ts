import { z } from 'zod';
import { CATEGORIES, JOB_STATUSES } from '../config/constants.js';

export const CreateLinkSchema = z.object({
  url: z.string().url('Invalid URL'),
  name: z.string().max(500).optional(),
  category: z.enum(CATEGORIES).optional(),
  tags: z.array(z.string().max(100)).max(20).optional(),
});

export const UpdateLinkSchema = z.object({
  name: z.string().max(500).optional(),
  category: z.enum(CATEGORIES).optional(),
  status: z.enum(JOB_STATUSES).nullable().optional(),
  pinned: z.boolean().optional(),
  tags: z.array(z.string().max(100)).max(20).optional(),
});

export const BulkImportSchema = z.object({
  links: z.array(
    z.object({
      url: z.string().url(),
      name: z.string().max(500).optional(),
      category: z.enum(CATEGORIES).optional(),
      tags: z.array(z.string().max(100)).max(20).optional(),
    }),
  ).min(1).max(500),
});

export type CreateLinkInput = z.infer<typeof CreateLinkSchema>;
export type UpdateLinkInput = z.infer<typeof UpdateLinkSchema>;
export type BulkImportInput = z.infer<typeof BulkImportSchema>;
