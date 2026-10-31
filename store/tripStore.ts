// store/tripStore.ts — trip and vehicle state
import { create } from 'zustand';
import type { Trip, Vehicle, TripPriority } from '@/lib/types';
import { JUNCTIONS, ORIGIN, DESTINATION } from '@/lib/data/corridor';
import { TOTAL_ROUTE_DISTANCE_M } from '@/lib/constants';

const INITIAL_TRIP: Trip = {
  id: 'TRIP-001',
  vehicleId: 'MH-12-AMB-108',
  vehicleLabel: 'MH-12-AMB-108 (simulated)',
  priority: 'Critical',
  origin: ORIGIN,
  originLabel: 'Deccan Gymkhana (simulated)',
  destination: DESTINATION,
  destinationLabel: 'Hospital – Karve Nagar (simulated)',
  status: 'Pending',
  totalRouteDistanceM: TOTAL_ROUTE_DISTANCE_M,
  estimatedDurationS: 600,
  junctionIds: JUNCTIONS.map(j => j.id),
  incidentCode: 'INC-2024-0731',
  dispatcherId: 'CMD-01',
};

const INITIAL_VEHICLE: Vehicle = {
  id: 'MH-12-AMB-108',
  label: 'MH-12-AMB-108 (simulated)',
  currentCoords: ORIGIN,
  speedKmh: 30,
  progressRatio: 0,
  lastUpdatedAt: 0,
};

interface TripStore {
  trip: Trip;
  vehicle: Vehicle;
  setTrip: (t: Partial<Trip>) => void;
  setVehicle: (v: Partial<Vehicle>) => void;
  activateTrip: (simTime: number) => void;
  completeTrip: (simTime: number) => void;
  reset: () => void;
}

export const useTripStore = create<TripStore>((set) => ({
  trip: { ...INITIAL_TRIP },
  vehicle: { ...INITIAL_VEHICLE },
  setTrip: (t) => set((s) => ({ trip: { ...s.trip, ...t } })),
  setVehicle: (v) => set((s) => ({ vehicle: { ...s.vehicle, ...v } })),
  activateTrip: (simTime) =>
    set((s) => ({
      trip: { ...s.trip, status: 'Active', activatedAt: simTime },
    })),
  completeTrip: (simTime) =>
    set((s) => ({
      trip: { ...s.trip, status: 'Completed', completedAt: simTime },
    })),
  reset: () =>
    set({ trip: { ...INITIAL_TRIP }, vehicle: { ...INITIAL_VEHICLE } }),
}));
