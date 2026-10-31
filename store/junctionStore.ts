// store/junctionStore.ts — per-junction task state
import { create } from 'zustand';
import type { JunctionTask, TaskStatus, DecisionSupportRec } from '@/lib/types';
import { JUNCTIONS } from '@/lib/data/corridor';

function makeInitialTasks(): Record<string, JunctionTask> {
  const tasks: Record<string, JunctionTask> = {};
  JUNCTIONS.forEach((j, idx) => {
    tasks[j.id] = {
      id: `TASK-${j.id}`,
      junctionId: j.id,
      tripId: 'TRIP-001',
      status: 'Scheduled',
      etaSeconds: (j.distanceFromOriginM / (30 * 1000 / 3600)),
      prepareAt: 0,
      escalationLevel: 0,
    };
  });
  return tasks;
}

interface JunctionStore {
  tasks: Record<string, JunctionTask>;
  setTask: (junctionId: string, task: Partial<JunctionTask>) => void;
  setStatus: (junctionId: string, status: TaskStatus, simTime: number) => void;
  setDecisionSupport: (junctionId: string, ds: DecisionSupportRec) => void;
  patchTasks: (patch: Partial<Record<string, JunctionTask>>) => void;
  reset: () => void;
}

export const useJunctionStore = create<JunctionStore>((set) => ({
  tasks: makeInitialTasks(),

  setTask: (junctionId, task) =>
    set((s) => ({
      tasks: {
        ...s.tasks,
        [junctionId]: { ...s.tasks[junctionId], ...task },
      },
    })),

  setStatus: (junctionId, status, simTime) =>
    set((s) => {
      const existing = s.tasks[junctionId];
      const timestamps: Partial<JunctionTask> = {};
      if (status === 'Sent' && !existing.sentAt) timestamps.sentAt = simTime;
      if (status === 'Received' && !existing.receivedAt) timestamps.receivedAt = simTime;
      if (status === 'Preparing' && !existing.preparingAt) timestamps.preparingAt = simTime;
      if (status === 'Ready' && !existing.readyAt) timestamps.readyAt = simTime;
      if (status === 'Unable' && !existing.unableAt) timestamps.unableAt = simTime;
      return {
        tasks: {
          ...s.tasks,
          [junctionId]: { ...existing, status, ...timestamps },
        },
      };
    }),

  setDecisionSupport: (junctionId, ds) =>
    set((s) => ({
      tasks: {
        ...s.tasks,
        [junctionId]: { ...s.tasks[junctionId], decisionSupport: ds },
      },
    })),

  patchTasks: (patch) =>
    set((s) => ({
      tasks: { ...s.tasks, ...patch } as Record<string, JunctionTask>,
    })),

  reset: () => set({ tasks: makeInitialTasks() }),
}));
