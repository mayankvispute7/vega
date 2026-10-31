// store/auditStore.ts — append-only audit event log
import { create } from 'zustand';
import type { AuditEvent, AuditEventType } from '@/lib/types';
import { nanoid } from 'nanoid';

function createEvent(
  type: AuditEventType,
  actor: string,
  simTimestamp: number,
  payload: Record<string, unknown>,
  junctionId?: string
): AuditEvent {
  return {
    id: nanoid(8),
    simTimestamp,
    wallTimestamp: Date.now(),
    actor,
    type,
    junctionId,
    payload,
    simulated: true,
  };
}

interface AuditStore {
  events: AuditEvent[];
  addEvent: (
    type: AuditEventType,
    actor: string,
    simTimestamp: number,
    payload?: Record<string, unknown>,
    junctionId?: string
  ) => AuditEvent;
  addRawEvent: (event: AuditEvent) => void;
  addRawEvents: (events: AuditEvent[]) => void;
  reset: () => void;
}

export const useAuditStore = create<AuditStore>((set, get) => ({
  events: [],

  addEvent: (type, actor, simTimestamp, payload = {}, junctionId) => {
    const event = createEvent(type, actor, simTimestamp, payload, junctionId);
    set((s) => ({ events: [...s.events, event] }));
    return event;
  },

  addRawEvent: (event) =>
    set((s) => ({ events: [...s.events, event] })),

  addRawEvents: (newEvents) =>
    set((s) => ({ events: [...s.events, ...newEvents] })),

  reset: () => set({ events: [] }),
}));
