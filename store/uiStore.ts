// store/uiStore.ts — UI state (role, language, toasts, selected junction)
import { create } from 'zustand';
import type { UserRole } from '@/lib/types';

export interface Toast {
  id: string;
  message: string;
  severity: 'info' | 'warning' | 'danger' | 'success';
  duration?: number;
}

export type Language = 'EN' | 'MR';

interface UiStore {
  role: UserRole;
  language: Language;
  selectedJunctionId: string | null;
  toasts: Toast[];
  setRole: (r: UserRole) => void;
  setLanguage: (l: Language) => void;
  selectJunction: (id: string | null) => void;
  addToast: (t: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  reset: () => void;
}

let toastCounter = 0;

export const useUiStore = create<UiStore>((set) => ({
  role: 'Dispatcher',
  language: 'EN',
  selectedJunctionId: null,
  toasts: [],

  setRole: (role) => set({ role }),
  setLanguage: (language) => set({ language }),
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

  reset: () => set({ role: 'Dispatcher', language: 'EN', selectedJunctionId: null, toasts: [] }),
}));
