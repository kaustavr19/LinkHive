import { useSearchParams, useNavigate } from 'react-router-dom';
import type { Link } from '@/types/link';
import { useLinks } from '@/store/useLinks';
import { searchLinks } from '@/lib/search';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { SearchResultRow } from '@/components/cards/SearchResultRow';
import { ArrowLeftBackButton, SearchField } from '@/components/SearchField';

export function SearchScreen() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const links = useLinks((s) => s.links);

  const query = params.get('q') ?? '';
  const setQuery = (q: string) => setParams(q ? { q } : {}, { replace: true });

  const results = searchLinks(links, query);
  const openLink = (link: Link) => window.open(link.url, '_blank', 'noopener');

  return (
    <>
      {/* Search input header */}
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-line bg-canvas/90 px-4 py-3 backdrop-blur md:px-8 md:py-4">
        {!isDesktop && <ArrowLeftBackButton onClick={() => navigate(-1)} />}
        <SearchField value={query} onChange={setQuery} onClear={() => setQuery('')} autoFocus />
      </div>

      <section className="px-4 pb-28 pt-4 md:px-8 md:pb-10">
        {query.trim() === '' ? (
          <RestingState />
        ) : results.length === 0 ? (
          <NoResults query={query} />
        ) : (
          <>
            {isDesktop && (
              <div className="mb-4">
                <p className="text-label-sm uppercase tracking-wide text-ink-muted">Search results</p>
                <h1 className="text-display-hero text-ink">
                  {results.length} item{results.length === 1 ? '' : 's'} found for &ldquo;{query}&rdquo;
                </h1>
              </div>
            )}
            <div className="mx-auto flex max-w-2xl flex-col gap-3">
              {results.map((link) => (
                <SearchResultRow key={link.id} link={link} query={query} onOpen={openLink} />
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}

function RestingState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
      <h2 className="text-headline-md text-ink">Search your hive</h2>
      <p className="mt-2 max-w-xs text-body-base text-ink-muted">
        Find any saved link by name, source, category, or URL — instantly, offline.
      </p>
    </div>
  );
}

function NoResults({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
      <h2 className="text-headline-md text-ink">No matches for &ldquo;{query}&rdquo;</h2>
      <p className="mt-2 max-w-xs text-body-base text-ink-muted">
        Try a different term, or check another category.
      </p>
    </div>
  );
}
