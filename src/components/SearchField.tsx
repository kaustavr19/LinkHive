import { SearchIcon, CloseIcon } from './icons';

// Prominent search input (display-hero sizing per the design spec).
export function SearchField({
  value,
  onChange,
  onClear,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  onClear: () => void;
  autoFocus?: boolean;
}) {
  return (
    <div className="flex flex-1 items-center gap-3 rounded-xl border border-line bg-surface px-4 py-2.5 focus-within:border-primary">
      <SearchIcon className="h-5 w-5 shrink-0 text-ink-muted" />
      <input
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search your saved links…"
        className="w-full bg-transparent text-body-base text-ink outline-none placeholder:text-ink-muted"
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="rounded-full p-0.5 text-ink-muted hover:text-ink"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function ArrowLeftBackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Back"
      className="rounded-md p-1.5 text-ink-muted hover:text-ink"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </button>
  );
}
