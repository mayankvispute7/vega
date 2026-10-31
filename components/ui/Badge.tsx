import type { ReactNode } from 'react';

type BadgeVariant = 'teal' | 'amber' | 'danger' | 'info' | 'muted' | 'simulated';

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  teal:      'color: var(--teal);   background: rgba(45,212,191,0.12);  border: 1px solid rgba(45,212,191,0.25)',
  amber:     'color: var(--amber);  background: rgba(255,190,92,0.12);  border: 1px solid rgba(255,190,92,0.25)',
  danger:    'color: var(--danger); background: rgba(248,113,113,0.12); border: 1px solid rgba(248,113,113,0.25)',
  info:      'color: var(--info);   background: rgba(96,165,250,0.12);  border: 1px solid rgba(96,165,250,0.25)',
  muted:     'color: var(--text-muted); background: rgba(143,163,191,0.08); border: 1px solid var(--border)',
  simulated: 'color: var(--amber);  background: rgba(255,190,92,0.10);  border: 1px solid rgba(255,190,92,0.25)',
};

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  mono?: boolean;
  className?: string;
}

export function Badge({ children, variant = 'muted', mono = false, className = '' }: BadgeProps) {
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
        fontWeight: 600,
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
        fontFamily: mono ? 'var(--font-mono, monospace)' : 'inherit',
        // Inline style string parsing workaround — use direct properties:
        color: variant === 'teal' ? 'var(--teal)' :
               variant === 'amber' || variant === 'simulated' ? 'var(--amber)' :
               variant === 'danger' ? 'var(--danger)' :
               variant === 'info' ? 'var(--info)' :
               'var(--text-muted)',
        background: variant === 'teal' ? 'rgba(45,212,191,0.12)' :
                    variant === 'amber' || variant === 'simulated' ? 'rgba(255,190,92,0.10)' :
                    variant === 'danger' ? 'rgba(248,113,113,0.12)' :
                    variant === 'info' ? 'rgba(96,165,250,0.12)' :
                    'rgba(143,163,191,0.08)',
        border: variant === 'teal' ? '1px solid rgba(45,212,191,0.25)' :
                variant === 'amber' || variant === 'simulated' ? '1px solid rgba(255,190,92,0.25)' :
                variant === 'danger' ? '1px solid rgba(248,113,113,0.25)' :
                variant === 'info' ? '1px solid rgba(96,165,250,0.25)' :
                '1px solid var(--border)',
      }}
    >
      {children}
    </span>
  );
}
