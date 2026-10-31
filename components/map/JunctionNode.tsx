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

  const nodeColor = isReady
    ? 'var(--teal)'
    : isAlert
    ? 'var(--amber)'
    : isDanger
    ? 'var(--danger)'
    : isPreparing
    ? 'var(--info)'
    : 'var(--text-muted)';

  const bgAlpha = isReady
    ? 'rgba(45, 212, 191, 0.2)'
    : isAlert
    ? 'rgba(255, 190, 92, 0.25)'
    : isDanger
    ? 'rgba(248, 113, 113, 0.25)'
    : isPreparing
    ? 'rgba(96, 165, 250, 0.2)'
    : 'rgba(143, 163, 191, 0.15)';

  const glowShadow = isReady
    ? '0 0 12px rgba(45, 212, 191, 0.5)'
    : isAlert
    ? '0 0 16px rgba(255, 190, 92, 0.7)'
    : isDanger
    ? '0 0 16px rgba(248, 113, 113, 0.7)'
    : '0 0 6px rgba(0, 0, 0, 0.5)';

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
      {/* Escalation or preparing pulse ring */}
      {(isAlert || isDanger || isPreparing) && (
        <div
          style={{
            position: 'absolute',
            top: '0',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: bgAlpha,
            border: `1.5px solid ${nodeColor}`,
            animation: isDanger ? 'ping 1.2s infinite' : 'pulse 1.8s infinite',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Main node circle */}
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: isSelected ? 'var(--bg-base)' : 'var(--bg-raised)',
          border: `2px solid ${nodeColor}`,
          boxShadow: isSelected ? `0 0 0 3px rgba(45, 212, 191, 0.4), ${glowShadow}` : glowShadow,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          fontWeight: 700,
          color: 'var(--text)',
          fontFamily: 'var(--font-mono, monospace)',
          transition: 'transform 150ms ease, box-shadow 150ms ease',
          transform: isSelected ? 'scale(1.15)' : 'scale(1)',
          zIndex: 5,
        }}
      >
        {index + 1}
      </div>

      {/* Junction Name & Status Pill */}
      <div
        style={{
          marginTop: '4px',
          background: 'rgba(10, 18, 34, 0.92)',
          border: `1px solid ${isSelected ? 'var(--teal)' : 'var(--border)'}`,
          borderRadius: '6px',
          padding: '2px 6px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1px',
          pointerEvents: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          whiteSpace: 'nowrap',
        }}
      >
        <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text)' }}>
          {junction.name.split(' ')[0]}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '9px', color: nodeColor, fontWeight: 600 }}>
            {status}
          </span>
          {eta > 0 && (
            <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono, monospace)' }}>
              · {formatSeconds(eta)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
