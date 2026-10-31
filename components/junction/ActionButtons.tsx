'use client';
import { useState } from 'react';
import type { TaskStatus, JunctionTask } from '@/lib/types';
import { useJunctionStore } from '@/store/junctionStore';
import { useAuditStore } from '@/store/auditStore';
import { useSimulationStore } from '@/store/simulationStore';
import { useBroadcast } from '@/hooks/useBroadcast';
import { createAuditEvent } from '@/lib/engine/audit';

interface ActionButtonsProps {
  junctionId: string;
  task?: JunctionTask;
  operatorName: string;
}

export function ActionButtons({ junctionId, task, operatorName }: ActionButtonsProps) {
  const { setStatus } = useJunctionStore();
  const { addRawEvent } = useAuditStore();
  const { simTime } = useSimulationStore();
  const { broadcast } = useBroadcast();

  const [confirmUnable, setConfirmUnable] = useState(false);

  const status = task?.status ?? 'Scheduled';
  const isTerminal = status === 'Ready' || status === 'Unable' || status === 'Cleared';

  const handleAction = (newStatus: TaskStatus) => {
    const timestamp = simTime;
    setStatus(junctionId, newStatus, timestamp);

    // Audit event mapping
    const eventType =
      newStatus === 'Received'
        ? 'TASK_RECEIVED'
        : newStatus === 'Preparing'
        ? 'TASK_PREPARING'
        : newStatus === 'Ready'
        ? 'TASK_READY'
        : 'TASK_UNABLE';

    const event = createAuditEvent(
      eventType as any,
      operatorName,
      timestamp,
      { manualAction: true, fromStatus: status, toStatus: newStatus },
      junctionId
    );

    addRawEvent(event);

    // Broadcast state patch & audit event to other tabs!
    broadcast({
      type: 'STATE_PATCH',
      payload: {
        [junctionId]: {
          ...(task ?? ({} as any)),
          status: newStatus,
          [newStatus === 'Received' ? 'receivedAt' : newStatus === 'Preparing' ? 'preparingAt' : 'readyAt']: timestamp,
        },
      },
    });

    broadcast({
      type: 'AUDIT_EVENT',
      payload: event,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Operator Action Controls
      </div>

      {/* Primary Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {/* 1. Received / Acknowledge */}
        <button
          onClick={() => handleAction('Received')}
          disabled={isTerminal || status === 'Received' || status === 'Preparing'}
          style={{
            background: status === 'Received' || status === 'Preparing' ? 'rgba(96, 165, 250, 0.25)' : 'rgba(96, 165, 250, 0.12)',
            border: `1.5px solid ${status === 'Received' ? 'var(--info)' : 'rgba(96, 165, 250, 0.3)'}`,
            borderRadius: '10px',
            padding: '14px 10px',
            color: 'var(--info)',
            fontWeight: 700,
            fontSize: '13px',
            cursor: isTerminal || status === 'Received' || status === 'Preparing' ? 'not-allowed' : 'pointer',
            opacity: isTerminal ? 0.4 : 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 150ms',
          }}
        >
          <span style={{ fontSize: '18px' }}>📥</span>
          <span>1. Acknowledge</span>
        </button>

        {/* 2. Preparing */}
        <button
          onClick={() => handleAction('Preparing')}
          disabled={isTerminal || status === 'Preparing'}
          style={{
            background: status === 'Preparing' ? 'rgba(255, 190, 92, 0.25)' : 'rgba(255, 190, 92, 0.12)',
            border: `1.5px solid ${status === 'Preparing' ? 'var(--amber)' : 'rgba(255, 190, 92, 0.3)'}`,
            borderRadius: '10px',
            padding: '14px 10px',
            color: 'var(--amber)',
            fontWeight: 700,
            fontSize: '13px',
            cursor: isTerminal || status === 'Preparing' ? 'not-allowed' : 'pointer',
            opacity: isTerminal ? 0.4 : 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 150ms',
          }}
        >
          <span style={{ fontSize: '18px' }}>⏳</span>
          <span>2. Preparing</span>
        </button>
      </div>

      {/* 3. Ready (Full-width prominent CTA) */}
      <button
        onClick={() => handleAction('Ready')}
        disabled={isTerminal}
        style={{
          background: status === 'Ready' ? 'rgba(45, 212, 191, 0.3)' : 'var(--teal)',
          border: 'none',
          borderRadius: '10px',
          padding: '16px',
          color: '#0A1222',
          fontWeight: 800,
          fontSize: '15px',
          cursor: isTerminal ? 'not-allowed' : 'pointer',
          opacity: isTerminal && status !== 'Ready' ? 0.4 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: status === 'Ready' ? 'none' : '0 0 20px rgba(45, 212, 191, 0.4)',
          transition: 'all 150ms',
        }}
      >
        <span style={{ fontSize: '18px' }}>🟢</span>
        <span>{status === 'Ready' ? 'SIGNAL READY LOCKED' : 'CONFIRM SIGNAL READY'}</span>
      </button>

      {/* 4. Unable to Prepare */}
      {!confirmUnable ? (
        <button
          onClick={() => setConfirmUnable(true)}
          disabled={isTerminal}
          style={{
            background: 'none',
            border: '1px solid rgba(248, 113, 113, 0.3)',
            borderRadius: '8px',
            padding: '10px',
            color: 'var(--danger)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: isTerminal ? 'not-allowed' : 'pointer',
            opacity: isTerminal ? 0.4 : 1,
            transition: 'all 150ms',
          }}
        >
          ⚠️ Unable to Prepare (Report Blockage / Jam)
        </button>
      ) : (
        <div
          style={{
            background: 'rgba(248, 113, 113, 0.12)',
            border: '1.5px solid var(--danger)',
            borderRadius: '8px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--danger)', fontWeight: 600 }}>
            Confirm: Mark intersection Unable to clear? (Triggers corridor re-assessment)
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                handleAction('Unable');
                setConfirmUnable(false);
              }}
              style={{
                flex: 1,
                background: 'var(--danger)',
                border: 'none',
                borderRadius: '6px',
                padding: '8px',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Yes, Report Unable
            </button>
            <button
              onClick={() => setConfirmUnable(false)}
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
      )}
    </div>
  );
}
