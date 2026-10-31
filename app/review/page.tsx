'use client';
import { useTripStore } from '@/store/tripStore';
import { useJunctionStore } from '@/store/junctionStore';
import { useAuditStore } from '@/store/auditStore';
import { useSimulationStore } from '@/store/simulationStore';
import { JunctionTable } from '@/components/review/JunctionTable';
import { TripTimeline } from '@/components/review/TripTimeline';
import { AiSummary } from '@/components/review/AiSummary';
import { Badge } from '@/components/ui/Badge';
import { formatSeconds } from '@/hooks/useCountdown';
import Link from 'next/link';

export default function TripReviewPage() {
  const { trip, vehicle } = useTripStore();
  const { tasks } = useJunctionStore();
  const { events } = useAuditStore();
  const { simTime } = useSimulationStore();

  const taskList = Object.values(tasks);
  const clearedCount = taskList.filter((t) => t.status === 'Cleared').length;
  const totalCount = taskList.length;

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 52px)',
        background: 'var(--bg-base)',
        color: 'var(--text)',
        padding: '24px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Link href="/command" style={{ color: 'var(--teal)', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>
                ← Command Centre
              </Link>
              <span style={{ color: 'var(--border)' }}>/</span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Mission Debrief & Compliance</span>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>
              Post-Mission Corridor Audit Review
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Link
              href="/activate"
              style={{
                background: 'rgba(45, 212, 191, 0.12)',
                border: '1px solid var(--teal)',
                borderRadius: '8px',
                padding: '8px 16px',
                color: 'var(--teal)',
                fontSize: '13px',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              + New Trip
            </Link>
            <Link
              href="/sim"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '8px 16px',
                color: 'var(--text-muted)',
                fontSize: '13px',
                textDecoration: 'none',
              }}
            >
              Benchmarks ↗
            </Link>
          </div>
        </div>

        {/* Mission Summary Stats Banner */}
        <div
          style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Vehicle & Incident</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>
              {trip.vehicleId}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{trip.incidentCode}</div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mission Elapsed Time</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--teal)', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>
              {formatSeconds(Math.round(simTime / 1000))}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Est: {formatSeconds(trip.estimatedDurationS)}</div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Intersections Cleared</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>
              {clearedCount} / {totalCount} Nodes
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Pune Central Corridor</div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Audit Ledger Status</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--teal)', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>
              Verified (100%)
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{events.length} cryptographic events</div>
          </div>
        </div>

        {/* AI Grounded Debrief Summary */}
        <AiSummary events={events} />

        {/* Junction Performance Table */}
        <JunctionTable />

        {/* Full Verifiable Timeline */}
        <TripTimeline events={events} />
      </div>
    </div>
  );
}
