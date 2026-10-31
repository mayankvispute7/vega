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

  // Last 6 events for this junction, deduplicated
  const junctionEvents = events
    .filter((e) => e.junctionId === junction.id)
    .slice(-6)
    .reverse();

  return (
    <div
      style={{
        flex: 1,
        background: '#F4F7FB',
        color: 'var(--text)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '14px 20px 28px',
        boxSizing: 'border-box',
        minHeight: '100%',
      }}
    >
      <div style={{ width: '100%', maxWidth: '940px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Navigation Breadcrumb & Live sync chip */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                background: '#FFFFFF',
                border: '1px solid #D6DFEA',
                padding: '6px 12px',
                borderRadius: '6px',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              ← Command Centre
            </Link>
            <span style={{ fontSize: '12px', color: '#64748B' }}>/</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0B2545' }}>
              Field Officer Signal Terminal
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#FFFFFF',
              border: '1px solid #D6DFEA',
              padding: '6px 12px',
              borderRadius: '6px',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} />
            <span style={{ fontSize: '11px', color: '#0F766E', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700 }}>
              BROADCAST SYNC ACTIVE
            </span>
          </div>
        </div>

        {/* Junction Switcher Strip (Quick Switch between J1 - J5) */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #D6DFEA',
            borderRadius: '10px',
            padding: '6px',
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {JUNCTIONS.map((j) => {
            const isSelected = j.id.toLowerCase() === junction.id.toLowerCase();
            const jTask = tasks[j.id];
            const jStatus = jTask?.status ?? 'Scheduled';
            const statusColor =
              jStatus === 'Ready'
                ? '#15803D'
                : jStatus === 'Preparing'
                ? '#B45309'
                : jStatus === 'Unable'
                ? '#B91C1C'
                : '#64748B';

            return (
              <Link
                key={j.id}
                href={`/junction/${j.id}`}
                style={{
                  textDecoration: 'none',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: isSelected ? '#0B2545' : '#F8FAFC',
                  border: isSelected ? '1px solid #0B2545' : '1px solid #E2E8F0',
                  color: isSelected ? '#FFFFFF' : '#334155',
                  fontSize: '12px',
                  fontWeight: isSelected ? 700 : 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all 120ms ease',
                }}
              >
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: statusColor,
                    display: 'inline-block',
                  }}
                />
                <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700 }}>{j.id}</span>
                <span>{j.name.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>

        {/* Supervisor Alert Banner */}
        {isSupervisor && (
          <div
            style={{
              background: '#FEF3C7',
              border: '1.5px solid #FCD34D',
              borderRadius: '10px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <span style={{ fontSize: '22px' }}>🛡️</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#92400E' }}>
                SUPERVISOR CONTROL OVERRIDE ACTIVE
              </div>
              <div style={{ fontSize: '11px', color: '#78350F', marginTop: '2px' }}>
                Acting on behalf of assigned field officer. All actions logged with supervisor audit credentials.
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
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <span style={{ fontSize: '22px' }}>🚨</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#B91C1C' }}>
                LEVEL {task?.escalationLevel ?? 1} ESCALATION IN EFFECT
              </div>
              <div style={{ fontSize: '11px', color: '#991B1B', marginTop: '2px' }}>
                Silence threshold exceeded without signal ready. Control room alert triggered. Urgent field action required.
              </div>
            </div>
          </div>
        )}

        {/* Two-Column Responsive Layout for Desktop & Tablet */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '16px',
            alignItems: 'start',
          }}
        >
          {/* Left Column: ETA Ring, Task Details & Officer Identity */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Big ETA Countdown Ring Card */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '20px 16px',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <EtaRing seconds={eta} isReady={isReady} isCleared={isCleared} />
            </div>

            {/* Main Task Card */}
            <TaskCard junction={junction} task={task} />

            {/* Assigned Officer Card */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: '#5B6B80', fontWeight: 600 }}>Assigned Traffic Officer</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0B2545', marginTop: '2px' }}>
                  {operator?.name ?? 'Ravi Kumar'} ({operator?.id ?? 'OP-001'})
                </div>
                <div style={{ fontSize: '11px', color: '#5B6B80', marginTop: '2px' }}>
                  📞 {operator?.phone ?? '+91 98XXX XXXXX'}
                </div>
              </div>
              <Badge variant="muted" mono>{operator?.role?.toUpperCase() ?? 'OFFICER'}</Badge>
            </div>
          </div>

          {/* Right Column: Actions, Decision Support & Activity Ledger */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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

            {/* Recent Junction Event Stream (Last 6 events) */}
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
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border)',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--navy)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  background: '#EEF3F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>Junction Activity Ledger</span>
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono, monospace)',
                    color: '#5B6B80',
                    fontWeight: 600,
                  }}
                >
                  {junctionEvents.length} Recent Records
                </span>
              </div>
              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {junctionEvents.length === 0 ? (
                  <div style={{ fontSize: '11px', color: '#94A3B8', fontStyle: 'italic', padding: '6px 0' }}>
                    No events recorded for this junction yet.
                  </div>
                ) : (
                  junctionEvents.map((ev, index) => (
                    <div
                      key={`${ev.id}-${index}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '11px',
                        padding: '6px 8px',
                        background: '#F8FAFC',
                        borderRadius: '6px',
                        border: '1px solid #E2E8F0',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
            minHeight: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#F4F7FB',
            color: '#5B6B80',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          Loading junction portal...
        </div>
      }
    >
      <JunctionContent params={props.params} />
    </Suspense>
  );
}