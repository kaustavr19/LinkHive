import { NavLink } from 'react-router-dom';
import { HomeIcon, SearchIcon, PinIcon } from '@/components/icons';

// Three live destinations only — Home, Search, Pinned. Add is the FAB's job, so
// it is intentionally NOT duplicated here. (The mockup's 5-icon bar over-
// promised destinations that don't exist in v1; a clean 3-item bar reads as
// intentional rather than half-wired.)
const ITEMS = [
  { to: '/', end: true, label: 'Home', Icon: HomeIcon },
  { to: '/search', end: false, label: 'Search', Icon: SearchIcon },
  { to: '/pinned', end: false, label: 'Pinned', Icon: PinIcon },
];

export function BottomNav() {
  return (
    <nav className="flex h-14 shrink-0 items-center justify-around border-t border-line bg-canvas">
      {ITEMS.map(({ to, end, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-0.5 py-1 text-label-xs transition-colors ${
              isActive ? 'text-ink' : 'text-ink-muted'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={`flex h-8 w-12 items-center justify-center rounded-full transition-colors ${
                  isActive ? 'bg-primary text-on-primary' : ''
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
