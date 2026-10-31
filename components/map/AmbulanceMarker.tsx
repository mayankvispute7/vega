'use client';
import { useTripStore } from '@/store/tripStore';

interface AmbulanceMarkerProps {
  bearing?: number;
}

export function AmbulanceMarker({ bearing = 0 }: AmbulanceMarkerProps) {
  const { trip, vehicle } = useTripStore();
  const isCritical = trip.priority === 'Critical';

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
      title={`${vehicle.label} — ${(vehicle.speedKmh ?? 30).toFixed(0)} km/h`}
    >
      {/* Outer pulsing glow ring */}
      <div
        style={{
          position: 'absolute',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: isCritical ? 'rgba(248, 113, 113, 0.25)' : 'rgba(45, 212, 191, 0.25)',
          animation: 'pulse 1.6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }}
      />

      {/* Secondary radar sweep wave */}
      <div
        style={{
          position: 'absolute',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          border: `1px solid ${isCritical ? 'rgba(248, 113, 113, 0.3)' : 'rgba(45, 212, 191, 0.3)'}`,
          animation: 'ping 2.2s cubic-bezier(0, 0, 0.2, 1) infinite',
          pointerEvents: 'none',
        }}
      />

      {/* Main ambulance badge */}
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'var(--bg-raised)',
          border: `2px solid ${isCritical ? 'var(--danger)' : 'var(--teal)'}`,
          boxShadow: isCritical
            ? '0 0 16px rgba(248, 113, 113, 0.6)'
            : '0 0 16px rgba(45, 212, 191, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '15px',
          transform: `rotate(${bearing}deg)`,
          transition: 'transform 200ms ease-out',
          zIndex: 10,
        }}
      >
        🚑
      </div>

      {/* Mini speed & ID tag */}
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          background: 'rgba(10, 18, 34, 0.92)',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          padding: '1px 5px',
          fontSize: '10px',
          fontWeight: 700,
          fontFamily: 'var(--font-mono, monospace)',
          color: 'var(--text)',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        }}
      >
        {(vehicle.speedKmh ?? 30).toFixed(0)} km/h
      </div>
    </div>
  );
}
