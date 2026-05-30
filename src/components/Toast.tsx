import { useEffect } from 'react';
import { useUI } from '@/store/useUI';
import { CheckCircleIcon } from './icons';

// Transient confirmation (e.g. after a save). Auto-dismisses.
export function Toast() {
  const toast = useUI((s) => s.toast);
  const clearToast = useUI((s) => s.clearToast);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(clearToast, 2200);
    return () => clearTimeout(t);
  }, [toast, clearToast]);

  if (!toast) return null;

  return (
    <div
      role="status"
      className="fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-primary px-4 py-2 text-body-medium text-on-primary shadow-fab md:bottom-6"
    >
      <CheckCircleIcon className="h-4 w-4" />
      {toast}
    </div>
  );
}
