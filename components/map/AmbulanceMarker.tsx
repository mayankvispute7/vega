'use client';
import { useTripStore } from '@/store/tripStore';

interface AmbulanceMarkerProps {
  bearing?: number;
}

export function AmbulanceMarker({ bearing = 0 }: AmbulanceMarkerProps) {
  const { vehicle } = useTripStore();

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
      {/* Outer soft pulse ring (Government Light Theme, no neon glow) */}
      <div
        style={{
          position: 'absolute',
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          background: 'rgba(185, 28, 28, 0.15)',
          animation: 'pulse-dot 1.8s ease-in-out infinite',
        }}
      />

      {/* Main ambulance badge — crisp white circle with emergency red rim */}
      <div
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          background: '#FFFFFF',
          border: '2.5px solid #B91C1C',
          boxShadow: '0 2px 6px rgba(11, 37, 69, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          transform: `rotate(${bearing}deg)`,
          transition: 'transform 200ms ease-out',
          zIndex: 10,
        }}
      >
        🚑
      </div>

      {/* Speed & ID pill */}
      <div
        style={{
          position: 'absolute',
          top: '-22px',
          background: '#0B2545',
          border: '1px solid #D6DFEA',
          borderRadius: '4px',
          padding: '2px 6px',
          fontSize: '10px',
          fontWeight: 700,
          fontFamily: 'var(--font-mono, monospace)',
          color: '#FFFFFF',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          boxShadow: '0 2px 4px rgba(11, 37, 69, 0.18)',
        }}
      >
        {(vehicle.speedKmh ?? 30).toFixed(0)} km/h
      </div>
    </div>
  );
}
