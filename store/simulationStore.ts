// store/simulationStore.ts — simulation clock state
import { create } from 'zustand';
import type { SimSpeed } from '@/lib/types';

interface SimulationStore {
  simTime: number;       // ms elapsed since trip start
  speed: SimSpeed;
  playing: boolean;
  tripStarted: boolean;
  // actions
  setSimTime: (t: number) => void;
  advanceSimTime: (deltaMs: number) => void;
  setSpeed: (s: SimSpeed) => void;
  setPlaying: (p: boolean) => void;
  setTripStarted: (v: boolean) => void;
  reset: () => void;
}

const INITIAL: Pick<SimulationStore, 'simTime' | 'speed' | 'playing' | 'tripStarted'> = {
  simTime: 0,
  speed: 1,
  playing: false,
  tripStarted: false,
};

export const useSimulationStore = create<SimulationStore>((set) => ({
  ...INITIAL,
  setSimTime: (t) => set({ simTime: t }),
  advanceSimTime: (deltaMs) => set((s) => ({ simTime: s.simTime + deltaMs })),
  setSpeed: (speed) => set({ speed }),
  setPlaying: (playing) => set({ playing }),
  setTripStarted: (tripStarted) => set({ tripStarted }),
  reset: () => set({ ...INITIAL }),
}));
