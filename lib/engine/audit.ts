// lib/engine/audit.ts — Audit event generation utilities (SIMULATED DATA)
import type { AuditEvent, AuditEventType } from '@/lib/types';
import { nanoid } from 'nanoid';

/**
 * Creates an immutable audit record for corridor coordination actions.
 */
export function createAuditEvent(
  type: AuditEventType,
  actor: string,
  simTimestamp: number,
  payload: Record<string, unknown> = {},
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
