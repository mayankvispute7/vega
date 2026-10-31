'use client';
import type { TaskStatus } from '@/lib/types';

const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; className: string; icon: string }
> = {
  Scheduled:  { label: 'Scheduled',  className: 'chip-scheduled', icon: '⏱' },
  Sent:       { label: 'Sent',       className: 'chip-sent',      icon: '↗' },
  Received:   { label: 'Received',   className: 'chip-received',  icon: '📥' },
  Preparing:  { label: 'Preparing',  className: 'chip-preparing', icon: '⟳' },
  Ready:      { label: 'Ready',      className: 'chip-ready',     icon: '✓' },
  Escalated:  { label: 'Escalated',  className: 'chip-escalated', icon: '🔔' },
  Unable:     { label: 'Unable',     className: 'chip-unable',    icon: '✕' },
  AtRisk:     { label: 'At Risk',    className: 'chip-atrisk',    icon: '⚠️' },
  Cleared:    { label: 'Cleared',    className: 'chip-cleared',   icon: '✓✓' },
  Uncertain:  { label: 'Uncertain',  className: 'chip-uncertain', icon: '?' },
  Blocked:    { label: 'Blocked',    className: 'chip-blocked',   icon: '⛔' },
};

interface StatusChipProps {
  status: TaskStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function StatusChip({
  status,
  size = 'md',
  showIcon = true,
  className = '',
}: StatusChipProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.Scheduled;
  const sizeStyle =
    size === 'sm'
      ? { fontSize: '11px', padding: '1px 7px', borderRadius: '4px' }
      : size === 'lg'
      ? { fontSize: '13px', padding: '4px 12px', borderRadius: '8px' }
      : { fontSize: '12px', padding: '2px 9px', borderRadius: '6px' };

  return (
    <span
      className={`${config.className} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        fontWeight: 700,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
        ...sizeStyle,
      }}
    >
      {showIcon && <span style={{ fontSize: '10px' }}>{config.icon}</span>}
      {config.label}
    </span>
  );
}
