import { useEffect, useRef, useState } from 'react';
import type { Link } from '@/types/link';
import { DotsIcon, LinkIcon, PinIcon, TrashIcon } from './icons';

interface CardMenuProps {
  link: Link;
  onOpen: (link: Link) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
}

// Overflow (•••) menu for a card: Open / Pin / Delete. Delete uses a two-step
// inline confirm so a saved link can't be lost on a stray tap.
export function CardMenu({ link, onOpen, onTogglePin, onDelete }: CardMenuProps) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const close = () => {
    setOpen(false);
    setConfirming(false);
  };

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  return (
    <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        aria-label="More actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="rounded-md p-1 text-ink-muted transition-colors hover:text-ink"
      >
        <DotsIcon className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-line bg-surface p-1 shadow-card-hover"
        >
          {!confirming ? (
            <>
              <MenuItem
                icon={<LinkIcon className="h-4 w-4" />}
                label="Open link"
                onClick={() => {
                  onOpen(link);
                  close();
                }}
              />
              <MenuItem
                icon={<PinIcon className="h-4 w-4" />}
                label={link.pinned ? 'Unpin' : 'Pin'}
                onClick={() => {
                  onTogglePin(link.id);
                  close();
                }}
              />
              <MenuItem
                icon={<TrashIcon className="h-4 w-4" />}
                label="Delete"
                danger
                onClick={() => setConfirming(true)}
              />
            </>
          ) : (
            <div className="p-2">
              <p className="mb-2 text-label-sm text-ink">Delete this link?</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={close}
                  className="flex-1 rounded-md border border-line py-1.5 text-label-sm text-ink-muted transition-colors hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDelete(link.id);
                    close();
                  }}
                  className="flex-1 rounded-md bg-status-rejected py-1.5 text-label-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-body-base transition-colors hover:bg-surface-alt ${
        danger ? 'text-status-rejected' : 'text-ink'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
