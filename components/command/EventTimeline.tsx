'use client';
import { useRef, useEffect } from 'react';
import { useAuditStore } from '@/store/auditStore';
import { formatSeconds } from '@/hooks/useCountdown';

const EVENT_TYPE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: string }
> = {
  TRIP_ACTIVATED: { label: 'Trip Activated', color: '#15803D', bg: '#DCFCE7', icon: '🚨' },
  TASK_SENT: { label: 'Alert Sent', color: '#1D4ED8', bg: '#E0E9FF', icon: '📤' },
  TASK_RECEIVED: { label: 'Alert Received', color: '#0369A1', bg: '#E0F2FE', icon: '📥' },
  TASK_PREPARING: { label: 'Preparing', color: '#B45309', bg: '#FEF3C7', icon: '⏳' },
  TASK_READY: { label: 'Signal Ready', color: '#15803D', bg: '#DCFCE7', icon: '🟢' },
  TASK_UNABLE: { label: 'Unable to Prepare', color: '#B91C1C', bg: '#FEE2E2', icon: '⛔' },
  TASK_CLEARED: { label: 'Junction Cleared', color: '#5B6B80', bg: '#F1F5F9', icon: '✅' },
  ESCALATION_L1: { label: 'L1 Reminder Sent', color: '#B45309', bg: '#FEF3C7', icon: '🔔' },
  ESCALATION_L2: { label: 'L2 Supervisor Alert', color: '#B91C1C', bg: '#FEE2E2', icon: '⚠️' },
  ROADBLOCK_REPORTED: { label: 'Roadblock Reported', color: '#B91C1C', bg: '#FEE2E2', icon: '🚧' },
  REROUTE_PROPOSED: { label: 'Detour Proposed', color: '#B45309', bg: '#FEF3C7', icon: '🔀' },
  REROUTE_APPROVED: { label: 'Detour Approved', color: '#15803D', bg: '#DCFCE7', icon: '✓' },
  DECISION_ACCEPTED: { label: 'Decision Accepted', color: '#0F766E', bg: '#CCFBF1', icon: '💡' },
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
        height: '56px',
        borderTop: '1px solid var(--border)',
        background: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: '12px',
        flexShrink: 0,
        overflow: 'hidden',
        boxShadow: '0 -1px 3px rgba(11, 37, 69, 0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--navy)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Event Audit Trail
        </span>
        <span
          style={{
            fontSize: '10px',
            background: '#EEF3F9',
            border: '1px solid #D6DFEA',
            padding: '1px 6px',
            borderRadius: '4px',
            color: '#0B2545',
            fontWeight: 700,
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
          <div style={{ fontSize: '11px', color: '#94A3B8', fontStyle: 'italic' }}>
            Corridor monitoring active. Waiting for trigger events...
          </div>
        ) : (
          events.map((event) => {
            const config = EVENT_TYPE_CONFIG[event.type] || {
              label: event.type,
              color: '#5B6B80',
              bg: '#EEF3F9',
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
                  border: `1px solid ${config.color}40`,
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  color: '#0F1B2D',
                  whiteSpace: 'nowrap',
                  cursor: 'help',
                  flexShrink: 0,
                  boxShadow: '0 1px 2px rgba(11, 37, 69, 0.05)',
                }}
              >
                <span>{config.icon}</span>
                <span style={{ fontWeight: 700 }}>{config.label}</span>
                {event.junctionId && (
                  <span
                    style={{
                      color: config.color,
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono, monospace)',
                    }}
                  >
                    [{event.junctionId}]
                  </span>
                )}
                <span
                  style={{
                    color: '#64748B',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '10px',
                    fontWeight: 600,
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
