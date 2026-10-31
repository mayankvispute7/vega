// lib/constants.ts — VEGA simulation constants (all data SIMULATED)

// Escalation timeouts (simulated seconds from task sent)
export const ESCALATION_L1_S = 20;
export const ESCALATION_L2_S = 40;

// Safety: stale vehicle data threshold
export const STALE_DATA_THRESHOLD_S = 30;

// Simulation tick interval (real ms) — engine runs every tick
export const TICK_INTERVAL_MS = 1000;

// Speed EMA smoothing factor
export const EMA_ALPHA = 0.3;

// Default vehicle speed when no data (km/h)
export const DEFAULT_SPEED_KMH = 30;

// BroadcastChannel name
export const BROADCAST_CHANNEL = 'vega-sync';

// Countdown ring colour thresholds (seconds remaining)
export const RING_AMBER_THRESHOLD_S = 60;
export const RING_RED_THRESHOLD_S = 20;

// Total primary route distance (metres, simulated)
export const TOTAL_ROUTE_DISTANCE_M = 5200;

// Demo story sim timestamps (ms at 1x speed)
export const DEMO_EVENTS = {
  TRIP_ACTIVATED: 0,
  J1_SENT: 10_000,
  J1_RECEIVED: 15_000,
  J1_PREPARING: 18_000,
  J1_READY: 40_000,
  J2_SENT: 60_000,
  ESCALATION_L1: 80_000,
  ESCALATION_L2: 100_000,
  J2_SUPERVISOR_ACK: 110_000,
  J2_READY: 130_000,
  ROADBLOCK: 140_000,
  REROUTE_APPROVED: 155_000,
  J4_SENT: 180_000,
  J4_DS_SHOWN: 185_000,
  J4_DS_ACCEPTED: 195_000,
  J4_READY: 210_000,
  J5_SENT: 220_000,
  J5_READY: 240_000,
  TRIP_COMPLETE: 260_000,
} as const;
