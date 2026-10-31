'use client';
import { KpiTile } from '@/components/ui/KpiTile';
import { useJunctionStore } from '@/store/junctionStore';
import { useTripStore } from '@/store/tripStore';
import { useSimulationStore } from '@/store/simulationStore';
import { formatSeconds } from '@/hooks/useCountdown';

export function KpiStrip() {
  const { tasks } = useJunctionStore();
  const { trip, vehicle } = useTripStore();
  const { simTime } = useSimulationStore();

  const taskList = Object.values(tasks);
  const readyCount = taskList.filter((t) => t.status === 'Ready' || t.status === 'Cleared').length;
  const totalCount = taskList.length;

  const alertCount = taskList.filter(
    (t) => t.status === 'Escalated' || t.status === 'AtRisk' || t.status === 'Unable'
  ).length;

  // Compute average acknowledgement time
  const ackTimes = taskList
    .filter((t) => t.sentAt && t.receivedAt)
    .map((t) => (t.receivedAt! - t.sentAt!) / 1000);
  const avgAck = ackTimes.length > 0 ? (ackTimes.reduce((a, b) => a + b, 0) / ackTimes.length).toFixed(0) : '--';

  // Remaining journey time
  const remainingS = Math.max(0, trip.estimatedDurationS * (1 - vehicle.progressRatio));

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        padding: '0 14px 14px',
      }}
    >
      <KpiTile
        label="Journey ETA"
        value={vehicle.progressRatio >= 1 ? 'Arrived' : formatSeconds(remainingS)}
        color="var(--teal)"
      />
      <KpiTile
        label="Ready / Total"
        value={`${readyCount}/${totalCount}`}
        color={readyCount === totalCount ? 'var(--teal)' : readyCount > 0 ? 'var(--amber)' : 'var(--text-muted)'}
      />
      <KpiTile
        label="Active Alerts"
        value={alertCount}
        color={alertCount > 0 ? 'var(--danger)' : 'var(--text-muted)'}
      />
      <KpiTile
        label="Avg Ack Time"
        value={avgAck === '--' ? '--' : `${avgAck}s`}
        color="var(--info)"
      />
    </div>
  );
}
