import { useEffect, useState } from 'react';

// Returns true when the query matches. Used to switch between the mobile shell
// (bottom nav + chips + FAB) and the desktop shell (sidebar + top search).
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener('change', onChange);
    setMatches(mq.matches);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

// The ~768px breakpoint from the brief: mobile below, desktop at/above.
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 768px)');
}
