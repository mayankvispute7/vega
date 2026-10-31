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
        background: '#FEF3C7',
        border: '1.5px solid #FCD34D',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '15px' }}>💡</span>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#92400E', letterSpacing: '0.06em' }}>
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

      <div style={{ fontSize: '13px', fontWeight: 800, color: '#78350F', marginBottom: '6px', lineHeight: 1.4 }}>
        {recommendation.action}
      </div>

      <div style={{ fontSize: '12px', color: '#92400E', marginBottom: '14px', lineHeight: 1.4 }}>
        {recommendation.rationale}
      </div>

      {recommendation.modifiedNote && (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #FCD34D',
            borderRadius: '6px',
            padding: '6px 10px',
            fontSize: '11px',
            color: '#B45309',
            marginBottom: '10px',
            fontWeight: 600,
          }}
        >
          Officer Note: {recommendation.modifiedNote}
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
                background: '#DCFCE7',
                border: '1.5px solid #86EFAC',
                borderRadius: '6px',
                padding: '8px',
                color: '#15803D',
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
                background: '#FFFFFF',
                border: '1.5px solid #FCD34D',
                borderRadius: '6px',
                padding: '8px',
                color: '#B45309',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ✎ Modify
            </button>
            <button
              onClick={() => handleOutcome('Rejected')}
              style={{
                background: '#FFFFFF',
                border: '1px solid #D6DFEA',
                borderRadius: '6px',
                padding: '8px 12px',
                color: '#5B6B80',
                fontSize: '12px',
                fontWeight: 600,
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
                background: '#FFFFFF',
                border: '1px solid #D6DFEA',
                borderRadius: '6px',
                padding: '8px 10px',
                color: '#0F1B2D',
                fontSize: '12px',
                outline: 'none',
              }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleOutcome('Modified', modifiedNote)}
                style={{
                  flex: 1,
                  background: '#B45309',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Save Adjustment
              </button>
              <button
                onClick={() => setIsEditing(false)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #D6DFEA',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  color: '#5B6B80',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )
      ) : null}
    </div>
  );
}
