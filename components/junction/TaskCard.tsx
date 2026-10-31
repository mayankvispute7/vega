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
        background: '#FFFFFF',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Badge variant="teal" mono>{junction.id}</Badge>
          <span style={{ fontSize: '11px', color: '#5B6B80', fontWeight: 600 }}>
            Corridor Task #{task?.id?.replace('TASK-', '') ?? '001'}
          </span>
        </div>
        <StatusChip status={status} size="md" />
      </div>

      <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#0B2545', margin: '0 0 4px 0' }}>
        {junction.name}
      </h1>

      <p style={{ fontSize: '13px', color: '#5B6B80', margin: '0 0 14px 0', lineHeight: 1.4 }}>
        Coordinate signal hold for incoming Critical emergency vehicle. Clear intersection before vehicle reaches stop line.
      </p>

      {/* Context Chips Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        <div
          style={{
            background: '#F8FAFC',
            border: '1px solid #D6DFEA',
            borderRadius: '8px',
            padding: '8px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '10px', color: '#5B6B80', textTransform: 'uppercase', fontWeight: 600 }}>Queue</div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#B45309', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>
            ~{junction.queueLength} veh
          </div>
        </div>

        <div
          style={{
            background: '#F8FAFC',
            border: '1px solid #D6DFEA',
            borderRadius: '8px',
            padding: '8px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '10px', color: '#5B6B80', textTransform: 'uppercase', fontWeight: 600 }}>Lead Req</div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F766E', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>
            {junction.leadTime}s
          </div>
        </div>

        <div
          style={{
            background: '#F8FAFC',
            border: '1px solid #D6DFEA',
            borderRadius: '8px',
            padding: '8px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '10px', color: '#5B6B80', textTransform: 'uppercase', fontWeight: 600 }}>Ped Phase</div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: junction.hasPedestrianPhase ? '#B45309' : '#64748B',
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
