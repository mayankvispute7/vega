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
        minHeight: 'calc(100vh - 52px)',
        background: 'var(--bg-base)',
        color: 'var(--text)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Navigation Breadcrumb & Live sync chip */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link
            href="/command"
            style={{
              fontSize: '12px',
              color: 'var(--teal)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 600,
            }}
          >
            ← Command Centre
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--teal)' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono, monospace)' }}>
              BROADCAST SYNC ACTIVE
            </span>
          </div>
        </div>

        {/* Supervisor Alert Banner */}
        {isSupervisor && (
          <div
            style={{
              background: 'rgba(255, 190, 92, 0.15)',
              border: '1.5px solid var(--amber)',
              borderRadius: '10px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span style={{ fontSize: '20px' }}>🛡️</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--amber)' }}>
                SUPERVISOR CONTROL OVERRIDE
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Acting on behalf of assigned field officer. Actions logged with supervisor credentials.
              </div>
            </div>
          </div>
        )}

        {/* Escalation Warning Banner */}
        {isEscalated && !isReady && !isCleared && (
          <div
            style={{
              background: 'rgba(248, 113, 113, 0.15)',
              border: '1.5px solid var(--danger)',
              borderRadius: '10px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              animation: 'pulse 1.8s infinite',
            }}
          >
            <span style={{ fontSize: '20px' }}>🚨</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--danger)' }}>
                LEVEL {task?.escalationLevel ?? 1} ESCALATION ACTIVE
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Silence threshold exceeded. Control room and supervisor alerted. Immediate action required.
              </div>
            </div>
          </div>
        )}

        {/* Big ETA Countdown Ring */}
        <div
          style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '8px 16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
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
            operatorName={isSupervisor ? 'SUP-001 (Kavita Mehta)' : (operator?.name ?? 'Operator')}
          />
        )}

        {/* Interactive Action Buttons */}
        <div
          style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '16px',
          }}
        >
          <ActionButtons
            junctionId={junction.id}
            task={task}
            operatorName={isSupervisor ? 'SUP-001 (Kavita Mehta)' : (operator?.name ?? 'Operator')}
          />
        </div>

        {/* Assigned Officer Card */}
        <div
          style={{
            background: 'var(--bg-raised)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Assigned Traffic Officer</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginTop: '2px' }}>
              {operator?.name ?? 'Ravi Kumar'} ({operator?.id ?? 'OP-001'})
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{operator?.phone}</div>
          </div>
          <Badge variant="muted" mono>{operator?.role?.toUpperCase() ?? 'OPERATOR'}</Badge>
        </div>

        {/* Recent Junction Event Stream (Last 5 events) */}
        <div
          style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '10px 14px',
              borderBottom: '1px solid var(--border)',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
            }}
          >
            Junction Activity Ledger
          </div>
          <div style={{ padding: '8px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {junctionEvents.length === 0 ? (
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontStyle: 'italic', padding: '6px 0' }}>
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
                    <span style={{ color: 'var(--teal)' }}>●</span>
                    <span style={{ fontWeight: 600 }}>{ev.type}</span>
                    <span style={{ color: 'var(--text-dim)' }}>by {ev.actor.split(' ')[0]}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-muted)' }}>
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
            minHeight: 'calc(100vh - 52px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-base)',
            color: 'var(--text-muted)',
            fontSize: '13px',
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