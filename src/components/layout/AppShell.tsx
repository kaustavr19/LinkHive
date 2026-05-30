import { Outlet } from 'react-router-dom';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { AddLinkSheet } from '@/components/AddLinkSheet';

// Single responsive shell. Desktop: 240px sidebar + scrolling content. Mobile:
// top bar + content + bottom nav. The Add-link sheet/modal is always mounted
// here so it can overlay any screen.
export function AppShell() {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <div className="flex h-full">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-container">
            <Outlet />
          </div>
        </main>
        <AddLinkSheet />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <TopBar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
      <AddLinkSheet />
    </div>
  );
}
