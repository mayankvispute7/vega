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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 0' }}>
        <div
          style={{
            width: '96px',
            height: '96px',
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
          <span style={{ fontSize: '26px', color: '#15803D' }}>✓</span>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#15803D', marginTop: '2px' }}>
            CLEARED
          </span>
        </div>
        <div style={{ fontSize: '11px', color: '#5B6B80', fontWeight: 600, marginTop: '6px' }}>
          Ambulance passed intersection
        </div>
      </div>
    );
  }

  if (isReady) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 0' }}>
        <div
          style={{
            width: '96px',
            height: '96px',
            borderRadius: '50%',
            background: '#DCFCE7',
            border: '2.5px solid #15803D',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 3px 10px rgba(21, 128, 61, 0.18)',
          }}
        >
          <span style={{ fontSize: '24px' }}>🟢</span>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#15803D', marginTop: '2px' }}>
            SIGNAL READY
          </span>
        </div>
        <div style={{ fontSize: '11px', color: '#15803D', fontWeight: 700, marginTop: '6px' }}>
          Corridor green locked · ETA {formatSeconds(seconds)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 0' }}>
      <CountdownRing seconds={Math.round(seconds)} maxSeconds={maxSeconds} size={96} strokeWidth={7} />
      <div style={{ fontSize: '11px', color: '#5B6B80', fontWeight: 600, marginTop: '6px' }}>
        Vehicle ETA to Stop Line
      </div>
    </div>
  );
}
