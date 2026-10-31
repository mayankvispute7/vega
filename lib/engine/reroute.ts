// lib/engine/reroute.ts — Alternate corridor reroute engine (Dijkstra graph search)
import type { RouteSegment, RerouteProposal } from '@/lib/types';
import { DEFAULT_SPEED_KMH } from '@/lib/constants';

export interface RerouteResult {
  path: RouteSegment[];
  deltaDistanceM: number;
  deltaTimeS: number;
  blockedSegmentId: string;
  affectedJunctionIds: {
    cancelled: string[];
    updated: string[];
    added: string[];
  };
}

/**
 * Computes shortest path avoiding blocked segment(s) using Dijkstra algorithm.
 */
export function computeAlternateRoute(
  segments: RouteSegment[],
  blockedSegmentId: string,
  startNode: string = 'origin',
  endNode: string = 'destination'
): RerouteResult | null {
  // Filter out the blocked segment
  const activeSegments = segments.filter((s) => s.id !== blockedSegmentId && !s.blocked);

  // Build adjacency graph: node -> Array<{ to: string, distance: number, segment: RouteSegment }>
  const adj = new Map<string, Array<{ to: string; distance: number; segment: RouteSegment }>>();

  for (const seg of activeSegments) {
    if (!adj.has(seg.from)) adj.set(seg.from, []);
    adj.get(seg.from)!.push({ to: seg.to, distance: seg.distanceM, segment: seg });
  }

  // Dijkstra's algorithm
  const dist = new Map<string, number>();
  const prev = new Map<string, { fromNode: string; segment: RouteSegment }>();
  const visited = new Set<string>();

  dist.set(startNode, 0);

  while (true) {
    let closestNode: string | null = null;
    let shortestDist = Infinity;

    for (const [node, d] of dist.entries()) {
      if (!visited.has(node) && d < shortestDist) {
        shortestDist = d;
        closestNode = node;
      }
    }

    if (closestNode === null || closestNode === endNode) {
      break;
    }

    visited.add(closestNode);

    const neighbors = adj.get(closestNode) || [];
    for (const edge of neighbors) {
      if (visited.has(edge.to)) continue;
      const newDist = shortestDist + edge.distance;
      if (newDist < (dist.get(edge.to) ?? Infinity)) {
        dist.set(edge.to, newDist);
        prev.set(edge.to, { fromNode: closestNode, segment: edge.segment });
      }
    }
  }

  // If destination unreachable
  if (!dist.has(endNode) || dist.get(endNode) === Infinity) {
    return null;
  }

  // Reconstruct path
  const path: RouteSegment[] = [];
  let curr = endNode;
  while (curr !== startNode) {
    const edge = prev.get(curr);
    if (!edge) break;
    path.unshift(edge.segment);
    curr = edge.fromNode;
  }

  // Calculate original vs new distance
  const originalDistance = segments
    .filter((s) => !s.id.includes('ALT'))
    .reduce((sum, s) => sum + s.distanceM, 0);

  const newDistance = path.reduce((sum, s) => sum + s.distanceM, 0);
  const deltaDistanceM = newDistance - originalDistance;

  // Delta time at default corridor speed
  const speedMs = (DEFAULT_SPEED_KMH * 1000) / 3600;
  const deltaTimeS = Math.round(deltaDistanceM / speedMs);

  // Determine affected junctions
  const pathNodes = new Set<string>();
  path.forEach((s) => {
    pathNodes.add(s.from);
    pathNodes.add(s.to);
  });

  const cancelled: string[] = [];
  if (!pathNodes.has('J3')) cancelled.push('J3');

  const updated: string[] = [];
  ['J4', 'J5'].forEach((j) => {
    if (pathNodes.has(j)) updated.push(j);
  });

  return {
    path,
    deltaDistanceM,
    deltaTimeS,
    blockedSegmentId,
    affectedJunctionIds: {
      cancelled,
      updated,
      added: [],
    },
  };
}
