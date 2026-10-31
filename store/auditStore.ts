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
    set((s) => {
      if (!event || !event.id) return s;
      if (s.events.some((e) => e.id === event.id)) return s;
      return { events: [...s.events, event] };
    }),

  addRawEvents: (newEvents) =>
    set((s) => {
      if (!newEvents || newEvents.length === 0) return s;
      const existingIds = new Set(s.events.map((e) => e.id));
      const uniqueNew: AuditEvent[] = [];
      for (const ev of newEvents) {
        if (ev && ev.id && !existingIds.has(ev.id)) {
          existingIds.add(ev.id);
          uniqueNew.push(ev);
        }
      }
      if (uniqueNew.length === 0) return s;
      return { events: [...s.events, ...uniqueNew] };
    }),

  reset: () => set({ events: [] }),
}));
