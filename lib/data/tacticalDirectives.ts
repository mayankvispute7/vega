// lib/data/tacticalDirectives.ts — Tactical road blocking & green corridor directives per junction (Pune Corridor)
import type { Coords } from '@/lib/types';

export interface CrossRoadBlock {
  id: string;
  name: string;
  fromDirection: string;
  action: 'BLOCK_AND_HOLD_RED' | 'DIVERT_TO_SLIP' | 'HOLD_MERGE';
  directive: string;
  approachLine: Coords[];
  barrierPoint: Coords;
}

export interface JunctionTacticalDirective {
  junctionId: string;
  junctionName: string;
  corridorGreenName: string;
  corridorGreenDirective: string;
  corridorGreenLanes: string;
  greenSegment: Coords[];
  crossRoadBlocks: CrossRoadBlock[];
  pedestrianDirective: string;
  divertLaneTip: string;
  recommendedPrepTimeS: number;
}

export const JUNCTION_TACTICAL_DATA: Record<string, JunctionTacticalDirective> = {
  J1: {
    junctionId: 'J1',
    junctionName: 'Deccan Gymkhana Chowk',
    corridorGreenName: 'Karve Road Westbound Express Carriageway',
    corridorGreenDirective: 'Lock Phase 1 GREEN. Maintain green wave. Hold signal until ambulance crosses stop line.',
    corridorGreenLanes: 'Lanes 1 & 2 (Right & Center Carriageway)',
    greenSegment: [
      [73.8421, 18.5204],
      [73.8392, 18.5172],
      [73.8375, 18.5160], // J1 Chowk
      [73.8330, 18.5135],
    ],
    crossRoadBlocks: [
      {
        id: 'J1-BLOCK-1',
        name: 'FC Road North Approach',
        fromDirection: 'From Fergusson College Rd (North)',
        action: 'BLOCK_AND_HOLD_RED',
        directive: 'HALT ALL TRAFFIC: Hold Phase 2 signal RED. Deploy traffic warden at stop line.',
        approachLine: [
          [73.8395, 18.5205],
          [73.8383, 18.5178],
          [73.8375, 18.5160],
        ],
        barrierPoint: [73.8380, 18.5170],
      },
      {
        id: 'J1-BLOCK-2',
        name: 'Pulachi Wadi / Riverside Road',
        fromDirection: 'From Mutha Riverbed Slip (South)',
        action: 'HOLD_MERGE',
        directive: 'BLOCK MERGE: Halt vehicles attempting to join Karve Road. Barricade left entrance.',
        approachLine: [
          [73.8362, 18.5128],
          [73.8370, 18.5146],
          [73.8375, 18.5160],
        ],
        barrierPoint: [73.8371, 18.5148],
      },
    ],
    pedestrianDirective: 'Terminated pedestrian crossing cycle 45s prior to ETA. Keep zebra clear.',
    divertLaneTip: 'Guide two-wheelers and buses into the left bus-bay lane to keep center corridor empty.',
    recommendedPrepTimeS: 60,
  },

  J2: {
    junctionId: 'J2',
    junctionName: 'Sambhaji Bridge Junction',
    corridorGreenName: 'Karve Road – Lakdi Pul Corridor',
    corridorGreenDirective: 'Hold Phase 1 GREEN. Ensure bridge ramp exit is clear before ambulance arrives.',
    corridorGreenLanes: 'Lanes 1 & 2 (Main Flyover / Bridge approach)',
    greenSegment: [
      [73.8330, 18.5135],
      [73.8305, 18.5120],
      [73.8285, 18.5105], // J2
      [73.8245, 18.5075],
    ],
    crossRoadBlocks: [
      {
        id: 'J2-BLOCK-1',
        name: 'Sambhaji Bridge Ramp (North)',
        fromDirection: 'From Shaniwar Peth / Narayan Peth',
        action: 'BLOCK_AND_HOLD_RED',
        directive: 'STOP RAMP TRAFFIC: Hold North ramp RED. Stop cross-river traffic immediately.',
        approachLine: [
          [73.8308, 18.5152],
          [73.8295, 18.5125],
          [73.8285, 18.5105],
        ],
        barrierPoint: [73.8292, 18.5118],
      },
      {
        id: 'J2-BLOCK-2',
        name: 'Kelkar Road Feeder (South)',
        fromDirection: 'From Sadashiv Peth',
        action: 'BLOCK_AND_HOLD_RED',
        directive: 'HOLD RED: Do not allow right turns onto Karve Road.',
        approachLine: [
          [73.8268, 18.5065],
          [73.8278, 18.5088],
          [73.8285, 18.5105],
        ],
        barrierPoint: [73.8279, 18.5090],
      },
    ],
    pedestrianDirective: 'No active pedestrian phase at this node. Keep bridge sidewalk perimeter secure.',
    divertLaneTip: 'Halt vehicles at bridge exit ramp to avoid tailback into the main intersection.',
    recommendedPrepTimeS: 75,
  },

  J3: {
    junctionId: 'J3',
    junctionName: 'Alka Talkies Chowk',
    corridorGreenName: 'Laxmi Road – Karve Road Junction Arterial',
    corridorGreenDirective: 'Lock Phase 1 GREEN. This is a 5-way intersection — verify all 4 feeder reds are active.',
    corridorGreenLanes: 'Primary Corridor Center Lanes',
    greenSegment: [
      [73.8245, 18.5075],
      [73.8222, 18.5058],
      [73.8200, 18.5040], // J3
      [73.8158, 18.5010],
    ],
    crossRoadBlocks: [
      {
        id: 'J3-BLOCK-1',
        name: 'Shastri Road Approach (East)',
        fromDirection: 'From Navi Peth / Shastri Road',
        action: 'BLOCK_AND_HOLD_RED',
        directive: 'BLOCK SHASTRI ROAD: Hold Phase 3 RED. High auto-rickshaw density, use whistle.',
        approachLine: [
          [73.8245, 18.5018],
          [73.8220, 18.5030],
          [73.8200, 18.5040],
        ],
        barrierPoint: [73.8218, 18.5032],
      },
      {
        id: 'J3-BLOCK-2',
        name: 'Laxmi Road / Kumthekar Rd',
        fromDirection: 'From Laxmi Road Market Area',
        action: 'BLOCK_AND_HOLD_RED',
        directive: 'BLOCK LAXMI RD: Terminate green cycle. Halt city transit buses at stop line.',
        approachLine: [
          [73.8212, 18.5085],
          [73.8205, 18.5060],
          [73.8200, 18.5040],
        ],
        barrierPoint: [73.8206, 18.5058],
      },
    ],
    pedestrianDirective: 'Major pedestrian zone. Activate audio alarm to clear chowk crossing 50s prior.',
    divertLaneTip: 'Direct Shastri Road traffic to take peripheral bypass towards Tilak Road.',
    recommendedPrepTimeS: 60,
  },

  J4: {
    junctionId: 'J4',
    junctionName: 'Nal Stop Junction',
    corridorGreenName: 'Karve Road Flyover Corridor',
    corridorGreenDirective: 'Lock Phase 1 GREEN for flyover underpass carriageway.',
    corridorGreenLanes: 'Lanes 1 & 2 Under Metro Viaduct',
    greenSegment: [
      [73.8180, 18.5025],
      [73.8158, 18.5010],
      [73.8138, 18.4998], // J4
      [73.8098, 18.4972],
    ],
    crossRoadBlocks: [
      {
        id: 'J4-BLOCK-1',
        name: 'Law College Road (North)',
        fromDirection: 'From Film Institute / Law College Rd',
        action: 'BLOCK_AND_HOLD_RED',
        directive: 'HOLD RED ON LAW COLLEGE RD: Stop cross traffic from descending onto Karve Rd.',
        approachLine: [
          [73.8160, 18.5058],
          [73.8148, 18.5025],
          [73.8138, 18.4998],
        ],
        barrierPoint: [73.8146, 18.5020],
      },
      {
        id: 'J4-BLOCK-2',
        name: 'Erandwane Cross Feeder (South)',
        fromDirection: 'From Mehendale Garage Road',
        action: 'BLOCK_AND_HOLD_RED',
        directive: 'BLOCK SOUTH FEEDER: Prevent left-turns onto Karve Road Westbound.',
        approachLine: [
          [73.8118, 18.4945],
          [73.8129, 18.4975],
          [73.8138, 18.4998],
        ],
        barrierPoint: [73.8130, 18.4978],
      },
    ],
    pedestrianDirective: 'Clear pedestrians under Metro pillar 42. Keep U-turn lane blocked.',
    divertLaneTip: 'Keep bus stop queue strictly inside yellow demarcation lines.',
    recommendedPrepTimeS: 50,
  },

  J5: {
    junctionId: 'J5',
    junctionName: 'Karve Road Signal',
    corridorGreenName: 'Karve Nagar Hospital Approach Strip',
    corridorGreenDirective: 'Final approach node: Lock GREEN until ambulance enters Hospital Emergency Bay.',
    corridorGreenLanes: 'All Westbound Lanes to Hospital Gate',
    greenSegment: [
      [73.8118, 18.4985],
      [73.8098, 18.4972],
      [73.8075, 18.4958], // J5
      [73.8030, 18.4928], // Hospital
    ],
    crossRoadBlocks: [
      {
        id: 'J5-BLOCK-1',
        name: 'Paud Road Flyover Slip',
        fromDirection: 'From Paud Phata / Kothrud North',
        action: 'BLOCK_AND_HOLD_RED',
        directive: 'BLOCK KOTHRUD SLIP: Halt vehicles merging from Paud Phata.',
        approachLine: [
          [73.8042, 18.5008],
          [73.8060, 18.4980],
          [73.8075, 18.4958],
        ],
        barrierPoint: [73.8062, 18.4978],
      },
      {
        id: 'J5-BLOCK-2',
        name: 'Mayur Colony Road (South)',
        fromDirection: 'From Mayur Colony Residential Area',
        action: 'BLOCK_AND_HOLD_RED',
        directive: 'BLOCK RESIDENTIAL MERGE: Hold barrier down until ambulance clears.',
        approachLine: [
          [73.8092, 18.4908],
          [73.8082, 18.4936],
          [73.8075, 18.4958],
        ],
        barrierPoint: [73.8081, 18.4938],
      },
    ],
    pedestrianDirective: 'Clear hospital pedestrian walkway. Coordinate with hospital security staff.',
    divertLaneTip: 'Open hospital emergency gate 60s ahead of vehicle arrival.',
    recommendedPrepTimeS: 45,
  },
};
