import { useParams, useNavigate } from 'react-router-dom';
import type { Category, Link } from '@/types/link';
import { CATEGORY_META } from '@/theme/categories';
import { useLinks } from '@/store/useLinks';
import { sortLinks } from '@/lib/search';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { LinkCard } from '@/components/cards/LinkCard';
import { JobCard } from '@/components/cards/JobCard';
import { CategoryChips } from '@/components/filters/CategoryChips';
import { Fab } from '@/components/layout/Fab';
import { EmptyState } from './EmptyState';
import { SearchIcon } from '@/components/icons';

type Mode = 'all' | 'category' | 'pinned';

export function HomeScreen({ mode }: { mode: Mode }) {
  const params = useParams();
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();
  const links = useLinks((s) => s.links);
  const hydrated = useLinks((s) => s.hydrated);
  const togglePin = useLinks((s) => s.togglePin);
  const cycleStatus = useLinks((s) => s.cycleStatus);
  const setStatus = useLinks((s) => s.setStatus);

  const activeCategory = (mode === 'category' ? (params.category as Category) : null) ?? null;

  const list = sortLinks(
    links.filter((l) => {
      if (mode === 'pinned') return l.pinned;
      if (mode === 'category') return l.category === activeCategory;
      return true;
    }),
  );

  const openLink = (link: Link) => window.open(link.url, '_blank', 'noopener');

  // First-run empty state (no links at all, on the All view).
  if (hydrated && links.length === 0 && mode === 'all') {
    return (
      <>
        <DesktopHeader isDesktop={isDesktop} onSearch={() => navigate('/search')} />
        <EmptyState />
        {!isDesktop && <Fab />}
      </>
    );
  }

  const heading =
    mode === 'pinned'
      ? { title: 'Pinned', subtitle: 'Your most important links, kept on top.' }
      : mode === 'category' && activeCategory
        ? activeCategory === 'jobs'
          ? { title: 'Jobs Pipeline', subtitle: 'Manage and track your saved career opportunities.' }
          : { title: CATEGORY_META[activeCategory].label, subtitle: null }
        : { title: 'All links', subtitle: null };

  return (
    <>
      <DesktopHeader isDesktop={isDesktop} onSearch={() => navigate('/search')} />

      {/* Mobile category rail */}
      {!isDesktop && mode !== 'pinned' && (
        <CategoryChips active={mode === 'all' ? 'all' : (activeCategory as Category)} />
      )}

      <section className="px-4 pb-28 md:px-8 md:pb-10 md:pt-2">
        {isDesktop && (
          <div className="mb-5">
            <h1 className="text-display-hero text-ink">{heading.title}</h1>
            {heading.subtitle && (
              <p className="mt-1 text-body-base text-ink-muted">{heading.subtitle}</p>
            )}
          </div>
        )}

        {list.length === 0 ? (
          <EmptyMessage mode={mode} category={activeCategory} />
        ) : (
          <div className="gap-3 [column-fill:_balance] md:gap-6 columns-2 lg:columns-3">
            {list.map((link) => (
              <div key={link.id} className="mb-3 break-inside-avoid md:mb-6">
                {mode === 'category' && link.category === 'jobs' ? (
                  <JobCard
                    link={link}
                    onCycleStatus={cycleStatus}
                    onSetStatus={setStatus}
                    onTogglePin={togglePin}
                    onOpen={openLink}
                  />
                ) : (
                  <LinkCard
                    link={link}
                    tinted={mode === 'category'}
                    onTogglePin={togglePin}
                    onOpen={openLink}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {!isDesktop && <Fab category={activeCategory ?? undefined} />}
    </>
  );
}

// Desktop hero search bar (sits above the feed). Clicking jumps to the Search
// screen, the dedicated retrieval surface in v1.
function DesktopHeader({ isDesktop, onSearch }: { isDesktop: boolean; onSearch: () => void }) {
  if (!isDesktop) return null;
  return (
    <div className="sticky top-0 z-10 border-b border-line bg-canvas/80 px-8 py-4 backdrop-blur">
      <button
        type="button"
        onClick={onSearch}
        className="flex w-full items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-left text-body-base text-ink-muted transition-colors hover:border-primary/40"
      >
        <SearchIcon className="h-5 w-5" />
        Search across all your links…
      </button>
    </div>
  );
}

function EmptyMessage({ mode, category }: { mode: Mode; category: Category | null }) {
  if (mode === 'pinned') {
    return (
      <EmptyState
        title="No pinned links yet"
        message="Pin a link to keep it on top of every view."
        showCta={false}
      />
    );
  }
  const label = category ? CATEGORY_META[category].label.toLowerCase() : 'links';
  return (
    <EmptyState
      title={`No ${label} yet`}
      message="Save a link and it will be auto-sorted into the right bucket."
    />
  );
}
