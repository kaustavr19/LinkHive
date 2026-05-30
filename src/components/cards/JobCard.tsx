import { useState } from 'react';
import type { JobStatus, Link } from '@/types/link';
import { STATUS_CYCLE } from '@/types/link';
import { StatusPill } from '@/components/StatusPill';
import { CategoryTag } from '@/components/CategoryTag';
import { CardMenu } from '@/components/CardMenu';
import { PinIcon } from '@/components/icons';
import { timeAgo } from '@/lib/format';
import { useIsDesktop } from '@/hooks/useMediaQuery';

interface JobCardProps {
  link: Link;
  onCycleStatus: (id: string) => void;
  onSetStatus: (id: string, status: JobStatus) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
  onOpen: (link: Link) => void;
}

// Jobs-category card. Status uses two input methods over the SAME state:
//   mobile  → tap the pill to cycle (not_applied → applied → rejected → …)
//   desktop → click opens a small menu for direct selection
export function JobCard({
  link,
  onCycleStatus,
  onSetStatus,
  onTogglePin,
  onDelete,
  onOpen,
}: JobCardProps) {
  const isDesktop = useIsDesktop();
  const status = link.status ?? 'not_applied';
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <article
      onClick={() => onOpen(link)}
      className="group relative flex cursor-pointer flex-col gap-3 rounded-lg border border-transparent bg-category-jobs/[0.06] p-4 shadow-card transition-shadow hover:shadow-card-hover"
    >
      <div className="flex items-start justify-between gap-2">
        <CategoryTag category="jobs" />

        <div className="relative" onClick={(e) => e.stopPropagation()}>
          {isDesktop ? (
            <>
              <StatusPill
                status={status}
                solid
                onClick={() => setMenuOpen((o) => !o)}
              />
              {menuOpen && (
                <div
                  className="absolute right-0 z-10 mt-1 flex flex-col gap-1 rounded-lg border border-line bg-surface p-1 shadow-card-hover"
                  role="menu"
                >
                  {STATUS_CYCLE.map((s) => (
                    <button
                      key={s}
                      type="button"
                      role="menuitemradio"
                      aria-checked={s === status}
                      onClick={() => {
                        onSetStatus(link.id, s);
                        setMenuOpen(false);
                      }}
                      className="text-left"
                    >
                      <StatusPill status={s} solid={s === status} />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <StatusPill status={status} solid onClick={() => onCycleStatus(link.id)} />
          )}
        </div>
      </div>

      <div className="min-w-0">
        <h3 className="line-clamp-2 text-card-title font-medium text-ink">{link.name}</h3>
        <p className="mt-1 truncate text-label-sm text-ink-muted">{link.source}</p>
      </div>

      <div className="mt-auto flex items-center justify-between pt-1">
        <span className="text-label-xs text-ink-muted">Saved {timeAgo(link.createdAt)}</span>
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
