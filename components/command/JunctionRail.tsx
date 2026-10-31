'use client';
import { Badge } from '@/components/ui/Badge';
import { StatusChip } from '@/components/ui/StatusChip';
import { CountdownRing } from '@/components/ui/CountdownRing';
import { useJunctionStore } from '@/store/junctionStore';
import { useUiStore } from '@/store/uiStore';
import { JUNCTIONS } from '@/lib/data/corridor';
import { getOperatorByJunction } from '@/lib/data/operators';
import { formatSeconds } from '@/hooks/useCountdown';
import Link from 'next/link';

export function JunctionRail() {
  const { tasks } = useJunctionStore();
  const { selectedJunctionId, selectJunction } = useUiStore();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '12px',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '4px',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--navy)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Junction Readiness Stepper
        </div>
        <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono, monospace)', fontWeight: 600 }}>
          {JUNCTIONS.length} Nodes
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
        {JUNCTIONS.map((j, idx) => {
          const task = tasks[j.id];
          const op = getOperatorByJunction(j.id);
          const eta = task?.etaSeconds ?? 0;
          const isSelected = selectedJunctionId === j.id;

          const isAlert = task?.status === 'Escalated' || task?.status === 'AtRisk';
          const isDanger = task?.status === 'Unable' || task?.status === 'Blocked';

          return (
            <div
              key={j.id}
              onClick={() => selectJunction(j.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && selectJunction(j.id)}
              aria-label={`Junction ${j.name} — ${task?.status ?? 'Scheduled'}`}
              style={{
                background: isSelected ? '#EFF6FF' : '#FFFFFF',
                border: `1.5px solid ${
                  isSelected
                    ? '#1D4ED8'
                    : isAlert
                    ? '#FCD34D'
                    : isDanger
                    ? '#FCA5A5'
                    : '#D6DFEA'
                }`,
                borderRadius: '10px',
                padding: '10px 12px',
                cursor: 'pointer',
                transition: 'border-color 150ms, background 150ms',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: isSelected ? '0 2px 8px rgba(29, 78, 216, 0.15)' : 'var(--shadow-card)',
              }}
            >
              {/* Mini Countdown or Node Number */}
              {eta > 0 && eta <= 120 ? (
                <div style={{ flexShrink: 0 }}>
                  <CountdownRing seconds={Math.round(eta)} maxSeconds={120} size={34} strokeWidth={3} />
                </div>
              ) : (
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background:
                      task?.status === 'Ready' || task?.status === 'Cleared'
                        ? '#DCFCE7'
                        : isAlert
                        ? '#FEF3C7'
                        : isDanger
                        ? '#FEE2E2'
                        : '#EEF3F9',
                    border: `1.5px solid ${
                      task?.status === 'Ready' || task?.status === 'Cleared'
                        ? '#15803D'
                        : isAlert
                        ? '#B45309'
                        : isDanger
                        ? '#B91C1C'
                        : '#CBD5E1'
                    }`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#0B2545',
                    fontFamily: 'var(--font-mono, monospace)',
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </div>
              )}

              {/* Junction & Operator details */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#0B2545',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {j.name}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                  {op?.name ?? 'Officer'} · Lead {j.leadTime}s
                </div>
              </div>

              {/* Status & Alerts */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                <StatusChip status={task?.status ?? 'Scheduled'} size="sm" />
                {task?.escalationLevel && task.escalationLevel > 0 ? (
                  <Badge variant="amber" mono>
                    L{task.escalationLevel}
                  </Badge>
                ) : eta > 0 ? (
                  <span
                    style={{
                      fontSize: '10px',
                      color: 'var(--muted)',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontWeight: 600,
                    }}
                  >
                    ETA {formatSeconds(eta)}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
        <Link
          href={`/junction/${selectedJunctionId ?? 'J2'}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            background: '#E0E9FF',
            border: '1px solid #BFDBFE',
            borderRadius: '8px',
            padding: '8px 12px',
            color: '#1D4ED8',
            fontSize: '11px',
            fontWeight: 700,
            textDecoration: 'none',
            textAlign: 'center',
            transition: 'background 150ms',
          }}
        >
          <span>↗ Open Console for {selectedJunctionId ?? 'J2'} (new tab)</span>
        </Link>
      </div>
    </div>
  );
}
