'use client';
import { useState } from 'react';
import { SEGMENTS } from '@/lib/data/segments';
import { computeAlternateRoute } from '@/lib/engine/reroute';
import { useRerouteStore } from '@/store/rerouteStore';
import { useAuditStore } from '@/store/auditStore';
import { useSimulationStore } from '@/store/simulationStore';
import { useBroadcast } from '@/hooks/useBroadcast';
import { createAuditEvent } from '@/lib/engine/audit';
import type { RerouteProposal } from '@/lib/types';
import { nanoid } from 'nanoid';

interface RoadblockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RoadblockModal({ isOpen, onClose }: RoadblockModalProps) {
  const [selectedSegmentId, setSelectedSegmentId] = useState('SEG-J2-J3');
  const [description, setDescription] = useState('Tree fall & flash waterlogging obstructing both corridor lanes near Alka Talkies');

  const { setProposal } = useRerouteStore();
  const { addRawEvent } = useAuditStore();
  const { simTime } = useSimulationStore();
  const { broadcast } = useBroadcast();

  if (!isOpen) return null;

  const handleReport = () => {
    // 1. Calculate alternate route with Dijkstra engine
    const rerouteResult = computeAlternateRoute(SEGMENTS, selectedSegmentId);
    if (!rerouteResult) {
      alert('No alternate path could be computed!');
      return;
    }

    const proposal: RerouteProposal = {
      id: `PROP-${nanoid(6)}`,
      blockedSegmentId: selectedSegmentId,
      alternatePath: rerouteResult.path.map((s) => s.id),
      deltaDistanceM: rerouteResult.deltaDistanceM,
      deltaTimeS: rerouteResult.deltaTimeS,
      affectedJunctionIds: rerouteResult.affectedJunctionIds.cancelled.concat(rerouteResult.affectedJunctionIds.updated),
      newJunctionIds: rerouteResult.affectedJunctionIds.added,
      status: 'Proposed',
      proposedAt: simTime,
    };

    setProposal(proposal);

    // 2. Audit logging
    const roadblockEvent = createAuditEvent(
      'ROADBLOCK_REPORTED',
      'Traffic Patrol (MH-12-P-44)',
      simTime,
      {
        blockedSegmentId: selectedSegmentId,
        description,
      }
    );

    const proposalEvent = createAuditEvent(
      'REROUTE_PROPOSED',
      'VEGA Reroute Engine',
      simTime,
      {
        proposalId: proposal.id,
        deltaDistanceM: proposal.deltaDistanceM,
        deltaTimeS: proposal.deltaTimeS,
        affectedJunctions: proposal.affectedJunctionIds,
      }
    );

    addRawEvent(roadblockEvent);
    addRawEvent(proposalEvent);

    // 3. Broadcast to all open tabs
    broadcast({ type: 'AUDIT_EVENT', payload: roadblockEvent });
    broadcast({ type: 'AUDIT_EVENT', payload: proposalEvent });
    broadcast({ type: 'REROUTE_PROPOSED', payload: proposal });

    onClose();
  };

  const primarySegments = SEGMENTS.filter((s) => !s.id.includes('ALT'));

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '16px',
      }}
    >
      <div
        style={{
          background: 'var(--bg-panel)',
          border: '1.5px solid var(--danger)',
          borderRadius: '14px',
          width: '100%',
          maxWidth: '480px',
          padding: '24px',
          boxShadow: '0 16px 40px rgba(0,0,0,0.6), 0 0 24px rgba(248, 113, 113, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🚧</span>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--danger)' }}>
              Report Roadblock / Corridor Obstruction
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '18px',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.4 }}>
          Reporting a blockage will trigger the Dijkstra Graph Engine to assess alternate bypass corridors, compute arrival delta times, and prepare a reroute comparison for dispatcher authorization.
        </p>

        {/* Segment Selector */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
            Obstructed Road Segment
          </label>
          <select
            value={selectedSegmentId}
            onChange={(e) => setSelectedSegmentId(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--bg-raised)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '10px 12px',
              color: 'var(--text)',
              fontSize: '13px',
              outline: 'none',
            }}
          >
            {primarySegments.map((s) => (
              <option key={s.id} value={s.id}>
                {s.from} → {s.to} ({s.distanceM}m) — {s.id}
              </option>
            ))}
          </select>
        </div>

        {/* Description Field */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
            Incident Cause / Observations
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--bg-raised)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '10px 12px',
              color: 'var(--text)',
              fontSize: '12px',
              outline: 'none',
              resize: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleReport}
            style={{
              flex: 1,
              background: 'var(--danger)',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 0 16px rgba(248, 113, 113, 0.4)',
            }}
          >
            Submit Blockage & Compute Reroute
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '12px 18px',
              color: 'var(--text-muted)',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
