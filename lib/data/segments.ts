// lib/data/segments.ts — Road segment graph (SIMULATED DATA)
import type { RouteSegment, SegmentGraph } from '@/lib/types';
import { ROUTE_POLYLINE, ALTERNATE_POLYLINE } from './corridor';

export const SEGMENTS: RouteSegment[] = [
  {
    id: 'SEG-O-J1',
    from: 'origin',
    to: 'J1',
    distanceM: 520,
    polyline: ROUTE_POLYLINE.slice(0, 4),
    blocked: false,
  },
  {
    id: 'SEG-J1-J2',
    from: 'J1',
    to: 'J2',
    distanceM: 760,
    polyline: ROUTE_POLYLINE.slice(3, 8),
    blocked: false,
  },
  {
    id: 'SEG-J2-J3',
    from: 'J2',
    to: 'J3',
    distanceM: 870,
    polyline: ROUTE_POLYLINE.slice(7, 12),
    blocked: false,
  },
  {
    id: 'SEG-J3-J4',
    from: 'J3',
    to: 'J4',
    distanceM: 950,
    polyline: ROUTE_POLYLINE.slice(11, 15),
    blocked: false,
  },
  {
    id: 'SEG-J4-J5',
    from: 'J4',
    to: 'J5',
    distanceM: 1100,
    polyline: ROUTE_POLYLINE.slice(14, 18),
    blocked: false,
  },
  {
    id: 'SEG-J5-DEST',
    from: 'J5',
    to: 'destination',
    distanceM: 1000,
    polyline: ROUTE_POLYLINE.slice(17),
    blocked: false,
  },
  // Alternate segment: J2 → J4 (bypasses J3)
  {
    id: 'SEG-J2-J4-ALT',
    from: 'J2',
    to: 'J4',
    distanceM: 1650,
    polyline: ALTERNATE_POLYLINE,
    blocked: false,
    isAlternate: true,
  },
];

export const SEGMENT_GRAPH: SegmentGraph = {
  segments: SEGMENTS,
  primaryPath: ['SEG-O-J1', 'SEG-J1-J2', 'SEG-J2-J3', 'SEG-J3-J4', 'SEG-J4-J5', 'SEG-J5-DEST'],
  alternatePath: ['SEG-O-J1', 'SEG-J1-J2', 'SEG-J2-J4-ALT', 'SEG-J4-J5', 'SEG-J5-DEST'],
};

export function getSegmentById(id: string): RouteSegment | undefined {
  return SEGMENTS.find(s => s.id === id);
}

export function getPrimaryPolyline(): import('@/lib/types').Coords[] {
  return SEGMENT_GRAPH.primaryPath.flatMap(id => {
    const seg = getSegmentById(id);
    return seg ? seg.polyline : [];
  });
}

export function getAlternatePolyline(): import('@/lib/types').Coords[] {
  return (SEGMENT_GRAPH.alternatePath ?? []).flatMap(id => {
    const seg = getSegmentById(id);
    return seg ? seg.polyline : [];
  });
}
