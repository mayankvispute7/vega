// store/rerouteStore.ts — reroute proposal state
import { create } from 'zustand';
import type { RerouteProposal } from '@/lib/types';

interface RerouteStore {
  proposal: RerouteProposal | null;
  setProposal: (p: RerouteProposal | null) => void;
  approveProposal: () => void;
  rejectProposal: () => void;
  reset: () => void;
}

export const useRerouteStore = create<RerouteStore>((set) => ({
  proposal: null,
  setProposal: (proposal) => set({ proposal }),
  approveProposal: () =>
    set((s) =>
      s.proposal ? { proposal: { ...s.proposal, status: 'Approved' } } : s
    ),
  rejectProposal: () =>
    set((s) =>
      s.proposal ? { proposal: { ...s.proposal, status: 'Rejected' } } : s
    ),
  reset: () => set({ proposal: null }),
}));
