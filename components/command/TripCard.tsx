'use client';
import { Badge } from '@/components/ui/Badge';
import { useTripStore } from '@/store/tripStore';

export function TripCard() {
  const { trip } = useTripStore();

  return (
    <div style={{ padding: '14px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--navy)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Active Corridor Trip
        </span>
        <Badge variant={trip.status === 'Active' ? 'danger' : 'muted'} mono>
          {trip.status}
        </Badge>
      </div>

      <div
        style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '16px',
          fontWeight: 800,
          color: '#0B2545',
          marginBottom: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span>🚑</span>
        <span>{trip.vehicleId}</span>
      </div>

      <div
        style={{
          fontSize: '12px',
          color: 'var(--muted)',
          marginBottom: '12px',
          lineHeight: '1.4',
        }}
      >
        {trip.originLabel.replace(' (simulated)', '')} → {trip.destinationLabel.replace(' (simulated)', '')}
      </div>

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <Badge
          variant={trip.priority === 'Critical' ? 'danger' : trip.priority === 'High' ? 'amber' : 'info'}
        >
          {trip.priority} Priority
        </Badge>
        <Badge variant="muted" mono>
          {trip.incidentCode}
        </Badge>
        <Badge variant="muted">
          Dispatcher: {trip.dispatcherId}
        </Badge>
      </div>
    </div>
  );
}
