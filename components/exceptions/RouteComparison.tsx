'use client';
import type { RerouteProposal } from '@/lib/types';
import { useRerouteStore } from '@/store/rerouteStore';
import { useJunctionStore } from '@/store/junctionStore';
import { useAuditStore } from '@/store/auditStore';
import { useSimulationStore } from '@/store/simulationStore';
import { useBroadcast } from '@/hooks/useBroadcast';
import { createAuditEvent } from '@/lib/engine/audit';
import { Badge } from '@/components/ui/Badge';
import { formatSeconds } from '@/hooks/useCountdown';

interface RouteComparisonProps {
  proposal: RerouteProposal;
}

export function RouteComparison({ proposal }: RouteComparisonProps) {
  const { approveProposal, rejectProposal } = useRerouteStore();
  const { tasks, patchTasks } = useJunctionStore();
  const { addRawEvent } = useAuditStore();
  const { simTime } = useSimulationStore();
  const { broadcast } = useBroadcast();

  const handleApprove = () => {
    approveProposal();

    // Update tasks in junctionStore:
    // J3 is cancelled because bypassed by detour
    const j3Task = tasks['J3'];
    const patch: any = {
      J3: {
        ...(j3Task ?? {}),
        status: 'Blocked',
        cancelReason: 'Corridor rerouted via alternate bypass — J3 excluded',
      },
    };

    patchTasks(patch);

    const approveEvent = createAuditEvent(
      'REROUTE_APPROVED',
      'Chief Dispatcher (CMD-01)',
      simTime,
      {
        proposalId: proposal.id,
        newPath: proposal.alternatePath,
        deltaDistanceM: proposal.deltaDistanceM,
        deltaTimeS: proposal.deltaTimeS,
      }
    );

    addRawEvent(approveEvent);

    broadcast({ type: 'REROUTE_APPROVED', payload: { proposalId: proposal.id } });
    broadcast({ type: 'STATE_PATCH', payload: patch });
    broadcast({ type: 'AUDIT_EVENT', payload: approveEvent });
  };

  const handleReject = () => {
    rejectProposal();

    const rejectEvent = createAuditEvent(
      'REROUTE_REJECTED',
      'Chief Dispatcher (CMD-01)',
      simTime,
      {
        proposalId: proposal.id,
        reason: 'Hold primary corridor awaiting rapid road clearance',
      }
    );

    addRawEvent(rejectEvent);
    broadcast({ type: 'REROUTE_REJECTED', payload: { proposalId: proposal.id } });
    broadcast({ type: 'AUDIT_EVENT', payload: rejectEvent });
  };

  return (
    <div
      style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Badge variant="amber" mono>{proposal.id}</Badge>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Computed via Dijkstra Shortest-Path Graph Engine
            </span>
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
            Alternate Corridor Comparison
          </h2>
        </div>
        <Badge variant={proposal.status === 'Approved' ? 'teal' : proposal.status === 'Rejected' ? 'danger' : 'amber'}>
          {proposal.status}
        </Badge>
      </div>

      {/* Visual comparison representation */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        {/* Original Path Card */}
        <div
          style={{
            background: 'var(--bg-raised)',
            border: '1px solid rgba(248, 113, 113, 0.4)',
            borderRadius: '10px',
            padding: '16px',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Current Corridor (Blocked)
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
            Origin → J1 → J2 → <span style={{ color: 'var(--danger)', textDecoration: 'line-through' }}>J3 (Alka Talkies)</span> → J4 → J5
          </div>
          <div style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '8px' }}>
            ⛔ Obstructed Segment: {proposal.blockedSegmentId}
          </div>
        </div>

        {/* Alternate Path Card */}
        <div
          style={{
            background: 'var(--bg-raised)',
            border: '1.5px solid var(--teal)',
            borderRadius: '10px',
            padding: '16px',
            boxShadow: '0 0 16px rgba(45, 212, 191, 0.2)',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Proposed Alternate Bypass
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
            Origin → J1 → J2 → <strong style={{ color: 'var(--teal)' }}>[Detour Bypass]</strong> → J4 → J5
          </div>
          <div style={{ fontSize: '12px', color: 'var(--teal)', marginTop: '8px' }}>
            ✓ Clear corridor verified · Bypasses J3 Alka Talkies
          </div>
        </div>
      </div>

      {/* Delta Metrics Strip */}
      <div
        style={{
          background: 'rgba(10, 18, 34, 0.7)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '14px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          textAlign: 'center',
          marginBottom: '20px',
        }}
      >
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Delta Distance</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: proposal.deltaDistanceM <= 0 ? 'var(--teal)' : 'var(--amber)', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>
            {proposal.deltaDistanceM > 0 ? `+${proposal.deltaDistanceM}m` : `${proposal.deltaDistanceM}m`}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Delta Travel Time</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: proposal.deltaTimeS <= 0 ? 'var(--teal)' : 'var(--amber)', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>
            {proposal.deltaTimeS > 0 ? `+${proposal.deltaTimeS}s` : `${proposal.deltaTimeS}s`}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Junctions Affected</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>
            {proposal.affectedJunctionIds.length} Nodes
          </div>
        </div>
      </div>

      {/* Action Controls */}
      {proposal.status === 'Proposed' ? (
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleApprove}
            style={{
              flex: 2,
              background: '#15803D',
              border: 'none',
              borderRadius: '8px',
              padding: '14px',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(21, 128, 61, 0.25)',
              transition: 'all 150ms',
            }}
          >
            ✓ Authorize & Activate Alternate Corridor
          </button>
          <button
            onClick={handleReject}
            style={{
              flex: 1,
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '14px',
              color: 'var(--text-muted)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ✕ Reject Proposal
          </button>
        </div>
      ) : (
        <div
          style={{
            padding: '12px',
            borderRadius: '8px',
            background: proposal.status === 'Approved' ? 'rgba(45, 212, 191, 0.1)' : 'rgba(248, 113, 113, 0.1)',
            border: `1px solid ${proposal.status === 'Approved' ? 'var(--teal)' : 'var(--danger)'}`,
            textAlign: 'center',
            fontSize: '13px',
            fontWeight: 600,
            color: proposal.status === 'Approved' ? 'var(--teal)' : 'var(--danger)',
          }}
        >
          {proposal.status === 'Approved'
            ? '✓ Alternate route active — J3 cancelled, J4/J5 re-scheduled.'
            : 'Proposal rejected — Primary corridor retained.'}
        </div>
      )}
    </div>
  );
}
