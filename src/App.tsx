import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useLinks } from '@/store/useLinks';
import { AppShell } from '@/components/layout/AppShell';
import { HomeScreen } from '@/screens/HomeScreen';
import { SearchScreen } from '@/screens/SearchScreen';
import { Toast } from '@/components/Toast';

export default function App() {
  const hydrate = useLinks((s) => s.hydrate);

  // Load saved links from IndexedDB once on startup.
  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomeScreen mode="all" />} />
          <Route path="/category/:category" element={<HomeScreen mode="category" />} />
          <Route path="/pinned" element={<HomeScreen mode="pinned" />} />
          <Route path="/search" element={<SearchScreen />} />
        </Route>
      </Routes>
      <Toast />
    </>
  );
}
