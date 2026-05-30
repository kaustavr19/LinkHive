import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import { HiveIcon } from '@/components/icons';

// Mobile top bar: brand centered-ish with theme toggle. (Search lives on its
// own screen in v1; the home-screen search bar is a planned v1.5 enhancement.)
export function TopBar() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-canvas px-4">
      <Link to="/" className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-on-primary">
          <HiveIcon className="h-4 w-4" />
        </span>
        <span className="text-headline-md text-ink">LinkHive</span>
      </Link>
      <ThemeToggle />
    </header>
  );
}
