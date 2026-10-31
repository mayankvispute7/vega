'use client';
import { StatusChip } from '@/components/ui/StatusChip';
import { CountdownRing } from '@/components/ui/CountdownRing';
import { KpiTile } from '@/components/ui/KpiTile';
import { Panel } from '@/components/ui/Panel';
import { Badge } from '@/components/ui/Badge';
import { useUiStore } from '@/store/uiStore';
import type { TaskStatus } from '@/lib/types';

const ALL_STATUSES: TaskStatus[] = [
  'Scheduled', 'Sent', 'Received', 'Preparing', 'Ready',
  'Escalated', 'Unable', 'AtRisk', 'Cleared', 'Uncertain', 'Blocked',
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '40px' }}>
      <h2 style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function UiKitPage() {
  const { addToast } = useUiStore();

  return (
    <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--teal)', marginBottom: '8px' }}>
          VEGA UI Kit
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          All base components and design tokens. Used across all screens.
          <span className="simulated-badge" style={{ marginLeft: '8px' }}>Simulated Data</span>
        </p>
      </div>

      {/* Status Chips */}
      <Section title="Status Chips — All Variants">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          {ALL_STATUSES.map(s => (
            <StatusChip key={s} status={s} size="md" />
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
          {ALL_STATUSES.map(s => (
            <StatusChip key={s} status={s} size="sm" />
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {ALL_STATUSES.map(s => (
            <StatusChip key={s} status={s} size="lg" />
          ))}
        </div>
      </Section>

      {/* Countdown Rings */}
      <Section title="Countdown Rings">
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <CountdownRing seconds={110} maxSeconds={120} size={80} />
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Teal (&gt;60s)</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <CountdownRing seconds={45} maxSeconds={120} size={80} />
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Amber (20-60s)</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <CountdownRing seconds={10} maxSeconds={120} size={80} />
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Red (&lt;20s)</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <CountdownRing seconds={90} maxSeconds={120} size={120} />
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Large (120px)</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <CountdownRing seconds={60} maxSeconds={120} size={48} />
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Small (48px)</div>
          </div>
        </div>
      </Section>

      {/* KPI Tiles */}
      <Section title="KPI Tiles">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
          <KpiTile label="Journey ETA" value="7m 22s" color="var(--teal)" />
          <KpiTile label="Ready / Total" value="3/5" color="var(--amber)" />
          <KpiTile label="Active Alerts" value={2} color="var(--danger)" />
          <KpiTile label="Avg Ack Time" value="12s" color="var(--info)" sublabel="Last 3 junctions" />
        </div>
      </Section>

      {/* Panels */}
      <Section title="Panels">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Panel>
            <div style={{ padding: '16px' }}>
              <h3 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 600 }}>Default Panel</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>Background: var(--bg-panel) #12203A</p>
            </div>
          </Panel>
          <Panel raised>
            <div style={{ padding: '16px' }}>
              <h3 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 600 }}>Raised Panel</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>Background: var(--bg-raised) #172A4A</p>
            </div>
          </Panel>
        </div>
      </Section>

      {/* Badges */}
      <Section title="Badges">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
          <Badge variant="teal">Ready</Badge>
          <Badge variant="amber">L2 Escalated</Badge>
          <Badge variant="danger">At Risk</Badge>
          <Badge variant="info">Sent</Badge>
          <Badge variant="muted">Scheduled</Badge>
          <Badge variant="simulated">Simulated Data</Badge>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <Badge variant="muted" mono>TRIP-001</Badge>
          <Badge variant="muted" mono>MH-12-AMB-108</Badge>
          <Badge variant="teal" mono>T+02:14</Badge>
          <Badge variant="amber" mono>L1 RE-ALERT</Badge>
        </div>
      </Section>

      {/* Toasts */}
      <Section title="Toast Notifications">
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(['info', 'warning', 'danger', 'success'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => addToast({ message: `This is a ${sev} notification (simulated).`, severity: sev })}
              style={{
                background: 'var(--bg-raised)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text)',
                cursor: 'pointer',
                padding: '8px 16px',
                fontSize: '13px',
              }}
            >
              Trigger {sev}
            </button>
          ))}
        </div>
      </Section>

      {/* Typography */}
      <Section title="Typography Scale">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { size: '32px', weight: 700, label: '32 / 700 — Heading XL' },
            { size: '24px', weight: 700, label: '24 / 700 — Heading L' },
            { size: '20px', weight: 600, label: '20 / 600 — Heading M' },
            { size: '16px', weight: 600, label: '16 / 600 — Heading S' },
            { size: '14px', weight: 400, label: '14 / 400 — Body (default)' },
            { size: '12px', weight: 400, label: '12 / 400 — Caption' },
            { size: '11px', weight: 600, label: '11 / 600 — Label / Badge' },
          ].map(({ size, weight, label }) => (
            <div key={label} style={{ fontSize: size, fontWeight: weight, color: 'var(--text)' }}>
              {label}
            </div>
          ))}
          <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '14px', color: 'var(--teal)', marginTop: '8px' }}>
            JetBrains Mono — 00:42 · T+01:35 · MH-12-AMB-108
          </div>
        </div>
      </Section>

      {/* Colour Palette */}
      <Section title="Colour Palette">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {[
            { name: 'BG Base', color: '#0A1222' },
            { name: 'BG Panel', color: '#12203A' },
            { name: 'BG Raised', color: '#172A4A' },
            { name: 'Teal (Ready)', color: '#2DD4BF' },
            { name: 'Amber (Warning)', color: '#FFBE5C' },
            { name: 'Danger', color: '#F87171' },
            { name: 'Info Blue', color: '#60A5FA' },
            { name: 'Text', color: '#E6EEF8' },
            { name: 'Text Muted', color: '#8FA3BF' },
          ].map(({ name, color }) => (
            <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '10px', background: color, border: '1px solid var(--border)' }} />
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '70px' }}>{name}</div>
              <div style={{ fontSize: '9px', color: 'var(--text-dim)', fontFamily: 'monospace' }}>{color}</div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
