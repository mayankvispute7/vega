'use client';
import type { Junction, JunctionTask } from '@/lib/types';
import { useUiStore } from '@/store/uiStore';
import { formatSeconds } from '@/hooks/useCountdown';

interface JunctionNodeProps {
  junction: Junction;
  index: number;
  task?: JunctionTask;
  isSelected?: boolean;
}

export function JunctionNode({ junction, index, task, isSelected }: JunctionNodeProps) {
  const { selectJunction } = useUiStore();
  const status = task?.status ?? 'Scheduled';

  const isReady = status === 'Ready' || status === 'Cleared';
  const isAlert = status === 'Escalated' || status === 'AtRisk';
  const isDanger = status === 'Unable' || status === 'Blocked';
  const isPreparing = status === 'Preparing';

  const ringColor = isReady
    ? '#15803D'
    : isAlert
    ? '#B45309'
    : isDanger
    ? '#B91C1C'
    : isPreparing
    ? '#0369A1'
    : '#94A3B8';

  const eta = task?.etaSeconds ?? 0;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        selectJunction(junction.id);
      }}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        userSelect: 'none',
      }}
      title={`${junction.name} — ${status}`}
    >
      {/* Soft pulse ring for alerting states */}
      {(isAlert || isDanger || isPreparing) && (
        <div
          style={{
            position: 'absolute',
            top: '-2px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: isDanger ? 'rgba(185, 28, 28, 0.15)' : 'rgba(180, 83, 9, 0.15)',
            animation: 'pulse-dot 1.6s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Main node: Crisp white circle with coloured status ring */}
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: '#FFFFFF',
          border: `3px solid ${ringColor}`,
          boxShadow: isSelected
            ? '0 0 0 3px #1D4ED8, 0 2px 6px rgba(11, 37, 69, 0.2)'
            : '0 2px 5px rgba(11, 37, 69, 0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 700,
          color: '#0B2545',
          fontFamily: 'var(--font-mono, monospace)',
          transition: 'transform 150ms ease, box-shadow 150ms ease',
          transform: isSelected ? 'scale(1.15)' : 'scale(1)',
          zIndex: 5,
        }}
      >
        {index + 1}
      </div>

      {/* Junction Name & Status Pill (Light Government Style) */}
      <div
        style={{
          marginTop: '4px',
          background: '#FFFFFF',
          border: `1px solid ${isSelected ? '#1D4ED8' : '#D6DFEA'}`,
          borderRadius: '6px',
          padding: '2px 7px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1px',
          pointerEvents: 'none',
          boxShadow: '0 2px 6px rgba(11, 37, 69, 0.12)',
          whiteSpace: 'nowrap',
        }}
      >
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#0B2545' }}>
          {junction.name.split(' ')[0]}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '9px', color: ringColor, fontWeight: 700 }}>
            {status}
          </span>
          {eta > 0 && (
            <span style={{ fontSize: '9px', color: '#5B6B80', fontFamily: 'var(--font-mono, monospace)' }}>
              · {formatSeconds(eta)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
