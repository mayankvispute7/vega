import type { ReactNode } from 'react';

interface KpiTileProps {
  label: string;
  value: string | number;
  delta?: string;
  icon?: ReactNode;
  color?: string;
  sublabel?: string;
}

export function KpiTile({ label, value, delta, icon, color = 'var(--teal)', sublabel }: KpiTileProps) {
  return (
    <div
      style={{
        background: 'var(--bg-raised)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-card)',
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {icon && <span style={{ fontSize: '12px' }}>{icon}</span>}
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
        <span style={{ fontSize: '22px', fontWeight: 700, color, fontFamily: 'var(--font-mono, monospace)', lineHeight: 1.1 }}>
          {value}
        </span>
        {delta && (
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono, monospace)' }}>
            {delta}
          </span>
        )}
      </div>
      {sublabel && (
        <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{sublabel}</div>
      )}
    </div>
  );
}
