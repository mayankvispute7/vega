import type { ReactNode } from 'react';

type BadgeVariant = 'teal' | 'amber' | 'danger' | 'info' | 'muted' | 'simulated';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  mono?: boolean;
  className?: string;
}

export function Badge({ children, variant = 'muted', mono = false, className = '' }: BadgeProps) {
  const styles = {
    teal: {
      color: '#0F766E',
      background: '#CCFBF1',
      border: '1px solid #99F6E4',
    },
    amber: {
      color: '#B45309',
      background: '#FEF3C7',
      border: '1px solid #FDE68A',
    },
    simulated: {
      color: '#92400E',
      background: '#FEF3C7',
      border: '1px solid #FCD34D',
    },
    danger: {
      color: '#B91C1C',
      background: '#FEE2E2',
      border: '1px solid #FECACA',
    },
    info: {
      color: '#0369A1',
      background: '#E0F2FE',
      border: '1px solid #BAE6FD',
    },
    muted: {
      color: '#5B6B80',
      background: '#EEF3F9',
      border: '1px solid #D6DFEA',
    },
  }[variant];

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        fontFamily: mono ? 'var(--font-mono, monospace)' : 'inherit',
        color: styles.color,
        background: styles.background,
        border: styles.border,
      }}
    >
      {children}
    </span>
  );
}
