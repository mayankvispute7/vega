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
          background: '#F4F7FB',
          color: '#5B6B80',
          fontSize: '13px',
          fontWeight: 600,
        }}
      >
        Initializing corridor basemap...
      </div>
    ),
  }
);

export default function CommandPage() {
  const { trip, vehicle, setVehicle } = useTripStore();
  const { tasks, patchTasks } = useJunctionStore();
  const { events, addRawEvents } = useAuditStore();

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
        height: 'calc(100vh - 92px)',
        overflow: 'hidden',
        background: '#F4F7FB',
      }}
    >
      {/* Breadcrumb sub-header */}
      <div
        style={{
          height: '32px',
          background: '#FFFFFF',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          fontSize: '11px',
          color: '#5B6B80',
          gap: '6px',
          flexShrink: 0,
        }}
      >
        <span style={{ fontWeight: 600, color: 'var(--navy)' }}>Control Room</span>
        <span>›</span>
        <span>Command Centre</span>
        <span>›</span>
        <span style={{ color: '#0F766E', fontWeight: 700 }}>
          Corridor MH-12 (Deccan Gymkhana → Hospital – Karve Nagar)
        </span>
      </div>

      {/* Main 3-column workspace */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Left Panel: Mission Details, KPIs, Operations */}
        <div
          style={{
            width: '280px',
            flexShrink: 0,
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            background: '#FFFFFF',
            zIndex: 10,
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <TripCard />
          <div style={{ borderTop: '1px solid var(--border)' }} />
          <KpiStrip />
          <div style={{ borderTop: '1px solid var(--border)', flex: 1, padding: '14px' }}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--navy)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
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
                background: '#FEE2E2',
                border: '1px solid #FECACA',
                borderRadius: '8px',
                padding: '9px 12px',
                color: '#B91C1C',
                fontWeight: 700,
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
                background: '#FEF3C7',
                border: '1px solid #FDE68A',
                borderRadius: '8px',
                padding: '9px 12px',
                color: '#B45309',
                fontWeight: 700,
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
                background: '#E0E9FF',
                border: '1px solid #BFDBFE',
                borderRadius: '8px',
                padding: '9px 12px',
                color: '#1D4ED8',
                fontWeight: 700,
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
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#F4F7FB' }}>
          <MapCanvas />
          <JunctionSlideOver />
        </div>

        {/* Right Panel: Junction Coordination Rail */}
        <div
          style={{
            width: '310px',
            flexShrink: 0,
            borderLeft: '1px solid var(--border)',
            background: '#FFFFFF',
            overflow: 'hidden',
            zIndex: 10,
            boxShadow: 'var(--shadow-card)',
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
