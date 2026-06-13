import { client, DATABASE_ID, COLLECTION_LINKS } from './appwrite.js';

export type RealtimeEvent = 'create' | 'update' | 'delete';

export interface LinkChangeEvent {
  type: RealtimeEvent;
  documentId: string;
  document?: Record<string, unknown>;
}

type Listener = (event: LinkChangeEvent) => void;

let unsubscribe: (() => void) | null = null;
const listeners: Set<Listener> = new Set();

export function subscribeToLinks(): void {
  if (unsubscribe) return;

  const channel = `databases.${DATABASE_ID}.collections.${COLLECTION_LINKS}.documents`;

  unsubscribe = client.subscribe(channel, (response: { events: string[]; payload: Record<string, unknown> }) => {
    const events = response.events || [];
    const payload = response.payload as Record<string, unknown>;

    let type: RealtimeEvent | null = null;

    if (events.some((e: string) => e.includes('.create'))) {
      type = 'create';
    } else if (events.some((e: string) => e.includes('.update'))) {
      type = 'update';
    } else if (events.some((e: string) => e.includes('.delete'))) {
      type = 'delete';
    }

    if (type && payload) {
      const event: LinkChangeEvent = {
        type,
        documentId: payload.$id as string,
        document: type !== 'delete' ? payload : undefined,
      };

      for (const listener of listeners) {
        listener(event);
      }
    }
  });
}

export function unsubscribeFromLinks(): void {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
}

export function onLinkChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
