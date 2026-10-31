'use client';
import { useTripStore } from '@/store/tripStore';
import { useSimulationStore } from '@/store/simulationStore';
import { useSimClock } from '@/hooks/useSimClock';
import { TripCard } from '@/components/command/TripCard';
import { KpiStrip } from '@/components/command/KpiStrip';
import { JunctionRail } from '@/components/command/JunctionRail';
import { JunctionSlideOver } from '@/components/command/JunctionSlideOver';
import { EventTimeline } from '@/components/command/EventTimeline';
import { SimControls } from '@/components/command/SimControls';
import dynamic from 'next/dynamic';
import { tick } from '@/lib/engine/scheduler';
import { useJunctionStore } from '@/store/junctionStore';
import { useAuditStore } from '@/store/auditStore';
import Link from 'next/link';

const MapCanvas = dynamic(
  () => import('@/components/map/MapCanvas').then((mod) => mod.MapCanvas),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-base)',
          color: 'var(--text-muted)',
          fontSize: '13px',
        }}
      >
        Initializing corridor map...
      </div>
    ),
  }
);

export default function CommandPage() {
  const { trip, vehicle, setVehicle } = useTripStore();
  const { tasks, patchTasks } = useJunctionStore();
  const { events, addRawEvents } = useAuditStore();
  const { playing } = useSimulationStore();

  // Drive simulation clock and advance coordination engine
  useSimClock((simTime) => {
    const durationMs = trip.estimatedDurationS * 1000;
    const ratio = Math.min(1, simTime / durationMs);
    const updatedVehicle = {
      ...vehicle,
      progressRatio: ratio,
      speedKmh: ratio >= 1 ? 0 : 38,
      lastUpdatedAt: simTime,
    };
    setVehicle(updatedVehicle);

    // Run Coordination Engine Tick
    const { updatedTasks, newEvents } = tick(simTime, tasks, updatedVehicle, events);
    patchTasks(updatedTasks);
    if (newEvents.length > 0) {
      addRawEvents(newEvents);
    }
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 52px)',
        overflow: 'hidden',
        background: 'var(--bg-base)',
      }}
    >
      {/* Main 3-column workspace */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Left Panel: Mission Details, KPIs, Actions */}
        <div
          style={{
            width: '270px',
            flexShrink: 0,
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            background: 'var(--bg-panel)',
            zIndex: 10,
          }}
        >
          <TripCard />
          <div style={{ borderTop: '1px solid var(--border)' }} />
          <KpiStrip />
          <div style={{ borderTop: '1px solid var(--border)', flex: 1, padding: '14px' }}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '10px',
              }}
            >
              Corridor Operations
            </div>
            <Link
              href="/activate"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'rgba(248, 113, 113, 0.12)',
                border: '1px solid rgba(248, 113, 113, 0.3)',
                borderRadius: '8px',
                padding: '10px',
                color: 'var(--danger)',
                fontWeight: 600,
                fontSize: '12px',
                textDecoration: 'none',
                marginBottom: '8px',
                transition: 'all 150ms',
              }}
            >
              <span>🚨</span>
              <span>Activate Emergency Trip</span>
            </Link>
            <Link
              href="/exceptions"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'rgba(255, 190, 92, 0.08)',
                border: '1px solid rgba(255, 190, 92, 0.25)',
                borderRadius: '8px',
                padding: '10px',
                color: 'var(--amber)',
                fontWeight: 600,
                fontSize: '12px',
                textDecoration: 'none',
                marginBottom: '8px',
                transition: 'all 150ms',
              }}
            >
              <span>⚠️</span>
              <span>Report Roadblock / Detour</span>
            </Link>
            <Link
              href="/driver"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'rgba(96, 165, 250, 0.08)',
                border: '1px solid rgba(96, 165, 250, 0.25)',
                borderRadius: '8px',
                padding: '8px',
                color: 'var(--info)',
                fontWeight: 600,
                fontSize: '12px',
                textDecoration: 'none',
                transition: 'all 150ms',
              }}
            >
              <span>📱</span>
              <span>Open Driver HUD View</span>
            </Link>
          </div>
        </div>

        {/* Center: Map Canvas & SlideOver */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <MapCanvas />
          <JunctionSlideOver />
        </div>

        {/* Right Panel: Junction Coordination Rail */}
        <div
          style={{
            width: '300px',
            flexShrink: 0,
            borderLeft: '1px solid var(--border)',
            background: 'var(--bg-panel)',
            overflow: 'hidden',
            zIndex: 10,
          }}
        >
          <JunctionRail />
        </div>
      </div>

      {/* Bottom: Event Timeline */}
      <EventTimeline />

      {/* Bottom Bar: Simulation Playback Controls */}
      <SimControls />
    </div>
  );
}
