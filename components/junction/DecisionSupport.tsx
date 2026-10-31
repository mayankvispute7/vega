'use client';
import { useState } from 'react';
import type { DecisionSupportRec } from '@/lib/types';
import { useJunctionStore } from '@/store/junctionStore';
import { useAuditStore } from '@/store/auditStore';
import { useSimulationStore } from '@/store/simulationStore';
import { useBroadcast } from '@/hooks/useBroadcast';
import { createAuditEvent } from '@/lib/engine/audit';
import { Badge } from '@/components/ui/Badge';

interface DecisionSupportProps {
  junctionId: string;
  recommendation: DecisionSupportRec;
  operatorName: string;
}

export function DecisionSupport({ junctionId, recommendation, operatorName }: DecisionSupportProps) {
  const { setDecisionSupport } = useJunctionStore();
  const { addRawEvent } = useAuditStore();
  const { simTime } = useSimulationStore();
  const { broadcast } = useBroadcast();

  const [isEditing, setIsEditing] = useState(false);
  const [modifiedNote, setModifiedNote] = useState('');

  const handleOutcome = (outcome: 'Accepted' | 'Modified' | 'Rejected', note?: string) => {
    const updated: DecisionSupportRec = {
      ...recommendation,
      outcome,
      modifiedNote: note,
    };

    setDecisionSupport(junctionId, updated);

    const eventType =
      outcome === 'Accepted'
        ? 'DECISION_ACCEPTED'
        : outcome === 'Modified'
        ? 'DECISION_MODIFIED'
        : 'DECISION_REJECTED';

    const event = createAuditEvent(
      eventType as any,
      operatorName,
      simTime,
      {
        recommendationId: recommendation.id,
        action: recommendation.action,
        outcome,
        note,
      },
      junctionId
    );

    addRawEvent(event);

    broadcast({
      type: 'AUDIT_EVENT',
      payload: event,
    });

    setIsEditing(false);
  };

  return (
    <div
      style={{
        background: 'rgba(255, 190, 92, 0.08)',
        border: '1px solid rgba(255, 190, 92, 0.3)',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '14px' }}>💡</span>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--amber)', letterSpacing: '0.06em' }}>
            DECISION SUPPORT RECOMMENDATION
          </span>
        </div>
        {recommendation.outcome && (
          <Badge
            variant={
              recommendation.outcome === 'Accepted'
                ? 'teal'
                : recommendation.outcome === 'Modified'
                ? 'amber'
                : 'danger'
            }
          >
            {recommendation.outcome}
          </Badge>
        )}
      </div>

      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px', lineHeight: 1.4 }}>
        {recommendation.action}
      </div>

      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.4 }}>
        {recommendation.rationale}
      </div>

      {recommendation.modifiedNote && (
        <div
          style={{
            background: 'rgba(10, 18, 34, 0.6)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            padding: '6px 10px',
            fontSize: '11px',
            color: 'var(--amber)',
            marginBottom: '10px',
          }}
        >
          Operator Note: {recommendation.modifiedNote}
        </div>
      )}

      {/* Action Buttons if not yet decided */}
      {!recommendation.outcome ? (
        !isEditing ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handleOutcome('Accepted')}
              style={{
                flex: 1,
                background: 'rgba(45, 212, 191, 0.2)',
                border: '1px solid var(--teal)',
                borderRadius: '6px',
                padding: '8px',
                color: 'var(--teal)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ✓ Accept
            </button>
            <button
              onClick={() => setIsEditing(true)}
              style={{
                flex: 1,
                background: 'rgba(255, 190, 92, 0.15)',
                border: '1px solid var(--amber)',
                borderRadius: '6px',
                padding: '8px',
                color: 'var(--amber)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ✎ Modify
            </button>
            <button
              onClick={() => handleOutcome('Rejected')}
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '8px 12px',
                color: 'var(--text-muted)',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              ✕ Reject
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input
              type="text"
              placeholder="Enter modification notes or timing adjustments..."
              value={modifiedNote}
              onChange={(e) => setModifiedNote(e.target.value)}
              style={{
                background: 'var(--bg-base)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '8px 10px',
                color: 'var(--text)',
                fontSize: '12px',
                outline: 'none',
              }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleOutcome('Modified', modifiedNote)}
                style={{
                  flex: 1,
                  background: 'var(--amber)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px',
                  color: '#0A1222',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Confirm Modification
              </button>
              <button
                onClick={() => setIsEditing(false)}
                style={{
                  background: 'none',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  color: 'var(--text-muted)',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )
      ) : (
        <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontStyle: 'italic' }}>
          Response recorded and submitted to corridor audit ledger.
        </div>
      )}
    </div>
  );
}
