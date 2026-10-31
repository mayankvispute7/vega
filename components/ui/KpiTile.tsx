import type { ReactNode } from 'react';

interface KpiTileProps {
  label: string;
  value: string | number;
  delta?: string;
  icon?: ReactNode;
  color?: string;
  sublabel?: string;
}

export function KpiTile({ label, value, delta, icon, color = 'var(--navy)', sublabel }: KpiTileProps) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-card)',
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        minWidth: 0,
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--muted)',
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {icon && <span style={{ fontSize: '13px' }}>{icon}</span>}
        <span>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
        <span
          style={{
            fontSize: '22px',
            fontWeight: 800,
            color,
            fontFamily: 'var(--font-mono, monospace)',
            lineHeight: 1.1,
          }}
        >
          {value}
        </span>
        {delta && (
          <span style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono, monospace)' }}>
            {delta}
          </span>
        )}
      </div>
      {sublabel && (
        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{sublabel}</div>
      )}
    </div>
  );
}
