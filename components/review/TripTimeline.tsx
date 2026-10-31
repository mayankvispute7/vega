'use client';
import type { AuditEvent } from '@/lib/types';
import { formatSeconds } from '@/hooks/useCountdown';

interface TripTimelineProps {
  events: AuditEvent[];
}

export function TripTimeline({ events }: TripTimelineProps) {
  return (
    <div
      style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
        <span>Full Verifiable Mission Audit Timeline</span>
        <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono, monospace)' }}>
          {events.length} Events Logged
        </span>
      </div>

      <div style={{ maxHeight: '450px', overflowY: 'auto', padding: '12px 18px' }}>
        {events.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No audit events captured for this trip.
          </div>
        ) : (
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Vertical connector line */}
            <div
              style={{
                position: 'absolute',
                top: '12px',
                bottom: '12px',
                left: '20px',
                width: '2px',
                background: 'rgba(255, 255, 255, 0.08)',
                zIndex: 0,
              }}
            />

            {events.map((ev, idx) => {
              const isAlert = ev.type.includes('ESCALATION') || ev.type.includes('ROADBLOCK');
              const isReady = ev.type === 'TASK_READY' || ev.type === 'JUNCTION_CLEARED' || ev.type === 'REROUTE_APPROVED';

              const dotColor = isReady ? 'var(--teal)' : isAlert ? 'var(--danger)' : 'var(--info)';

              return (
                <div
                  key={ev.id}
                  id={`event-${ev.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    position: 'relative',
                    zIndex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-raised)',
                    border: '1px solid var(--border)',
                    transition: 'background 300ms, border-color 300ms',
                  }}
                >
                  {/* Indicator Dot */}
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: 'var(--bg-base)',
                      border: `2px solid ${dotColor}`,
                      flexShrink: 0,
                      marginTop: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '8px',
                    }}
                  />

                  {/* Event Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: dotColor }}>
                          {ev.type}
                        </span>
                        {ev.junctionId && (
                          <span
                            style={{
                              fontSize: '10px',
                              background: 'rgba(255,255,255,0.08)',
                              padding: '1px 5px',
                              borderRadius: '4px',
                              color: 'var(--text-muted)',
                              fontFamily: 'var(--font-mono, monospace)',
                            }}
                          >
                            {ev.junctionId}
                          </span>
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          color: 'var(--text-dim)',
                          fontFamily: 'var(--font-mono, monospace)',
                        }}
                      >
                        +{formatSeconds(Math.round(ev.simTimestamp / 1000))} (Event #{idx + 1})
                      </span>
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Actor: <strong style={{ color: 'var(--text)' }}>{ev.actor}</strong>
                    </div>

                    {Object.keys(ev.payload || {}).length > 0 && (
                      <div
                        style={{
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono, monospace)',
                          color: 'var(--text-dim)',
                          background: 'rgba(0,0,0,0.3)',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          overflowX: 'auto',
                        }}
                      >
                        {JSON.stringify(ev.payload)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
