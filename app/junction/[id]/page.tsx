'use client';
import { Suspense, use } from 'react';
import { JUNCTIONS } from '@/lib/data/corridor';
import { getOperatorByJunction } from '@/lib/data/operators';
import { useJunctionStore } from '@/store/junctionStore';
import { useAuditStore } from '@/store/auditStore';
import { useUiStore } from '@/store/uiStore';
import { useBroadcast } from '@/hooks/useBroadcast';
import { EtaRing } from '@/components/junction/EtaRing';
import { TaskCard } from '@/components/junction/TaskCard';
import { ActionButtons } from '@/components/junction/ActionButtons';
import { DecisionSupport } from '@/components/junction/DecisionSupport';
import { Badge } from '@/components/ui/Badge';
import { formatSeconds } from '@/hooks/useCountdown';
import Link from 'next/link';

interface JunctionPageProps {
  params: Promise<{ id: string }>;
}

function JunctionContent({ params }: JunctionPageProps) {
  const { id } = use(params);
  const { broadcast } = useBroadcast();

  const junction = JUNCTIONS.find((j) => j.id.toLowerCase() === id.toLowerCase()) ?? JUNCTIONS[0];
  const operator = getOperatorByJunction(junction.id);

  const { tasks } = useJunctionStore();
  const task = tasks[junction.id];
  const { events } = useAuditStore();
  const { role } = useUiStore();

  const isSupervisor = role === 'Supervisor';
  const eta = task?.etaSeconds ?? 0;
  const isReady = task?.status === 'Ready';
  const isCleared = task?.status === 'Cleared';
  const isEscalated = (task?.escalationLevel ?? 0) > 0 || task?.status === 'Escalated';

  // Last 5 events for this junction
  const junctionEvents = events
    .filter((e) => e.junctionId === junction.id)
    .slice(-5)
    .reverse();

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 92px)',
        background: '#F4F7FB',
        color: 'var(--text)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px 16px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ width: '100%', maxWidth: '460px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Navigation Breadcrumb & Live sync chip */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link
            href="/command"
            style={{
              fontSize: '12px',
              color: '#1D4ED8',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 700,
            }}
          >
            ← Command Centre
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#16A34A' }} />
            <span style={{ fontSize: '11px', color: '#5B6B80', fontFamily: 'var(--font-mono, monospace)', fontWeight: 600 }}>
              BROADCAST SYNC ACTIVE
            </span>
          </div>
        </div>

        {/* Supervisor Alert Banner */}
        {isSupervisor && (
          <div
            style={{
              background: '#FEF3C7',
              border: '1.5px solid #FCD34D',
              borderRadius: '10px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <span style={{ fontSize: '20px' }}>🛡️</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#92400E' }}>
                SUPERVISOR CONTROL OVERRIDE
              </div>
              <div style={{ fontSize: '11px', color: '#78350F' }}>
                Acting on behalf of assigned field officer. Actions logged with supervisor credentials.
              </div>
            </div>
          </div>
        )}

        {/* Escalation Warning Banner */}
        {isEscalated && !isReady && !isCleared && (
          <div
            style={{
              background: '#FEE2E2',
              border: '1.5px solid #FCA5A5',
              borderRadius: '10px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <span style={{ fontSize: '20px' }}>🚨</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#B91C1C' }}>
                LEVEL {task?.escalationLevel ?? 1} ESCALATION ACTIVE
              </div>
              <div style={{ fontSize: '11px', color: '#991B1B' }}>
                Silence threshold exceeded. Control room and supervisor alerted. Immediate action required.
              </div>
            </div>
          </div>
        )}

        {/* Big ETA Countdown Ring */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '12px 16px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <EtaRing seconds={eta} isReady={isReady} isCleared={isCleared} />
        </div>

        {/* Main Task Card */}
        <TaskCard junction={junction} task={task} />

        {/* Decision Support Card (if present) */}
        {task?.decisionSupport && (
          <DecisionSupport
            junctionId={junction.id}
            recommendation={task.decisionSupport}
            operatorName={isSupervisor ? 'SUP-001 (Kavita Mehta)' : (operator?.name ?? 'Officer')}
          />
        )}

        {/* Interactive Action Buttons */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <ActionButtons
            junctionId={junction.id}
            task={task}
            operatorName={isSupervisor ? 'SUP-001 (Kavita Mehta)' : (operator?.name ?? 'Officer')}
          />
        </div>

        {/* Assigned Officer Card */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: '#5B6B80', fontWeight: 600 }}>Assigned Traffic Officer</div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0B2545', marginTop: '2px' }}>
              {operator?.name ?? 'Ravi Kumar'} ({operator?.id ?? 'OP-001'})
            </div>
            <div style={{ fontSize: '11px', color: '#5B6B80' }}>{operator?.phone}</div>
          </div>
          <Badge variant="muted" mono>{operator?.role?.toUpperCase() ?? 'OFFICER'}</Badge>
        </div>

        {/* Recent Junction Event Stream (Last 5 events) */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div
            style={{
              padding: '10px 14px',
              borderBottom: '1px solid var(--border)',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--navy)',
              textTransform: 'uppercase',
              background: '#EEF3F9',
            }}
          >
            Junction Activity Ledger
          </div>
          <div style={{ padding: '8px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {junctionEvents.length === 0 ? (
              <div style={{ fontSize: '11px', color: '#94A3B8', fontStyle: 'italic', padding: '6px 0' }}>
                No events recorded for this junction yet.
              </div>
            ) : (
              junctionEvents.map((ev) => (
                <div
                  key={ev.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#0F766E' }}>●</span>
                    <span style={{ fontWeight: 700, color: '#0B2545' }}>{ev.type}</span>
                    <span style={{ color: '#64748B' }}>by {ev.actor.split(' ')[0]}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono, monospace)', color: '#5B6B80', fontWeight: 600 }}>
                    +{formatSeconds(Math.round(ev.simTimestamp / 1000))}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JunctionPage(props: JunctionPageProps) {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: 'calc(100vh - 92px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#F4F7FB',
            color: '#5B6B80',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          Loading junction console...
        </div>
      }
    >
      <JunctionContent {...props} />
    </Suspense>
  );
}