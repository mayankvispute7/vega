'use client';
import type { Junction, JunctionTask } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { StatusChip } from '@/components/ui/StatusChip';

interface TaskCardProps {
  junction: Junction;
  task?: JunctionTask;
}

export function TaskCard({ junction, task }: TaskCardProps) {
  const status = task?.status ?? 'Scheduled';

  return (
    <div
      style={{
        background: 'var(--bg-raised)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Badge variant="teal" mono>{junction.id}</Badge>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Corridor Task #{task?.id?.replace('TASK-', '') ?? '001'}
          </span>
        </div>
        <StatusChip status={status} size="md" />
      </div>

      <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', margin: '0 0 4px 0' }}>
        {junction.name}
      </h1>

      <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 14px 0', lineHeight: 1.4 }}>
        Coordinate signal hold for incoming Critical emergency vehicle. Clear intersection before vehicle reaches stop line.
      </p>

      {/* Context Chips Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        <div
          style={{
            background: 'rgba(10, 18, 34, 0.6)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '8px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Queue</div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--amber)', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>
            ~{junction.queueLength} veh
          </div>
        </div>

        <div
          style={{
            background: 'rgba(10, 18, 34, 0.6)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '8px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Lead Req</div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--teal)', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>
            {junction.leadTime}s
          </div>
        </div>

        <div
          style={{
            background: 'rgba(10, 18, 34, 0.6)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '8px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ped Phase</div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: junction.hasPedestrianPhase ? 'var(--amber)' : 'var(--text-dim)',
              marginTop: '4px',
            }}
          >
            {junction.hasPedestrianPhase ? 'Active' : 'None'}
          </div>
        </div>
      </div>
    </div>
  );
}
