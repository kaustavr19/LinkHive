import { NavLink, useNavigate } from 'react-router-dom';
import type { Category } from '@/types/link';
import { CATEGORIES } from '@/types/link';
import { CATEGORY_META } from '@/theme/categories';
import { useLinks } from '@/store/useLinks';
import { useUI } from '@/store/useUI';
import { useAuth } from '@/store/useAuth';
import { CategoryIcon } from '@/components/CategoryIcon';
import { ThemeToggle } from '@/components/ThemeToggle';
import { GridIcon, PinIcon, PlusIcon, HiveIcon, LogoutIcon } from '@/components/icons';

// Desktop left sidebar (240px): brand, Add link, category nav with counts,
// Pinned, theme toggle.
export function Sidebar() {
  const links = useLinks((s) => s.links);
  const openAdd = useUI((s) => s.openAdd);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const countFor = (c: Category) => links.filter((l) => l.category === c).length;
  const pinnedCount = links.filter((l) => l.pinned).length;

  return (
    <aside className="flex h-full w-sidebar shrink-0 flex-col border-r border-line bg-sidebar px-4 py-5">
      <div className="flex items-center gap-2 px-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-on-primary">
          <HiveIcon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-headline-md leading-tight text-ink">LinkHive</p>
          <p className="text-label-xs text-ink-muted">Refined Minimalism</p>
        </div>
      </div>

      <button
        type="button"
        onClick={openAdd}
        className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-body-medium text-on-primary transition-opacity hover:opacity-90"
      >
        <PlusIcon className="h-4 w-4" /> Add link
      </button>

      <nav className="mt-6 flex flex-col gap-0.5">
        <SideItem to="/" end icon={<GridIcon className="h-5 w-5" />} label="All" count={links.length} />
        {CATEGORIES.map((c) => (
          <SideItem
            key={c}
            to={`/category/${c}`}
            icon={<CategoryIcon category={c} className="h-5 w-5" />}
            label={CATEGORY_META[c].label}
            count={countFor(c)}
          />
        ))}
      </nav>

      <div className="my-4 border-t border-line" />

      <nav className="flex flex-col gap-0.5">
        <SideItem to="/pinned" icon={<PinIcon className="h-5 w-5" />} label="Pinned" count={pinnedCount} />
      </nav>

      <div className="mt-auto border-t border-line pt-3">
        {user && (
          <div className="mb-2 flex items-center justify-between px-2">
            <span className="truncate text-body-small text-ink-muted">{user.name || user.email}</span>
            <button
              type="button"
              onClick={handleLogout}
              title="Sign out"
              className="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-surface-alt hover:text-ink"
            >
              <LogoutIcon className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="px-2 text-label-xs text-ink-muted">Theme</span>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}

function SideItem({
  to,
  end,
  icon,
  label,
  count,
}: {
  to: string;
  end?: boolean;
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `relative flex items-center gap-3 rounded-md px-3 py-2 text-body-base transition-colors ${
          isActive
            ? 'bg-surface-alt font-medium text-ink before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:rounded-full before:bg-primary'
            : 'text-ink-muted hover:bg-surface-alt hover:text-ink'
        }`
      }
    >
      <span className="shrink-0">{icon}</span>
      <span className="flex-1">{label}</span>
      <span className="text-label-xs text-ink-muted">{count}</span>
    </NavLink>
  );
}
