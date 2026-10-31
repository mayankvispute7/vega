// lib/engine/scheduler.ts — Core VEGA Coordination Engine (SIMULATED DATA)
import type { JunctionTask, Vehicle, AuditEvent, TaskStatus } from '@/lib/types';
import { JUNCTIONS } from '@/lib/data/corridor';
import { computeETA, computePrepareAt } from './eta';
import { checkEscalations } from './escalation';
import { assessRisk } from './safety';
import { createAuditEvent } from './audit';
import { TOTAL_ROUTE_DISTANCE_M } from '@/lib/constants';

export interface SchedulerTickResult {
  updatedTasks: Record<string, JunctionTask>;
  newEvents: AuditEvent[];
}

/**
 * Main engine tick: advances ETA calculations, task dispatching,
 * scripted operator state transitions, escalations, and audit logging.
 */
export function tick(
  simTimeMs: number,
  currentTasks: Record<string, JunctionTask>,
  vehicle: Vehicle,
  existingEvents: AuditEvent[]
): SchedulerTickResult {
  const updatedTasks: Record<string, JunctionTask> = { ...currentTasks };
  const newEvents: AuditEvent[] = [];

  const vehicleDistM = vehicle.progressRatio * TOTAL_ROUTE_DISTANCE_M;

  // Process each junction
  JUNCTIONS.forEach((junction) => {
    let task = updatedTasks[junction.id];
    if (!task) return;

    // 1. Recalculate ETA
    const eta = computeETA(junction.id, vehicle);
    const prepareAt = computePrepareAt(eta, junction.leadTime, simTimeMs);

    // If vehicle has passed junction and it was Ready or Preparing, mark Cleared
    if (vehicleDistM >= junction.distanceFromOriginM && (task.status === 'Ready' || task.status === 'Preparing')) {
      task = {
        ...task,
        status: 'Cleared',
        clearedAt: simTimeMs,
        etaSeconds: 0,
      };
      newEvents.push(
        createAuditEvent('JUNCTION_CLEARED', 'VEGA Engine', simTimeMs, {
          junctionId: junction.id,
          clearedAt: simTimeMs,
        }, junction.id)
      );
    } else {
      task = { ...task, etaSeconds: eta, prepareAt };
    }

    // 2. Dispatch task: Scheduled -> Sent when simTimeMs >= prepareAt or eta <= leadTime + 30
    if (task.status === 'Scheduled' && (simTimeMs >= task.prepareAt || eta <= junction.leadTime + 30)) {
      task = {
        ...task,
        status: 'Sent',
        sentAt: simTimeMs,
      };

      // If junction is J4, inject decision support recommendation
      if (junction.id === 'J4') {
        task.decisionSupport = {
          id: 'DS-J4-01',
          action: 'Hold pedestrian crossing phase green for corridor approach',
          rationale: 'Active pedestrian phase has 6 queued pedestrians; holding clear will eliminate 25s signal cycle delay',
          outcome: null,
        };
      }

      newEvents.push(
        createAuditEvent('TASK_SENT', 'VEGA Dispatcher', simTimeMs, {
          junctionId: junction.id,
          etaSeconds: eta,
          leadTime: junction.leadTime,
        }, junction.id)
      );
    }

    // 3. Scripted Operator Behaviors & State Transitions
    if (task.sentAt) {
      const elapsedSent = (simTimeMs - task.sentAt) / 1000;

      // J1: Fast operator (Ravi Kumar)
      if (junction.id === 'J1') {
        if (task.status === 'Sent' && elapsedSent >= 5) {
          task = { ...task, status: 'Received', receivedAt: simTimeMs };
          newEvents.push(createAuditEvent('TASK_RECEIVED', 'OP-001 (Ravi Kumar)', simTimeMs, {}, 'J1'));
        } else if (task.status === 'Received' && elapsedSent >= 8) {
          task = { ...task, status: 'Preparing', preparingAt: simTimeMs };
          newEvents.push(createAuditEvent('TASK_PREPARING', 'OP-001 (Ravi Kumar)', simTimeMs, {}, 'J1'));
        } else if (task.status === 'Preparing' && elapsedSent >= 28) {
          task = { ...task, status: 'Ready', readyAt: simTimeMs };
          newEvents.push(createAuditEvent('TASK_READY', 'OP-001 (Ravi Kumar)', simTimeMs, { corridorClear: true }, 'J1'));
        }
      }

      // J2: Slow operator (Suresh Patil) -> Escalates L1 at 20s, L2 at 40s -> Supervisor Kavita Mehta intervenes at 45s
      else if (junction.id === 'J2') {
        if (task.status === 'Sent' || task.status === 'Escalated') {
          if (elapsedSent >= 45 && !task.receivedAt) {
            task = {
              ...task,
              status: 'Received',
              receivedAt: simTimeMs,
              escalationLevel: 2,
            };
            newEvents.push(
              createAuditEvent('SUPERVISOR_NOTIFIED', 'SUP-001 (Kavita Mehta)', simTimeMs, {
                intervenedOnBehalf: 'OP-002 (Suresh Patil)',
                note: 'Supervisor override acknowledged via secondary radio link',
              }, 'J2')
            );
            newEvents.push(createAuditEvent('TASK_RECEIVED', 'SUP-001 (Kavita Mehta)', simTimeMs, {}, 'J2'));
          }
        } else if (task.status === 'Received' && elapsedSent >= 50) {
          task = { ...task, status: 'Preparing', preparingAt: simTimeMs };
          newEvents.push(createAuditEvent('TASK_PREPARING', 'SUP-001 (Kavita Mehta)', simTimeMs, {}, 'J2'));
        } else if (task.status === 'Preparing' && elapsedSent >= 68) {
          task = { ...task, status: 'Ready', readyAt: simTimeMs };
          newEvents.push(createAuditEvent('TASK_READY', 'SUP-001 (Kavita Mehta)', simTimeMs, { corridorClear: true }, 'J2'));
        }
      }

      // J3: Standard / Roadblock candidate (Anita Deshmukh)
      else if (junction.id === 'J3' && task.status !== 'Blocked') {
        if (task.status === 'Sent' && elapsedSent >= 6) {
          task = { ...task, status: 'Received', receivedAt: simTimeMs };
          newEvents.push(createAuditEvent('TASK_RECEIVED', 'OP-003 (Anita Deshmukh)', simTimeMs, {}, 'J3'));
        } else if (task.status === 'Received' && elapsedSent >= 10) {
          task = { ...task, status: 'Preparing', preparingAt: simTimeMs };
          newEvents.push(createAuditEvent('TASK_PREPARING', 'OP-003 (Anita Deshmukh)', simTimeMs, {}, 'J3'));
        } else if (task.status === 'Preparing' && elapsedSent >= 30) {
          task = { ...task, status: 'Ready', readyAt: simTimeMs };
          newEvents.push(createAuditEvent('TASK_READY', 'OP-003 (Anita Deshmukh)', simTimeMs, {}, 'J3'));
        }
      }

      // J4: Decision support operator (Priya Joshi)
      else if (junction.id === 'J4') {
        if (task.status === 'Sent' && elapsedSent >= 4) {
          task = { ...task, status: 'Received', receivedAt: simTimeMs };
          newEvents.push(createAuditEvent('TASK_RECEIVED', 'OP-004 (Priya Joshi)', simTimeMs, {}, 'J4'));
        } else if (task.status === 'Received' && elapsedSent >= 8) {
          task = {
            ...task,
            status: 'Preparing',
            preparingAt: simTimeMs,
            decisionSupport: task.decisionSupport
              ? { ...task.decisionSupport, outcome: 'Accepted' }
              : undefined,
          };
          newEvents.push(createAuditEvent('DECISION_ACCEPTED', 'OP-004 (Priya Joshi)', simTimeMs, {
            recommendationId: 'DS-J4-01',
            action: 'Pedestrian phase paused until ambulance clearance',
          }, 'J4'));
          newEvents.push(createAuditEvent('TASK_PREPARING', 'OP-004 (Priya Joshi)', simTimeMs, {}, 'J4'));
        } else if (task.status === 'Preparing' && elapsedSent >= 26) {
          task = { ...task, status: 'Ready', readyAt: simTimeMs };
          newEvents.push(createAuditEvent('TASK_READY', 'OP-004 (Priya Joshi)', simTimeMs, {}, 'J4'));
        }
      }

      // J5: Fast operator (Mohan Shinde)
      else if (junction.id === 'J5') {
        if (task.status === 'Sent' && elapsedSent >= 4) {
          task = { ...task, status: 'Received', receivedAt: simTimeMs };
          newEvents.push(createAuditEvent('TASK_RECEIVED', 'OP-005 (Mohan Shinde)', simTimeMs, {}, 'J5'));
        } else if (task.status === 'Received' && elapsedSent >= 7) {
          task = { ...task, status: 'Preparing', preparingAt: simTimeMs };
          newEvents.push(createAuditEvent('TASK_PREPARING', 'OP-005 (Mohan Shinde)', simTimeMs, {}, 'J5'));
        } else if (task.status === 'Preparing' && elapsedSent >= 22) {
          task = { ...task, status: 'Ready', readyAt: simTimeMs };
          newEvents.push(createAuditEvent('TASK_READY', 'OP-005 (Mohan Shinde)', simTimeMs, {}, 'J5'));
        }
      }
    }

    // 4. Check escalations for unacknowledged or delayed tasks
    const escalations = checkEscalations(task, simTimeMs);
    for (const esc of escalations) {
      task = {
        ...task,
        status: esc.level === 3 ? 'AtRisk' : 'Escalated',
        escalationLevel: esc.level,
      };
      newEvents.push(
        createAuditEvent(esc.type, 'VEGA Escalation Engine', simTimeMs, {
          junctionId: junction.id,
          level: esc.level,
          reason: esc.reason,
        }, junction.id)
      );
    }

    // 5. Safety envelope check (Stale telemetry / At Risk)
    const risk = assessRisk(task, simTimeMs, vehicle.lastUpdatedAt);
    if (risk === 'Uncertain' && task.status !== 'Uncertain') {
      task = { ...task, status: 'Uncertain' };
    } else if (risk === 'AtRisk' && task.status !== 'AtRisk' && task.status !== 'Ready' && task.status !== 'Cleared') {
      task = { ...task, status: 'AtRisk' };
    }

    updatedTasks[junction.id] = task;
  });

  return { updatedTasks, newEvents };
}
