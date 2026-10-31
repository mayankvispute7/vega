// store/uiStore.ts — UI state (role, toasts, selected junction)
import { create } from 'zustand';
import type { UserRole } from '@/lib/types';

export interface Toast {
  id: string;
  message: string;
  severity: 'info' | 'warning' | 'danger' | 'success';
  duration?: number;
}

interface UiStore {
  role: UserRole;
  selectedJunctionId: string | null;
  toasts: Toast[];
  setRole: (r: UserRole) => void;
  selectJunction: (id: string | null) => void;
  addToast: (t: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  reset: () => void;
}

let toastCounter = 0;

export const useUiStore = create<UiStore>((set) => ({
  role: 'Dispatcher',
  selectedJunctionId: null,
  toasts: [],

  setRole: (role) => set({ role }),
  selectJunction: (selectedJunctionId) => set({ selectedJunctionId }),

  addToast: (t) => {
    const id = `toast-${++toastCounter}`;
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    const duration = t.duration ?? 4000;
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }));
    }, duration);
  },

  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  reset: () => set({ role: 'Dispatcher', selectedJunctionId: null, toasts: [] }),
}));
