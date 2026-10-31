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
    <div style={{ marginBottom: '36px' }}>
      <h2 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--navy)', marginBottom: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function UiKitPage() {
  const { addToast } = useUiStore();

  return (
    <div style={{ padding: '32px 24px', maxWidth: '960px', margin: '0 auto', background: '#F4F7FB', minHeight: 'calc(100vh - 92px)' }}>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--navy)', margin: 0 }}>
            Government Portal UI Design System
          </h1>
          <Badge variant="simulated">Gov Standard</Badge>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: '14px', margin: 0 }}>
          High-contrast white government theme for Indian smart-city control-room software. Meets WCAG AA.
        </p>
      </div>

      {/* Status Chips */}
      <Section title="Status Chips — Soft Background + Dark Text + Icon (All 11 States)">
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
      <Section title="Countdown Rings (Light Background Track)">
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <CountdownRing seconds={110} maxSeconds={120} size={80} />
            <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, marginTop: '4px' }}>Green (&gt;60s)</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <CountdownRing seconds={45} maxSeconds={120} size={80} />
            <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, marginTop: '4px' }}>Amber (20-60s)</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <CountdownRing seconds={10} maxSeconds={120} size={80} />
            <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, marginTop: '4px' }}>Red (&lt;20s)</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <CountdownRing seconds={90} maxSeconds={120} size={120} />
            <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, marginTop: '4px' }}>Large (120px)</div>
          </div>
        </div>
      </Section>

      {/* KPI Tiles */}
      <Section title="KPI Tiles (White Cards with Navy Numbers)">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
          <KpiTile label="Journey ETA" value="7m 22s" color="#0F766E" icon="⏱" />
          <KpiTile label="Ready / Total" value="3/5" color="#B45309" icon="🚦" />
          <KpiTile label="Active Alerts" value={2} color="#B91C1C" icon="🚨" />
          <KpiTile label="Avg Ack Time" value="12s" color="#1D4ED8" icon="⚡" sublabel="Last 3 junctions" />
        </div>
      </Section>

      {/* Panels */}
      <Section title="Panels & Cards (Flat White Surfaces, 1px Borders, Subtle Shadow)">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Panel>
            <div style={{ padding: '16px' }}>
              <h3 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 700, color: 'var(--navy)' }}>Standard Surface Panel</h3>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: '13px' }}>Background: #FFFFFF, Border: #D6DFEA</p>
            </div>
          </Panel>
          <Panel raised>
            <div style={{ padding: '16px' }}>
              <h3 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 700, color: 'var(--navy)' }}>Raised Surface Panel</h3>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: '13px' }}>Background: #FFFFFF, Elevated shadow</p>
            </div>
          </Panel>
        </div>
      </Section>

      {/* Badges */}
      <Section title="High-Contrast Badges">
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

      {/* Toast Notifications */}
      <Section title="Toast Notifications">
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(['info', 'warning', 'danger', 'success'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => addToast({ message: `This is a ${sev} notification (simulated).`, severity: sev })}
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--navy)',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '8px 16px',
                fontSize: '13px',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              Trigger {sev}
            </button>
          ))}
        </div>
      </Section>

      {/* Colour Palette */}
      <Section title="Government White Palette Tokens">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {[
            { name: 'BG (#F4F7FB)', color: '#F4F7FB' },
            { name: 'Surface (#FFFFFF)', color: '#FFFFFF' },
            { name: 'Surface-2 (#EEF3F9)', color: '#EEF3F9' },
            { name: 'Border (#D6DFEA)', color: '#D6DFEA' },
            { name: 'Navy (#0B2545)', color: '#0B2545' },
            { name: 'Primary (#1D4ED8)', color: '#1D4ED8' },
            { name: 'OK (#15803D)', color: '#15803D' },
            { name: 'Teal (#0F766E)', color: '#0F766E' },
            { name: 'Warn (#B45309)', color: '#B45309' },
            { name: 'Danger (#B91C1C)', color: '#B91C1C' },
            { name: 'Text (#0F1B2D)', color: '#0F1B2D' },
            { name: 'Muted (#5B6B80)', color: '#5B6B80' },
          ].map(({ name, color }) => (
            <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '10px', background: color, border: '1px solid #D6DFEA', boxShadow: 'var(--shadow-card)' }} />
              <div style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 600, textAlign: 'center', maxWidth: '80px' }}>{name}</div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
