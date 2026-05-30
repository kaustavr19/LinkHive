import { create } from 'zustand';
import type { Category, JobStatus, Link } from '@/types/link';
import { nextStatus } from '@/types/link';
import {
  categorizeRecord,
  deleteLink as dbDelete,
  enrich,
  getAllLinks,
  putLink,
  saveRaw,
} from '@/lib/db';
import { buildSearchBlob } from '@/lib/search';

interface LinksState {
  links: Link[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  // Optimistic two-phase save: write raw immediately, then enrich.
  addLink: (url: string) => Promise<Link>;
  rename: (id: string, name: string) => Promise<void>;
  setCategory: (id: string, category: Category) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  setStatus: (id: string, status: JobStatus) => Promise<void>;
  cycleStatus: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useLinks = create<LinksState>((set, get) => ({
  links: [],
  hydrated: false,

  hydrate: async () => {
    const links = await getAllLinks();
    set({ links, hydrated: true });
  },

  addLink: async (url) => {
    // Stage 1 — instant raw write, surfaced immediately (optimistic).
    const raw = await saveRaw(url);
    set((s) => ({ links: [raw, ...s.links] }));

    // Stage 2 — synchronous categorize: bucket + heuristic name, instant.
    const categorized = categorizeRecord(raw);
    await putLink(categorized);
    set((s) => ({
      links: s.links.map((l) => (l.id === categorized.id ? categorized : l)),
    }));

    // Stage 3 — async metadata refinement (oEmbed title), NON-blocking so the
    // save stays instant. Reconcile on resolve: only apply the better title if
    // the name hasn't been changed meanwhile (e.g. a user rename from the sheet).
    void enrich(categorized).then(async (refined) => {
      if (refined.name === categorized.name) return;
      const cur = get().links.find((l) => l.id === categorized.id);
      if (!cur || cur.name !== categorized.name) return; // user edited → respect it
      const updated = { ...cur, name: refined.name };
      updated.searchBlob = buildSearchBlob(updated);
      await putLink(updated);
      set((s) => ({ links: s.links.map((l) => (l.id === updated.id ? updated : l)) }));
    });

    // Return the instant categorized record so the caller can apply user
    // overrides without waiting on the network.
    return categorized;
  },

  rename: async (id, name) => {
    await patch(id, get, set, (l) => {
      const updated = { ...l, name };
      updated.searchBlob = buildSearchBlob(updated);
      return updated;
    });
  },

  // Manual override of the auto-detected category (from the Add-link sheet).
  // Moving into 'jobs' seeds the default status; leaving it clears status.
  setCategory: async (id, category) => {
    await patch(id, get, set, (l) => {
      const updated: Link = {
        ...l,
        category,
        status: category === 'jobs' ? (l.status ?? 'not_applied') : undefined,
      };
      updated.searchBlob = buildSearchBlob(updated);
      return updated;
    });
  },

  togglePin: async (id) => {
    await patch(id, get, set, (l) => ({ ...l, pinned: !l.pinned }));
  },

  setStatus: async (id, status) => {
    await patch(id, get, set, (l) =>
      l.category === 'jobs' ? { ...l, status } : l,
    );
  },

  cycleStatus: async (id) => {
    await patch(id, get, set, (l) =>
      l.category === 'jobs'
        ? { ...l, status: nextStatus(l.status ?? 'not_applied') }
        : l,
    );
  },

  remove: async (id) => {
    await dbDelete(id);
    set((s) => ({ links: s.links.filter((l) => l.id !== id) }));
  },
}));

// Shared helper: apply an in-memory update, persist it, keep store in sync.
async function patch(
  id: string,
  get: () => LinksState,
  set: (partial: Partial<LinksState>) => void,
  fn: (link: Link) => Link,
): Promise<void> {
  const current = get().links.find((l) => l.id === id);
  if (!current) return;
  const updated = fn(current);
  if (updated === current) return;
  set({ links: get().links.map((l) => (l.id === id ? updated : l)) });
  await putLink(updated);
}
