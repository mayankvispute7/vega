'use client';
import { useEffect, useCallback } from 'react';
import type { BroadcastMessage } from '@/lib/types';
import { initBroadcast, broadcastMessage } from '@/store/broadcastBridge';
import { useJunctionStore } from '@/store/junctionStore';
import { useAuditStore } from '@/store/auditStore';
import { useSimulationStore } from '@/store/simulationStore';
import { useRerouteStore } from '@/store/rerouteStore';

/**
 * Hook for cross-tab synchronization via BroadcastChannel.
 * Listens for state mutations from other tabs and provides a broadcast dispatcher.
 */
export function useBroadcast() {
  const { patchTasks } = useJunctionStore();
  const { addRawEvent } = useAuditStore();
  const { setPlaying, setSpeed, reset: resetSim } = useSimulationStore();
  const { setProposal, approveProposal, rejectProposal } = useRerouteStore();

  useEffect(() => {
    const cleanup = initBroadcast((msg: BroadcastMessage) => {
      switch (msg.type) {
        case 'STATE_PATCH':
          patchTasks(msg.payload);
          break;
        case 'AUDIT_EVENT':
          addRawEvent(msg.payload);
          break;
        case 'SIM_CONTROL':
          if (msg.payload.action === 'play') setPlaying(true);
          else if (msg.payload.action === 'pause') setPlaying(false);
          else if (msg.payload.action === 'reset') resetSim();
          else if (msg.payload.action === 'speed' && msg.payload.speed) setSpeed(msg.payload.speed as any);
          break;
        case 'REROUTE_PROPOSED':
          setProposal(msg.payload);
          break;
        case 'REROUTE_APPROVED':
          approveProposal();
          break;
        case 'REROUTE_REJECTED':
          rejectProposal();
          break;
      }
    });

    return cleanup;
  }, [patchTasks, addRawEvent, setPlaying, setSpeed, resetSim, setProposal, approveProposal, rejectProposal]);

  const send = useCallback((msg: BroadcastMessage) => {
    broadcastMessage(msg);
  }, []);

  return { broadcast: send };
}
