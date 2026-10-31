'use client';
import { CountdownRing } from '@/components/ui/CountdownRing';
import { formatSeconds } from '@/hooks/useCountdown';

interface EtaRingProps {
  seconds: number;
  maxSeconds?: number;
  isReady?: boolean;
  isCleared?: boolean;
}

export function EtaRing({ seconds, maxSeconds = 120, isReady, isCleared }: EtaRingProps) {
  if (isCleared) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0' }}>
        <div
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'rgba(45, 212, 191, 0.15)',
            border: '2px solid var(--teal)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 24px rgba(45, 212, 191, 0.3)',
          }}
        >
          <span style={{ fontSize: '32px' }}>✓</span>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--teal)', marginTop: '2px' }}>
            CLEARED
          </span>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
          Ambulance passed intersection
        </div>
      </div>
    );
  }

  if (isReady) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0' }}>
        <div
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'rgba(45, 212, 191, 0.2)',
            border: '3px solid var(--teal)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 32px rgba(45, 212, 191, 0.5)',
            animation: 'pulse 2s infinite',
          }}
        >
          <span style={{ fontSize: '30px' }}>🟢</span>
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--teal)', marginTop: '4px' }}>
            SIGNAL READY
          </span>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--teal)', fontWeight: 600, marginTop: '8px' }}>
          Corridor green locked · ETA {formatSeconds(seconds)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0' }}>
      <CountdownRing seconds={Math.round(seconds)} maxSeconds={maxSeconds} size={130} strokeWidth={8} />
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '10px' }}>
        Vehicle ETA to Stop Line
      </div>
    </div>
  );
}
