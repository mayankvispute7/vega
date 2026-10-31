// lib/engine/safety.ts — Safety envelope and risk assessment (SIMULATED DATA)
import type { JunctionTask } from '@/lib/types';
import { STALE_DATA_THRESHOLD_S } from '@/lib/constants';
import { JUNCTIONS } from '@/lib/data/corridor';

export type SafetyAssessment = 'Safe' | 'AtRisk' | 'Uncertain';

/**
 * Pure function: assesses corridor safety for a given junction task.
 * - Uncertain: telemetry data is older than STALE_DATA_THRESHOLD_S (30s).
 * - AtRisk: task is Escalated/Unable and vehicle ETA is lower than required clearance lead time.
 * - Safe: vehicle is tracked, lead time envelope respected or signal is green.
 */
export function assessRisk(
  task: JunctionTask,
  simTimeMs: number,
  vehicleLastUpdatedMs: number
): SafetyAssessment {
  // Telemetry staleness check
  const stalenessSeconds = (simTimeMs - vehicleLastUpdatedMs) / 1000;
  if (stalenessSeconds > STALE_DATA_THRESHOLD_S && task.status !== 'Cleared') {
    return 'Uncertain';
  }

  // Already cleared or ready is safe
  if (task.status === 'Ready' || task.status === 'Cleared') {
    return 'Safe';
  }

  // Terminal unable or blocked
  if (task.status === 'Unable' || task.status === 'Blocked') {
    return 'AtRisk';
  }

  // Lead time violation check: Escalated state transitioning to AtRisk
  const junction = JUNCTIONS.find((j) => j.id === task.junctionId);
  if (
    junction &&
    task.etaSeconds > 0 &&
    task.etaSeconds < junction.leadTime &&
    (task.status === 'Escalated' || (task.escalationLevel ?? 0) >= 2)
  ) {
    return 'AtRisk';
  }

  return 'Safe';
}
