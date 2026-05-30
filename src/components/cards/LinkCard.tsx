import type { Link } from '@/types/link';
import { CATEGORY_META } from '@/theme/categories';
import { CategoryTag } from '@/components/CategoryTag';
import { CategoryIcon } from '@/components/CategoryIcon';
import { CardMenu } from '@/components/CardMenu';
import { PinIcon } from '@/components/icons';
import { timeAgo } from '@/lib/format';

interface LinkCardProps {
  link: Link;
  // Single-category views give the card a faint category tint + accent edge.
  tinted?: boolean;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
  onOpen: (link: Link) => void;
}

// Neutral card for the All view; faintly tinted in single-category views.
export function LinkCard({ link, tinted, onTogglePin, onDelete, onOpen }: LinkCardProps) {
  const meta = CATEGORY_META[link.category];

  return (
    <article
      onClick={() => onOpen(link)}
      className={`group relative flex cursor-pointer flex-col gap-3 rounded-lg border border-line p-4 shadow-card transition-shadow hover:shadow-card-hover ${
        tinted ? `${meta.tint} border-transparent` : 'bg-surface'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-lg ${meta.tint} ${meta.text}`}
        >
          <CategoryIcon category={link.category} className="h-5 w-5" />
        </div>
        <CategoryTag category={link.category} />
      </div>

      <div className="min-w-0">
        <h3 className="line-clamp-2 text-card-title text-ink">{link.name}</h3>
        <p className="mt-1 truncate text-label-sm text-ink-muted">{link.source}</p>
      </div>

      <div className="mt-auto flex items-center justify-between pt-1">
        <span className="text-label-xs text-ink-muted">{timeAgo(link.createdAt)}</span>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(link.id);
            }}
            aria-pressed={link.pinned}
            aria-label={link.pinned ? 'Unpin' : 'Pin'}
            className={`rounded-md p-1 transition-colors ${
              link.pinned
                ? 'text-ink'
                : 'text-ink-muted opacity-0 group-hover:opacity-100 hover:text-ink'
            }`}
          >
            <PinIcon className="h-4 w-4" />
          </button>
          <CardMenu link={link} onOpen={onOpen} onTogglePin={onTogglePin} onDelete={onDelete} />
        </div>
      </div>
    </article>
  );
}
