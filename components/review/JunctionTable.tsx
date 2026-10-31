'use client';
import { JUNCTIONS } from '@/lib/data/corridor';
import { useJunctionStore } from '@/store/junctionStore';
import { StatusChip } from '@/components/ui/StatusChip';
import { Badge } from '@/components/ui/Badge';
import { formatSeconds } from '@/hooks/useCountdown';

export function JunctionTable() {
  const { tasks } = useJunctionStore();

  return (
    <div
      style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '13px' }}>
        Per-Junction Coordinated Performance Summary
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
        <thead>
          <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            <th style={{ padding: '10px 18px' }}>Node</th>
            <th style={{ padding: '10px 18px' }}>Junction</th>
            <th style={{ padding: '10px 18px' }}>Predicted ETA</th>
            <th style={{ padding: '10px 18px' }}>Ack Time</th>
            <th style={{ padding: '10px 18px' }}>Clearance Time</th>
            <th style={{ padding: '10px 18px' }}>Final Status</th>
          </tr>
        </thead>
        <tbody>
          {JUNCTIONS.map((j) => {
            const task = tasks[j.id];
            const ackDurationS =
              task?.sentAt && task?.receivedAt
                ? Math.round((task.receivedAt - task.sentAt) / 1000)
                : null;
            const clearedTimeStr = task?.clearedAt
              ? `+${formatSeconds(Math.round(task.clearedAt / 1000))}`
              : task?.status === 'Ready'
              ? 'Ready'
              : '—';

            return (
              <tr key={j.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 18px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700 }}>
                  <Badge variant="teal" mono>{j.id}</Badge>
                </td>
                <td style={{ padding: '12px 18px', fontWeight: 600 }}>{j.name}</td>
                <td style={{ padding: '12px 18px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-muted)' }}>
                  {formatSeconds(Math.round(j.distanceFromOriginM / 10))}
                </td>
                <td style={{ padding: '12px 18px', fontFamily: 'var(--font-mono, monospace)' }}>
                  {ackDurationS !== null ? `${ackDurationS}s` : <span style={{ color: 'var(--text-dim)' }}>—</span>}
                </td>
                <td style={{ padding: '12px 18px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--teal)' }}>
                  {clearedTimeStr}
                </td>
                <td style={{ padding: '12px 18px' }}>
                  <StatusChip status={task?.status ?? 'Scheduled'} size="sm" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
