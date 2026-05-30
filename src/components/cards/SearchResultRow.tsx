import type { Link } from '@/types/link';
import { CATEGORY_META } from '@/theme/categories';
import { CategoryIcon } from '@/components/CategoryIcon';
import { CategoryTag } from '@/components/CategoryTag';
import { LinkIcon } from '@/components/icons';
import { matchField, type MatchField } from '@/lib/search';

const MATCH_LABEL: Record<MatchField, string> = {
  name: 'Matches name',
  source: 'Matches source',
  category: 'Matches category',
  tags: 'Matches tag',
  url: 'Matches URL',
};

// Single scannable row for the Search results list.
export function SearchResultRow({
  link,
  query,
  onOpen,
}: {
  link: Link;
  query: string;
  onOpen: (link: Link) => void;
}) {
  const meta = CATEGORY_META[link.category];
  const field = matchField(link, query);

  return (
    <button
      type="button"
      onClick={() => onOpen(link)}
      className="flex w-full items-start gap-3 rounded-lg border border-line bg-surface p-4 text-left shadow-card transition-shadow hover:shadow-card-hover"
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${meta.tint} ${meta.text}`}>
        <CategoryIcon category={link.category} className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1">
        <CategoryTag category={link.category} />
        <h3 className="mt-1.5 truncate text-card-title text-ink">{link.name}</h3>
        <p className="mt-0.5 flex items-center gap-1 truncate text-label-sm text-ink-muted">
          <LinkIcon className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{link.source || link.url}</span>
        </p>
        {field && <p className="mt-1 text-label-xs italic text-ink-muted">{MATCH_LABEL[field]}</p>}
      </div>
    </button>
  );
}
