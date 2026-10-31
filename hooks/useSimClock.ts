// hooks/useSimClock.ts — rAF-based simulation clock
'use client';
import { useEffect, useRef } from 'react';
import { useSimulationStore } from '@/store/simulationStore';

const MAX_DELTA_MS = 200; // cap frame delta to prevent huge jumps

export function useSimClock(onTick?: (simTime: number) => void) {
  const { playing, speed, advanceSimTime } = useSimulationStore();
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  useEffect(() => {
    if (!playing) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        lastRef.current = null;
      }
      return;
    }

    const loop = (now: number) => {
      if (lastRef.current !== null) {
        const realDelta = Math.min(now - lastRef.current, MAX_DELTA_MS);
        const simDelta = realDelta * speed;
        advanceSimTime(simDelta);
        const newSimTime = useSimulationStore.getState().simTime;
        onTickRef.current?.(newSimTime);
      }
      lastRef.current = now;
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        lastRef.current = null;
      }
    };
  }, [playing, speed, advanceSimTime]);
}
