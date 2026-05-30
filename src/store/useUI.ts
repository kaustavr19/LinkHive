import { create } from 'zustand';

// Lightweight UI-only state: the Add-link sheet/modal can open over any screen,
// so its open state lives outside the router. Also holds a transient toast for
// the brief save confirmation.
interface UIState {
  addOpen: boolean;
  openAdd: () => void;
  closeAdd: () => void;
  toast: string | null;
  showToast: (message: string) => void;
  clearToast: () => void;
}

export const useUI = create<UIState>((set) => ({
  addOpen: false,
  openAdd: () => set({ addOpen: true }),
  closeAdd: () => set({ addOpen: false }),
  toast: null,
  showToast: (message) => set({ toast: message }),
  clearToast: () => set({ toast: null }),
}));
