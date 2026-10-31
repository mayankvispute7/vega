// lib/engine/eta.ts — Pure ETA computation engine (SIMULATED DATA)
import type { Vehicle, RouteSegment } from '@/lib/types';
import { JUNCTIONS } from '@/lib/data/corridor';
import { DEFAULT_SPEED_KMH, TOTAL_ROUTE_DISTANCE_M } from '@/lib/constants';

/**
 * Computes estimated time of arrival (in seconds) for a junction.
 * Pure function: takes vehicle progress & speed, calculates remaining seconds to junction.
 */
export function computeETA(
  junctionId: string,
  vehicle: Vehicle,
  segments?: RouteSegment[]
): number {
  const junction = JUNCTIONS.find((j) => j.id === junctionId);
  if (!junction) return 0;

  // Vehicle distance along route in meters
  const currentVehicleDistanceM = vehicle.progressRatio * TOTAL_ROUTE_DISTANCE_M;

  // Remaining distance to this junction
  const remainingDistanceM = junction.distanceFromOriginM - currentVehicleDistanceM;

  // If vehicle has already passed this junction
  if (remainingDistanceM <= 0) {
    return 0;
  }

  // Speed in m/s (use smoothed speed or default 30 km/h)
  const speedKmh = vehicle.speedKmh && vehicle.speedKmh > 5 ? vehicle.speedKmh : DEFAULT_SPEED_KMH;
  const speedMs = (speedKmh * 1000) / 3600;

  return Math.round(remainingDistanceM / speedMs);
}

/**
 * Computes when a task should be dispatched to the operator (prepare_at timestamp).
 * Task must be dispatched so operator has leadTime seconds before vehicle arrives:
 * prepareAt = arrivalTime - leadTime
 */
export function computePrepareAt(
  etaSeconds: number,
  leadTimeSeconds: number,
  currentSimTimeMs: number
): number {
  const secondsUntilPrepare = Math.max(0, etaSeconds - leadTimeSeconds);
  return currentSimTimeMs + secondsUntilPrepare * 1000;
}
