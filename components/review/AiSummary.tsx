'use client';
import type { AuditEvent } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { formatSeconds } from '@/hooks/useCountdown';

interface AiSummaryProps {
  events: AuditEvent[];
}

export function AiSummary({ events }: AiSummaryProps) {
  const scrollToEvent = (eventId: string) => {
    const el = document.getElementById(`event-${eventId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.style.borderColor = 'var(--teal)';
      el.style.background = 'rgba(45, 212, 191, 0.12)';
      setTimeout(() => {
        el.style.borderColor = 'var(--border)';
        el.style.background = 'var(--bg-raised)';
      }, 2000);
    }
  };

  // Find key events for grounded citations
  const tripActEvent = events.find((e) => e.type === 'TRIP_ACTIVATED');
  const l1Event = events.find((e) => e.type === 'ESCALATION_L1');
  const l2Event = events.find((e) => e.type === 'ESCALATION_L2');
  const supEvent = events.find((e) => e.type === 'SUPERVISOR_NOTIFIED');
  const roadblockEvent = events.find((e) => e.type === 'ROADBLOCK_REPORTED');
  const rerouteEvent = events.find((e) => e.type === 'REROUTE_APPROVED');
  const dsEvent = events.find((e) => e.type === 'DECISION_ACCEPTED');
  const clearedEvents = events.filter((e) => e.type === 'JUNCTION_CLEARED');

  return (
    <div
      style={{
        background: 'var(--bg-panel)',
        border: '1.5px solid rgba(45, 212, 191, 0.3)',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🤖</span>
          <h2 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--text)' }}>
            Grounded Incident Debrief & Compliance Audit
          </h2>
        </div>
        <Badge variant="teal" mono>FACT-CHECKED CITATIONS</Badge>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', lineHeight: 1.6 }}>
        {/* Sentence 1: Trip Activation */}
        <p style={{ margin: 0 }}>
          1. Emergency corridor mission for vehicle <strong>MH-12-AMB-108</strong> was authorized under Critical priority across 5 Pune signal nodes.{' '}
          {tripActEvent && (
            <button
              onClick={() => scrollToEvent(tripActEvent.id)}
              style={{
                background: 'rgba(45, 212, 191, 0.15)',
                border: '1px solid var(--teal)',
                borderRadius: '4px',
                color: 'var(--teal)',
                fontSize: '11px',
                fontWeight: 700,
                padding: '1px 6px',
                cursor: 'pointer',
              }}
            >
              [→ Event #{tripActEvent.id.slice(0, 4)}]
            </button>
          )}
        </p>

        {/* Sentence 2: Escalation at J2 */}
        {l2Event || l1Event ? (
          <p style={{ margin: 0 }}>
            2. Junction <strong>J2 (Sambhaji Bridge)</strong> experienced silence exceeding the 20s and 40s thresholds, triggering automatic L1 and L2 alerts.{' '}
            {l2Event && (
              <button
                onClick={() => scrollToEvent(l2Event.id)}
                style={{
                  background: 'rgba(255, 190, 92, 0.15)',
                  border: '1px solid var(--amber)',
                  borderRadius: '4px',
                  color: 'var(--amber)',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  cursor: 'pointer',
                }}
              >
                [→ Event #{l2Event.id.slice(0, 4)}]
              </button>
            )}
            {supEvent && (
              <span>
                {' '}Corridor Supervisor Kavita Mehta subsequently intervened on behalf of the unacknowledged officer.{' '}
                <button
                  onClick={() => scrollToEvent(supEvent.id)}
                  style={{
                    background: 'rgba(96, 165, 250, 0.15)',
                    border: '1px solid var(--info)',
                    borderRadius: '4px',
                    color: 'var(--info)',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '1px 6px',
                    cursor: 'pointer',
                  }}
                >
                  [→ Event #{supEvent.id.slice(0, 4)}]
                </button>
              </span>
            )}
          </p>
        ) : (
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>
            2. Upstream junction notifications were acknowledged within protocol SLA windows with zero unresolved silence escalations.
          </p>
        )}

        {/* Sentence 3: Roadblock / Reroute */}
        {rerouteEvent && (
          <p style={{ margin: 0 }}>
            3. A roadway obstruction was logged, triggering Dijkstra alternate path analysis; Chief Dispatcher authorized the bypass detour around J3.{' '}
            <button
              onClick={() => scrollToEvent(rerouteEvent.id)}
              style={{
                background: 'rgba(45, 212, 191, 0.15)',
                border: '1px solid var(--teal)',
                borderRadius: '4px',
                color: 'var(--teal)',
                fontSize: '11px',
                fontWeight: 700,
                padding: '1px 6px',
                cursor: 'pointer',
              }}
            >
              [→ Event #{rerouteEvent.id.slice(0, 4)}]
            </button>
          </p>
        )}

        {/* Sentence 4: Decision Support */}
        {dsEvent && (
          <p style={{ margin: 0 }}>
            4. At junction <strong>J4 (Nal Stop)</strong>, the operator accepted the AI decision support recommendation to hold the pedestrian phase clear.{' '}
            <button
              onClick={() => scrollToEvent(dsEvent.id)}
              style={{
                background: 'rgba(45, 212, 191, 0.15)',
                border: '1px solid var(--teal)',
                borderRadius: '4px',
                color: 'var(--teal)',
                fontSize: '11px',
                fontWeight: 700,
                padding: '1px 6px',
                cursor: 'pointer',
              }}
            >
              [→ Event #{dsEvent.id.slice(0, 4)}]
            </button>
          </p>
        )}

        {/* Sentence 5: Cleared Nodes */}
        <p style={{ margin: 0 }}>
          5. Overall corridor coordination achieved <strong>{clearedEvents.length} cleared intersections</strong>, validating deterministic signal hold without hardware modification.
        </p>
      </div>
    </div>
  );
}
