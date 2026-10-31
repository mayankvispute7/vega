// lib/utils/geo.ts — Geographic helpers for polyline interpolation & distance
import type { Coords } from '@/lib/types';

/**
 * Calculates distance in meters between two [lng, lat] coordinates (Haversine formula)
 */
export function getDistanceM(coord1: Coords, coord2: Coords): number {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Computes total length of a polyline in meters
 */
export function getPolylineLengthM(line: Coords[]): number {
  let total = 0;
  for (let i = 0; i < line.length - 1; i++) {
    total += getDistanceM(line[i], line[i + 1]);
  }
  return total;
}

/**
 * Interpolates [lng, lat] along a polyline given a progress ratio between 0 and 1
 */
export function interpolateAlongPolyline(line: Coords[], ratio: number): { coords: Coords; bearing: number } {
  if (line.length === 0) {
    return { coords: [73.8421, 18.5204], bearing: 0 };
  }
  if (line.length === 1 || ratio <= 0) {
    const bearing = line.length > 1 ? getBearing(line[0], line[1]) : 0;
    return { coords: line[0], bearing };
  }
  if (ratio >= 1) {
    const lastIdx = line.length - 1;
    const bearing = getBearing(line[lastIdx - 1], line[lastIdx]);
    return { coords: line[lastIdx], bearing };
  }

  const totalLength = getPolylineLengthM(line);
  const targetDistance = totalLength * ratio;

  let accumulated = 0;
  for (let i = 0; i < line.length - 1; i++) {
    const segDist = getDistanceM(line[i], line[i + 1]);
    if (accumulated + segDist >= targetDistance) {
      const segRatio = segDist === 0 ? 0 : (targetDistance - accumulated) / segDist;
      const lng = line[i][0] + (line[i + 1][0] - line[i][0]) * segRatio;
      const lat = line[i][1] + (line[i + 1][1] - line[i][1]) * segRatio;
      const bearing = getBearing(line[i], line[i + 1]);
      return { coords: [lng, lat], bearing };
    }
    accumulated += segDist;
  }

  const last = line[line.length - 1];
  return { coords: last, bearing: getBearing(line[line.length - 2], last) };
}

/**
 * Calculates bearing in degrees from coord1 to coord2
 */
export function getBearing(start: Coords, end: Coords): number {
  const [lon1, lat1] = start;
  const [lon2, lat2] = end;
  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(((lon2 - lon1) * Math.PI) / 180);
  const theta = Math.atan2(y, x);
  return ((theta * 180) / Math.PI + 360) % 360;
}
