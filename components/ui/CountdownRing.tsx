'use client';
import { RING_AMBER_THRESHOLD_S, RING_RED_THRESHOLD_S } from '@/lib/constants';
import { useCountdown } from '@/hooks/useCountdown';

interface CountdownRingProps {
  seconds: number;
  maxSeconds?: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  className?: string;
}

export function CountdownRing({
  seconds,
  maxSeconds = 120,
  size = 80,
  strokeWidth = 5,
  showLabel = true,
  className = '',
}: CountdownRingProps) {
  const label = useCountdown(seconds);
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, seconds / maxSeconds));
  const dashoffset = circumference * (1 - progress);

  const color =
    seconds <= RING_RED_THRESHOLD_S
      ? 'var(--danger)'
      : seconds <= RING_AMBER_THRESHOLD_S
      ? 'var(--amber)'
      : 'var(--teal)';

  const fontSize = size < 60 ? '11px' : size < 100 ? '14px' : '22px';

  return (
    <div
      className={className}
      style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.5s ease' }}
        />
      </svg>
      {showLabel && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
            fontSize,
            fontWeight: 600,
            color,
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
