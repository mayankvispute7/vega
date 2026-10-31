'use client';
import { useRef, useEffect } from 'react';
import { useAuditStore } from '@/store/auditStore';
import { formatSeconds } from '@/hooks/useCountdown';
import type { AuditEventType } from '@/lib/types';

const EVENT_TYPE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: string }
> = {
  TRIP_ACTIVATED: { label: 'Trip Activated', color: 'var(--teal)', bg: 'rgba(45,212,191,0.15)', icon: '🚨' },
  TASK_SENT: { label: 'Task Sent', color: 'var(--info)', bg: 'rgba(96,165,250,0.15)', icon: '📤' },
  TASK_RECEIVED: { label: 'Task Received', color: 'var(--info)', bg: 'rgba(96,165,250,0.15)', icon: '📥' },
  TASK_PREPARING: { label: 'Preparing', color: 'var(--amber)', bg: 'rgba(255,190,92,0.15)', icon: '⏳' },
  TASK_READY: { label: 'Signal Ready', color: 'var(--teal)', bg: 'rgba(45,212,191,0.2)', icon: '🟢' },
  TASK_UNABLE: { label: 'Unable to Prepare', color: 'var(--danger)', bg: 'rgba(248,113,113,0.2)', icon: '⛔' },
  TASK_CLEARED: { label: 'Junction Cleared', color: 'var(--teal)', bg: 'rgba(45,212,191,0.15)', icon: '✅' },
  ESCALATION_L1: { label: 'L1 Escalation', color: 'var(--amber)', bg: 'rgba(255,190,92,0.25)', icon: '⚠️' },
  ESCALATION_L2: { label: 'L2 Escalation', color: 'var(--danger)', bg: 'rgba(248,113,113,0.25)', icon: '🚨' },
  ROADBLOCK_REPORTED: { label: 'Roadblock Reported', color: 'var(--danger)', bg: 'rgba(248,113,113,0.25)', icon: '🚧' },
  REROUTE_PROPOSED: { label: 'Reroute Proposed', color: 'var(--amber)', bg: 'rgba(255,190,92,0.2)', icon: '🔀' },
  REROUTE_APPROVED: { label: 'Reroute Approved', color: 'var(--teal)', bg: 'rgba(45,212,191,0.2)', icon: '✓' },
  DECISION_ACCEPTED: { label: 'Decision Accepted', color: 'var(--teal)', bg: 'rgba(45,212,191,0.15)', icon: '💡' },
};

export function EventTimeline() {
  const { events } = useAuditStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the right on new events
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: scrollContainerRef.current.scrollWidth,
        behavior: 'smooth',
      });
    }
  }, [events.length]);

  return (
    <div
      style={{
        height: '60px',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-panel)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: '12px',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Audit Timeline
        </span>
        <span
          style={{
            fontSize: '10px',
            background: 'rgba(255,255,255,0.08)',
            padding: '1px 6px',
            borderRadius: '4px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono, monospace)',
          }}
        >
          {events.length}
        </span>
      </div>

      <div
        ref={scrollContainerRef}
        style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollbarWidth: 'thin',
          paddingBottom: '2px',
          flex: 1,
        }}
      >
        {events.length === 0 ? (
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontStyle: 'italic' }}>
            Simulation initialized. Waiting for trigger events...
          </div>
        ) : (
          events.map((event) => {
            const config = EVENT_TYPE_CONFIG[event.type] || {
              label: event.type,
              color: 'var(--text-muted)',
              bg: 'var(--bg-raised)',
              icon: '•',
            };
            const timeStr = formatSeconds(Math.round(event.simTimestamp / 1000));

            return (
              <div
                key={event.id}
                title={`${event.type} at ${timeStr} by ${event.actor} ${
                  event.junctionId ? `(${event.junctionId})` : ''
                } — ${JSON.stringify(event.payload ?? {})}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: config.bg,
                  border: `1px solid ${config.color}33`,
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  color: 'var(--text)',
                  whiteSpace: 'nowrap',
                  cursor: 'help',
                  flexShrink: 0,
                  transition: 'transform 100ms',
                }}
              >
                <span>{config.icon}</span>
                <span style={{ fontWeight: 600 }}>{config.label}</span>
                {event.junctionId && (
                  <span
                    style={{
                      color: config.color,
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono, monospace)',
                    }}
                  >
                    [{event.junctionId}]
                  </span>
                )}
                <span
                  style={{
                    color: 'var(--text-dim)',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '10px',
                  }}
                >
                  +{timeStr}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
