// lib/engine/escalation.ts — Escalation state checks (SIMULATED DATA)
import type { JunctionTask, EscalationLevel } from '@/lib/types';
import { ESCALATION_L1_S, ESCALATION_L2_S } from '@/lib/constants';
import { JUNCTIONS } from '@/lib/data/corridor';

export interface EscalationAction {
  level: EscalationLevel;
  type: 'ESCALATION_L1' | 'ESCALATION_L2' | 'ESCALATION_L3';
  junctionId: string;
  reason: string;
}

/**
 * Pure function: inspects a task's state, timestamps, and ETA to determine if
 * L1 (re-alert), L2 (supervisor notify), or L3 (AtRisk corridor warning) should trigger.
 */
export function checkEscalations(task: JunctionTask, simTimeMs: number): EscalationAction[] {
  const actions: EscalationAction[] = [];
  if (!task.sentAt) return actions;

  // If already reached terminal safe state, no escalations
  if (task.status === 'Ready' || task.status === 'Cleared' || task.status === 'Unable') {
    return actions;
  }

  const elapsedSentSeconds = (simTimeMs - task.sentAt) / 1000;
  const isUnacknowledged = (task.status === 'Sent' || task.status === 'Escalated') && !task.receivedAt;

  // L1 Escalation: No ACK after 20 seconds
  if (isUnacknowledged && elapsedSentSeconds >= ESCALATION_L1_S && (task.escalationLevel ?? 0) < 1) {
    actions.push({
      level: 1,
      type: 'ESCALATION_L1',
      junctionId: task.junctionId,
      reason: `No acknowledgement from operator after ${ESCALATION_L1_S}s`,
    });
  }

  // L2 Escalation: Still no ACK after 40 seconds (supervisor notified)
  if (isUnacknowledged && elapsedSentSeconds >= ESCALATION_L2_S && (task.escalationLevel ?? 0) < 2) {
    actions.push({
      level: 2,
      type: 'ESCALATION_L2',
      junctionId: task.junctionId,
      reason: `Silence persistent after ${ESCALATION_L2_S}s. Alert escalated to corridor supervisor`,
    });
  }

  // L3 Escalation: Task is already escalated and ETA < leadTime, but junction is NOT Ready
  const junction = JUNCTIONS.find((j) => j.id === task.junctionId);
  if (
    junction &&
    task.etaSeconds > 0 &&
    task.etaSeconds < junction.leadTime &&
    (task.escalationLevel ?? 0) >= 2
  ) {
    actions.push({
      level: 3,
      type: 'ESCALATION_L3',
      junctionId: task.junctionId,
      reason: `Vehicle ETA (${Math.round(task.etaSeconds)}s) is below required lead time (${junction.leadTime}s) and signal is not cleared`,
    });
  }

  return actions;
}
