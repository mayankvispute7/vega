'use client';
import { Badge } from '@/components/ui/Badge';

interface RoadUserAlertPreviewProps {
  junctionName?: string;
  etaSeconds?: number;
}

export function RoadUserAlertPreview({
  junctionName = 'Sambhaji Bridge Junction',
  etaSeconds = 45,
}: RoadUserAlertPreviewProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Honesty disclaimer pill */}
      <div style={{ marginBottom: '12px' }}>
        <Badge variant="amber" mono>
          ALERT PREVIEW — THIS IS NOT A REAL NOTIFICATION
        </Badge>
      </div>

      {/* Phone Mockup Frame */}
      <div
        style={{
          width: '320px',
          height: '460px',
          background: 'linear-gradient(180deg, #10192e 0%, #0a1122 100%)',
          borderRadius: '36px',
          border: '4px solid #2a3a5a',
          boxShadow: '0 20px 50px rgba(0,0,0,0.7), inset 0 0 10px rgba(255,255,255,0.05)',
          position: 'relative',
          padding: '16px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Dynamic Island / Speaker notch */}
        <div
          style={{
            width: '90px',
            height: '18px',
            background: '#050a14',
            borderRadius: '12px',
            margin: '0 auto 16px auto',
          }}
        />

        {/* Lockscreen Clock */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '38px', fontWeight: 300, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>
            19:42
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
            Saturday, 31 October
          </div>
        </div>

        {/* Push Notification Card */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            borderRadius: '16px',
            padding: '12px 14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            animation: 'fadeIn 300ms ease',
          }}
        >
          {/* Notification Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '5px',
                  background: 'var(--teal)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 900,
                  color: '#0A1222',
                }}
              >
                V
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>
                VEGA Emergency Alert
              </span>
            </div>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>now</span>
          </div>

          {/* Notification Body */}
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
            🚨 Emergency Corridor Approaching
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>
            Ambulance approaching <strong style={{ color: 'var(--teal)' }}>{junctionName}</strong>. Signal change expected in ~<strong>{etaSeconds}s</strong>. Please clear the intersection.
          </div>
        </div>

        {/* Home bar at bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100px',
            height: '4px',
            background: 'rgba(255,255,255,0.3)',
            borderRadius: '2px',
          }}
        />
      </div>
    </div>
  );
}
