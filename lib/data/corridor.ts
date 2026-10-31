// lib/data/corridor.ts — Simulated Pune corridor (SIMULATED DATA)
import type { Junction, Coords } from '@/lib/types';

// Full route polyline (primary path) — simulated coordinates inspired by Pune geography
export const ROUTE_POLYLINE: Coords[] = [
  [73.8421, 18.5204], // Origin: Near Deccan Gymkhana
  [73.8408, 18.5189],
  [73.8392, 18.5172],
  [73.8375, 18.5160], // J1: Deccan Gymkhana Chowk
  [73.8355, 18.5148],
  [73.8330, 18.5135],
  [73.8305, 18.5120],
  [73.8285, 18.5105], // J2: Sambhaji Bridge Junction
  [73.8265, 18.5090],
  [73.8245, 18.5075],
  [73.8222, 18.5058],
  [73.8200, 18.5040], // J3: Alka Talkies Chowk
  [73.8180, 18.5025],
  [73.8158, 18.5010],
  [73.8138, 18.4998], // J4: Nal Stop Junction
  [73.8118, 18.4985],
  [73.8098, 18.4972],
  [73.8075, 18.4958], // J5: Karve Road Signal
  [73.8052, 18.4942],
  [73.8030, 18.4928], // Destination: Hospital Karve Nagar
];

// Alternate route polyline (bypasses J3 after roadblock)
export const ALTERNATE_POLYLINE: Coords[] = [
  [73.8285, 18.5105], // from J2
  [73.8270, 18.5088],
  [73.8252, 18.5070],
  [73.8235, 18.5052],
  [73.8215, 18.5035], // detour waypoint
  [73.8195, 18.5018],
  [73.8175, 18.5005],
  [73.8158, 18.4998], // rejoins at J4
];

export const JUNCTIONS: Junction[] = [
  {
    id: 'J1',
    name: 'Deccan Gymkhana Chowk',
    coords: [73.8375, 18.5160],
    operatorId: 'OP-001',
    leadTime: 60,
    queueLength: 12,
    hasPedestrianPhase: true,
    distanceFromOriginM: 520,
  },
  {
    id: 'J2',
    name: 'Sambhaji Bridge Junction',
    coords: [73.8285, 18.5105],
    operatorId: 'OP-002',
    leadTime: 75,
    queueLength: 18,
    hasPedestrianPhase: false,
    distanceFromOriginM: 1280,
  },
  {
    id: 'J3',
    name: 'Alka Talkies Chowk',
    coords: [73.8200, 18.5040],
    operatorId: 'OP-003',
    leadTime: 60,
    queueLength: 8,
    hasPedestrianPhase: true,
    distanceFromOriginM: 2150,
  },
  {
    id: 'J4',
    name: 'Nal Stop Junction',
    coords: [73.8138, 18.4998],
    operatorId: 'OP-004',
    leadTime: 50,
    queueLength: 6,
    hasPedestrianPhase: false,
    distanceFromOriginM: 3100,
  },
  {
    id: 'J5',
    name: 'Karve Road Signal',
    coords: [73.8075, 18.4958],
    operatorId: 'OP-005',
    leadTime: 45,
    queueLength: 4,
    hasPedestrianPhase: true,
    distanceFromOriginM: 4200,
  },
];

export const ORIGIN: Coords = [73.8421, 18.5204];
export const DESTINATION: Coords = [73.8030, 18.4928];
