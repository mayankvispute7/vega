// lib/engine/engine.test.ts — Unit tests for the VEGA Coordination Engine
import { describe, it, expect } from 'vitest';
import { computeETA, computePrepareAt } from './eta';
import { checkEscalations } from './escalation';
import { assessRisk } from './safety';
import { computeAlternateRoute } from './reroute';
import { tick } from './scheduler';
import { SEGMENTS } from '@/lib/data/segments';
import type { Vehicle, JunctionTask } from '@/lib/types';
import { ORIGIN } from '@/lib/data/corridor';

describe('ETA Engine', () => {
  const baseVehicle: Vehicle = {
    id: 'MH-12-AMB-108',
    label: 'Ambulance 108',
    currentCoords: ORIGIN,
    speedKmh: 36, // 10 m/s
    progressRatio: 0,
    lastUpdatedAt: 0,
  };

  it('computes ETA at 0% progress', () => {
    // J1 is at 520m. At 10 m/s (36 km/h), ETA should be ~52 seconds.
    const eta = computeETA('J1', baseVehicle);
    expect(eta).toBe(52);
  });

  it('computes ETA at 50% progress', () => {
    // J4 is at 3100m. Total distance is 5200m.
    // At 50% (2600m), remaining distance is 3100 - 2600 = 500m.
    // At 10 m/s, ETA = 50s.
    const vehicleHalfway = { ...baseVehicle, progressRatio: 0.5 };
    const eta = computeETA('J4', vehicleHalfway);
    expect(eta).toBe(50);
  });

  it('returns 0 when vehicle has passed junction', () => {
    // J1 is at 520m. At 20% progress (1040m), vehicle has passed J1.
    const vehiclePassed = { ...baseVehicle, progressRatio: 0.2 };
    const eta = computeETA('J1', vehiclePassed);
    expect(eta).toBe(0);
  });

  it('computes prepareAt timestamp based on lead time', () => {
    // ETA = 100s, LeadTime = 60s. Task should be dispatched in 40s (40,000ms).
    const prepareAt = computePrepareAt(100, 60, 10_000);
    expect(prepareAt).toBe(50_000);
  });
});

describe('Escalation Engine', () => {
  const baseTask: JunctionTask = {
    id: 'TASK-J2',
    junctionId: 'J2',
    tripId: 'TRIP-001',
    status: 'Sent',
    etaSeconds: 80,
    prepareAt: 10_000,
    sentAt: 10_000,
    escalationLevel: 0,
  };

  it('does not trigger escalation before 20s', () => {
    const actions = checkEscalations(baseTask, 25_000); // 15s elapsed
    expect(actions).toHaveLength(0);
  });

  it('triggers L1 escalation at sentAt + 20s', () => {
    const actions = checkEscalations(baseTask, 31_000); // 21s elapsed
    expect(actions).toHaveLength(1);
    expect(actions[0].level).toBe(1);
    expect(actions[0].type).toBe('ESCALATION_L1');
  });

  it('triggers L2 escalation at sentAt + 40s', () => {
    const l1Task: JunctionTask = { ...baseTask, escalationLevel: 1 };
    const actions = checkEscalations(l1Task, 52_000); // 42s elapsed
    expect(actions).toHaveLength(1);
    expect(actions[0].level).toBe(2);
    expect(actions[0].type).toBe('ESCALATION_L2');
  });

  it('does not escalate if already Ready', () => {
    const readyTask: JunctionTask = { ...baseTask, status: 'Ready', readyAt: 25_000 };
    const actions = checkEscalations(readyTask, 60_000);
    expect(actions).toHaveLength(0);
  });
});

describe('Safety Engine', () => {
  const task: JunctionTask = {
    id: 'TASK-J1',
    junctionId: 'J1',
    tripId: 'TRIP-001',
    status: 'Escalated',
    escalationLevel: 2,
    etaSeconds: 40, // Lead time for J1 is 60s -> ETA < leadTime and Escalated!
    prepareAt: 0,
  };

  it('detects AtRisk when ETA is below required lead time and signal is not Ready', () => {
    const risk = assessRisk(task, 10_000, 10_000);
    expect(risk).toBe('AtRisk');
  });

  it('detects Uncertain when vehicle telemetry is stale > 30s', () => {
    const staleRisk = assessRisk(task, 45_000, 10_000); // 35s stale
    expect(staleRisk).toBe('Uncertain');
  });

  it('considers Ready status Safe even with low ETA', () => {
    const safeTask: JunctionTask = { ...task, status: 'Ready', readyAt: 5_000 };
    const risk = assessRisk(safeTask, 10_000, 10_000);
    expect(risk).toBe('Safe');
  });
});

describe('Reroute Engine', () => {
  it('finds alternate path when primary segment J2-J3 is blocked', () => {
    const result = computeAlternateRoute(SEGMENTS, 'SEG-J2-J3');
    expect(result).not.toBeNull();
    expect(result?.affectedJunctionIds.cancelled).toContain('J3');
    expect(result?.affectedJunctionIds.updated).toContain('J4');
    expect(result?.path.some((s) => s.id === 'SEG-J2-J4-ALT')).toBe(true);
  });
});

describe('Scheduler Engine', () => {
  const initialVehicle: Vehicle = {
    id: 'MH-12-AMB-108',
    label: 'Ambulance 108',
    currentCoords: ORIGIN,
    speedKmh: 36,
    progressRatio: 0,
    lastUpdatedAt: 0,
  };

  const initialTasks: Record<string, JunctionTask> = {
    J1: {
      id: 'TASK-J1',
      junctionId: 'J1',
      tripId: 'TRIP-001',
      status: 'Scheduled',
      etaSeconds: 52,
      prepareAt: 0,
      escalationLevel: 0,
    },
  };

  it('dispatches task to Sent when prepareAt is reached', () => {
    const result = tick(1_000, initialTasks, initialVehicle, []);
    expect(result.updatedTasks['J1'].status).toBe('Sent');
    expect(result.newEvents.some((e) => e.type === 'TASK_SENT')).toBe(true);
  });

  it('advances J1 through scripted fast operator behavior', () => {
    let tasks = { ...initialTasks };
    // Dispatch
    tasks = tick(1_000, tasks, { ...initialVehicle, lastUpdatedAt: 1_000 }, []).updatedTasks;

    // Advance 6 seconds -> Received
    tasks = tick(7_000, tasks, { ...initialVehicle, lastUpdatedAt: 7_000 }, []).updatedTasks;
    expect(tasks['J1'].status).toBe('Received');

    // Advance to 10 seconds -> Preparing
    tasks = tick(10_000, tasks, { ...initialVehicle, lastUpdatedAt: 10_000 }, []).updatedTasks;
    expect(tasks['J1'].status).toBe('Preparing');

    // Advance to 32 seconds -> Ready
    tasks = tick(32_000, tasks, { ...initialVehicle, lastUpdatedAt: 32_000 }, []).updatedTasks;
    expect(tasks['J1'].status).toBe('Ready');
  });
});
