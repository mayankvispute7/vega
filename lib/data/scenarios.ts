// lib/data/scenarios.ts — Benchmark scenario data (SIMULATED — not real-world measurements)
import type { ScenarioData } from '@/lib/types';

// IMPORTANT: All values below are SIMULATED for demonstration purposes.
// These are NOT real-world measurements or validated results.
export const SCENARIOS: ScenarioData[] = [
  {
    name: 'Baseline',
    description:
      'Manual coordination via phone calls. Operators notified after ambulance has already arrived at junction.',
    totalJourneyTimeS: 780,
    junctionMetrics: [
      { junctionId: 'J1', junctionName: 'Deccan Gymkhana Chowk', waitTimeS: 45, ackTimeS: null, unresolvedAlerts: 0 },
      { junctionId: 'J2', junctionName: 'Sambhaji Bridge Junction', waitTimeS: 90, ackTimeS: null, unresolvedAlerts: 1 },
      { junctionId: 'J3', junctionName: 'Alka Talkies Chowk', waitTimeS: 60, ackTimeS: null, unresolvedAlerts: 0 },
      { junctionId: 'J4', junctionName: 'Nal Stop Junction', waitTimeS: 75, ackTimeS: null, unresolvedAlerts: 0 },
      { junctionId: 'J5', junctionName: 'Karve Road Signal', waitTimeS: 30, ackTimeS: null, unresolvedAlerts: 0 },
    ],
  },
  {
    name: 'VEGA-Assisted',
    description:
      'VEGA coordination: operators notified in advance, escalation for non-response, rerouting for roadblocks.',
    totalJourneyTimeS: 540,
    junctionMetrics: [
      { junctionId: 'J1', junctionName: 'Deccan Gymkhana Chowk', waitTimeS: 0, ackTimeS: 5, unresolvedAlerts: 0 },
      { junctionId: 'J2', junctionName: 'Sambhaji Bridge Junction', waitTimeS: 12, ackTimeS: 45, unresolvedAlerts: 0 },
      { junctionId: 'J3', junctionName: 'Alka Talkies Chowk', waitTimeS: 0, ackTimeS: null, unresolvedAlerts: 0 },
      { junctionId: 'J4', junctionName: 'Nal Stop Junction', waitTimeS: 5, ackTimeS: 18, unresolvedAlerts: 0 },
      { junctionId: 'J5', junctionName: 'Karve Road Signal', waitTimeS: 0, ackTimeS: 8, unresolvedAlerts: 0 },
    ],
  },
  {
    name: 'Failure',
    description:
      'System failure mid-trip: operators lose VEGA alerts, fall back to manual. Escalations unresolved.',
    totalJourneyTimeS: 960,
    junctionMetrics: [
      { junctionId: 'J1', junctionName: 'Deccan Gymkhana Chowk', waitTimeS: 0, ackTimeS: 5, unresolvedAlerts: 0 },
      { junctionId: 'J2', junctionName: 'Sambhaji Bridge Junction', waitTimeS: 120, ackTimeS: null, unresolvedAlerts: 2 },
      { junctionId: 'J3', junctionName: 'Alka Talkies Chowk', waitTimeS: 90, ackTimeS: null, unresolvedAlerts: 1 },
      { junctionId: 'J4', junctionName: 'Nal Stop Junction', waitTimeS: 85, ackTimeS: null, unresolvedAlerts: 1 },
      { junctionId: 'J5', junctionName: 'Karve Road Signal', waitTimeS: 40, ackTimeS: null, unresolvedAlerts: 0 },
    ],
  },
];
