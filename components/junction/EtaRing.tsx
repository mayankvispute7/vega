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
            background: '#F1F5F9',
            border: '2.5px solid #15803D',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <span style={{ fontSize: '32px', color: '#15803D' }}>✓</span>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#15803D', marginTop: '2px' }}>
            CLEARED
          </span>
        </div>
        <div style={{ fontSize: '12px', color: '#5B6B80', fontWeight: 600, marginTop: '8px' }}>
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
            background: '#DCFCE7',
            border: '3px solid #15803D',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(21, 128, 61, 0.2)',
          }}
        >
          <span style={{ fontSize: '30px' }}>🟢</span>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#15803D', marginTop: '4px' }}>
            SIGNAL READY
          </span>
        </div>
        <div style={{ fontSize: '12px', color: '#15803D', fontWeight: 700, marginTop: '8px' }}>
          Corridor green locked · ETA {formatSeconds(seconds)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0' }}>
      <CountdownRing seconds={Math.round(seconds)} maxSeconds={maxSeconds} size={130} strokeWidth={8} />
      <div style={{ fontSize: '12px', color: '#5B6B80', fontWeight: 600, marginTop: '10px' }}>
        Vehicle ETA to Stop Line
      </div>
    </div>
  );
}
