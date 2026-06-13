import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useLinks } from '@/store/useLinks';
import { useAuth } from '@/store/useAuth';
import { AppShell } from '@/components/layout/AppShell';
import { HomeScreen } from '@/screens/HomeScreen';
import { SearchScreen } from '@/screens/SearchScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { SignupScreen } from '@/screens/SignupScreen';
import { Toast } from '@/components/Toast';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const hydrate = useLinks((s) => s.hydrate);
  const hydrateAuth = useAuth((s) => s.hydrate);

  useEffect(() => {
    void hydrateAuth();
  }, [hydrateAuth]);

  // Load saved links from IndexedDB once on startup.
  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <>
      <Routes>
        {/* Auth routes (guest only) */}
        <Route path="/login" element={<GuestRoute><LoginScreen /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><SignupScreen /></GuestRoute>} />

        {/* Protected app routes */}
        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
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
