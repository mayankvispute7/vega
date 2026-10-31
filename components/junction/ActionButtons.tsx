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
      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Officer Action Controls
      </div>

      {/* Primary Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {/* 1. Received / Acknowledge */}
        <button
          onClick={() => handleAction('Received')}
          disabled={isTerminal || status === 'Received' || status === 'Preparing'}
          style={{
            background: status === 'Received' || status === 'Preparing' ? '#E0E9FF' : '#FFFFFF',
            border: `1.5px solid ${status === 'Received' ? '#1D4ED8' : '#BFDBFE'}`,
            borderRadius: '10px',
            padding: '11px 8px',
            color: '#1D4ED8',
            fontWeight: 800,
            fontSize: '13px',
            cursor: isTerminal || status === 'Received' || status === 'Preparing' ? 'not-allowed' : 'pointer',
            opacity: isTerminal ? 0.4 : 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            boxShadow: 'var(--shadow-card)',
            transition: 'all 150ms',
          }}
        >
          <span style={{ fontSize: '17px' }}>📥</span>
          <span>1. Acknowledge</span>
        </button>

        {/* 2. Preparing */}
        <button
          onClick={() => handleAction('Preparing')}
          disabled={isTerminal || status === 'Preparing'}
          style={{
            background: status === 'Preparing' ? '#FEF3C7' : '#FFFFFF',
            border: `1.5px solid ${status === 'Preparing' ? '#B45309' : '#FDE68A'}`,
            borderRadius: '10px',
            padding: '11px 8px',
            color: '#B45309',
            fontWeight: 800,
            fontSize: '13px',
            cursor: isTerminal || status === 'Preparing' ? 'not-allowed' : 'pointer',
            opacity: isTerminal ? 0.4 : 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            boxShadow: 'var(--shadow-card)',
            transition: 'all 150ms',
          }}
        >
          <span style={{ fontSize: '17px' }}>⏳</span>
          <span>2. Preparing</span>
        </button>
      </div>

      {/* 3. Ready (Full-width prominent CTA) */}
      <button
        onClick={() => handleAction('Ready')}
        disabled={isTerminal}
        style={{
          background: status === 'Ready' ? '#DCFCE7' : '#15803D',
          border: status === 'Ready' ? '2px solid #86EFAC' : 'none',
          borderRadius: '10px',
          padding: '13px',
          color: status === 'Ready' ? '#15803D' : '#FFFFFF',
          fontWeight: 800,
          fontSize: '14px',
          cursor: isTerminal ? 'not-allowed' : 'pointer',
          opacity: isTerminal && status !== 'Ready' ? 0.4 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: status === 'Ready' ? 'none' : '0 2px 8px rgba(21, 128, 61, 0.25)',
          transition: 'all 150ms',
        }}
      >
        <span style={{ fontSize: '16px' }}>🟢</span>
        <span>{status === 'Ready' ? 'SIGNAL READY CONFIRMED' : '3. CONFIRM SIGNAL READY'}</span>
      </button>

      {/* 4. Unable to Prepare */}
      {!confirmUnable ? (
        <button
          onClick={() => setConfirmUnable(true)}
          disabled={isTerminal}
          style={{
            background: '#FFFFFF',
            border: '1px solid #FECACA',
            borderRadius: '8px',
            padding: '10px',
            color: '#B91C1C',
            fontSize: '12px',
            fontWeight: 700,
            cursor: isTerminal ? 'not-allowed' : 'pointer',
            opacity: isTerminal ? 0.4 : 1,
            boxShadow: 'var(--shadow-card)',
            transition: 'all 150ms',
          }}
        >
          ⚠️ Unable to Prepare (Report Blockage / Jam)
        </button>
      ) : (
        <div
          style={{
            background: '#FEE2E2',
            border: '1.5px solid #FCA5A5',
            borderRadius: '8px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ fontSize: '12px', color: '#B91C1C', fontWeight: 700 }}>
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
                background: '#B91C1C',
                border: 'none',
                borderRadius: '6px',
                padding: '8px',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Yes, Report Unable
            </button>
            <button
              onClick={() => setConfirmUnable(false)}
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
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
