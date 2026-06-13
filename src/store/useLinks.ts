import { create } from 'zustand';
import type { Category, JobStatus, Link } from '@/types/link';
import { nextStatus } from '@/types/link';
import {
  fetchLinks,
  createLink,
  updateLink,
  deleteLink as apiDelete,
} from '@/lib/api';

interface LinksState {
  links: Link[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
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
    const { links } = await fetchLinks({ limit: 100, sort: 'newest' });
    set({ links, hydrated: true });
  },

  addLink: async (url) => {
    // Optimistic placeholder
    const placeholder: Link = {
      id: crypto.randomUUID(),
      url,
      name: url,
      category: 'uncategorized',
      source: '',
      pinned: false,
      tags: [],
      createdAt: Date.now(),
      searchBlob: '',
    };
    set((s) => ({ links: [placeholder, ...s.links] }));

    // Create on server (server handles categorize + enrich)
    const created = await createLink({ url });

    // Replace placeholder with real server response
    set((s) => ({
      links: s.links.map((l) => (l.id === placeholder.id ? created : l)),
    }));

    return created;
  },

  rename: async (id, name) => {
    // Optimistic update
    set((s) => ({
      links: s.links.map((l) => (l.id === id ? { ...l, name } : l)),
    }));
    const updated = await updateLink(id, { name });
    set((s) => ({
      links: s.links.map((l) => (l.id === id ? updated : l)),
    }));
  },

  setCategory: async (id, category) => {
    set((s) => ({
      links: s.links.map((l) => (l.id === id ? { ...l, category } : l)),
    }));
    const updated = await updateLink(id, { category });
    set((s) => ({
      links: s.links.map((l) => (l.id === id ? updated : l)),
    }));
  },

  togglePin: async (id) => {
    const current = get().links.find((l) => l.id === id);
    if (!current) return;
    const pinned = !current.pinned;
    set((s) => ({
      links: s.links.map((l) => (l.id === id ? { ...l, pinned } : l)),
    }));
    const updated = await updateLink(id, { pinned });
    set((s) => ({
      links: s.links.map((l) => (l.id === id ? updated : l)),
    }));
  },

  setStatus: async (id, status) => {
    const current = get().links.find((l) => l.id === id);
    if (!current || current.category !== 'jobs') return;
    set((s) => ({
      links: s.links.map((l) => (l.id === id ? { ...l, status } : l)),
    }));
    const updated = await updateLink(id, { status });
    set((s) => ({
      links: s.links.map((l) => (l.id === id ? updated : l)),
    }));
  },

  cycleStatus: async (id) => {
    const current = get().links.find((l) => l.id === id);
    if (!current || current.category !== 'jobs') return;
    const status = nextStatus(current.status ?? 'not_applied');
    set((s) => ({
      links: s.links.map((l) => (l.id === id ? { ...l, status } : l)),
    }));
    const updated = await updateLink(id, { status });
    set((s) => ({
      links: s.links.map((l) => (l.id === id ? updated : l)),
    }));
  },

  remove: async (id) => {
    set((s) => ({ links: s.links.filter((l) => l.id !== id) }));
    await apiDelete(id);
  },
}));
