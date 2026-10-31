// lib/types.ts — VEGA Emergency Mobility Intelligence Platform
// All data represented here is SIMULATED.

export type Coords = [number, number]; // [lng, lat]

// ─── Junction & Operator ─────────────────────────────────────────────────────

export interface Junction {
  id: string;
  name: string;
  coords: Coords;
  operatorId: string;
  leadTime: number;
  queueLength: number;
  hasPedestrianPhase: boolean;
  distanceFromOriginM: number;
}

export type OperatorBehaviour = 'fast' | 'slow' | 'unable' | 'responsive' | 'decision-support';

export interface Operator {
  id: string;
  name: string;
  junctionId: string;
  role: 'operator' | 'supervisor';
  behaviour: OperatorBehaviour;
  phone: string;
}

// ─── Task State Machine ──────────────────────────────────────────────────────

export type TaskStatus =
  | 'Scheduled'
  | 'Sent'
  | 'Received'
  | 'Preparing'
  | 'Ready'
  | 'Escalated'
  | 'Unable'
  | 'AtRisk'
  | 'Cleared'
  | 'Uncertain'
  | 'Blocked';

export type EscalationLevel = 0 | 1 | 2 | 3;

export interface DecisionSupportRec {
  id: string;
  action: string;
  rationale: string;
  outcome: 'Accepted' | 'Modified' | 'Rejected' | null;
  modifiedNote?: string;
}

export interface JunctionTask {
  id: string;
  junctionId: string;
  tripId: string;
  status: TaskStatus;
  sentAt?: number;
  receivedAt?: number;
  preparingAt?: number;
  readyAt?: number;
  unableAt?: number;
  clearedAt?: number;
  etaSeconds: number;
  prepareAt: number;
  escalationLevel: EscalationLevel;
  escalatedAt?: number;
  decisionSupport?: DecisionSupportRec;
  cancelReason?: string;
}

// ─── Audit Log ───────────────────────────────────────────────────────────────

export type AuditEventType =
  | 'TRIP_ACTIVATED'
  | 'TASK_SENT'
  | 'TASK_RECEIVED'
  | 'TASK_PREPARING'
  | 'TASK_READY'
  | 'TASK_UNABLE'
  | 'ESCALATION_L1'
  | 'ESCALATION_L2'
  | 'ESCALATION_L3'
  | 'ROADBLOCK_REPORTED'
  | 'REROUTE_PROPOSED'
  | 'REROUTE_APPROVED'
  | 'REROUTE_REJECTED'
  | 'TASK_UPDATED'
  | 'TASK_CANCELLED'
  | 'TASK_CREATED'
  | 'DECISION_ACCEPTED'
  | 'DECISION_MODIFIED'
  | 'DECISION_REJECTED'
  | 'JUNCTION_CLEARED'
  | 'TRIP_COMPLETED'
  | 'SUPERVISOR_NOTIFIED'
  | 'VEHICLE_POSITION_UPDATED';

export interface AuditEvent {
  id: string;
  simTimestamp: number;
  wallTimestamp: number;
  actor: string;
  type: AuditEventType;
  junctionId?: string;
  payload: Record<string, unknown>;
  simulated: true;
}

// ─── Route & Segments ────────────────────────────────────────────────────────

export interface RouteSegment {
  id: string;
  from: string;
  to: string;
  distanceM: number;
  polyline: Coords[];
  blocked: boolean;
  isAlternate?: boolean;
}

export interface SegmentGraph {
  segments: RouteSegment[];
  primaryPath: string[];
  alternatePath?: string[];
}

// ─── Vehicle & Trip ──────────────────────────────────────────────────────────

export interface Vehicle {
  id: string;
  label: string;
  currentCoords: Coords;
  speedKmh: number;
  progressRatio: number;
  lastUpdatedAt: number;
}

export type TripStatus = 'Pending' | 'Active' | 'Completed' | 'Aborted';
export type TripPriority = 'Critical' | 'High' | 'Medium';

export interface Trip {
  id: string;
  vehicleId: string;
  vehicleLabel: string;
  priority: TripPriority;
  origin: Coords;
  originLabel: string;
  destination: Coords;
  destinationLabel: string;
  status: TripStatus;
  activatedAt?: number;
  completedAt?: number;
  totalRouteDistanceM: number;
  estimatedDurationS: number;
  junctionIds: string[];
  incidentCode?: string;
  dispatcherId?: string;
}

// ─── Broadcast ───────────────────────────────────────────────────────────────

export type BroadcastMessage =
  | { type: 'STATE_PATCH'; payload: Partial<Record<string, JunctionTask>> }
  | { type: 'AUDIT_EVENT'; payload: AuditEvent }
  | { type: 'SIM_CONTROL'; payload: { action: 'play' | 'pause' | 'reset' | 'speed'; speed?: number } }
  | { type: 'REROUTE_PROPOSED'; payload: RerouteProposal }
  | { type: 'REROUTE_APPROVED'; payload: { proposalId: string } }
  | { type: 'REROUTE_REJECTED'; payload: { proposalId: string } };

// ─── Reroute ─────────────────────────────────────────────────────────────────

export interface RerouteProposal {
  id: string;
  blockedSegmentId: string;
  alternatePath: string[];
  deltaDistanceM: number;
  deltaTimeS: number;
  affectedJunctionIds: string[];
  newJunctionIds: string[];
  status: 'Proposed' | 'Approved' | 'Rejected';
  proposedAt: number;
}

// ─── Simulation ──────────────────────────────────────────────────────────────

export type SimSpeed = 1 | 2 | 4 | 8;

export interface SimState {
  simTime: number;
  speed: SimSpeed;
  playing: boolean;
  tripStarted: boolean;
}

// ─── Benchmark ───────────────────────────────────────────────────────────────

export type ScenarioName = 'Baseline' | 'VEGA-Assisted' | 'Failure';

export interface JunctionMetric {
  junctionId: string;
  junctionName: string;
  waitTimeS: number;
  ackTimeS: number | null;
  unresolvedAlerts: number;
}

export interface ScenarioData {
  name: ScenarioName;
  description: string;
  totalJourneyTimeS: number;
  junctionMetrics: JunctionMetric[];
}

// ─── Role ─────────────────────────────────────────────────────────────────────

export type UserRole = 'Dispatcher' | 'Operator' | 'Supervisor';
