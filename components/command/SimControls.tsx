'use client';
import { Badge } from '@/components/ui/Badge';
import { useSimulationStore } from '@/store/simulationStore';
import { useTripStore } from '@/store/tripStore';
import { useJunctionStore } from '@/store/junctionStore';
import { useAuditStore } from '@/store/auditStore';
import { useUiStore } from '@/store/uiStore';
import { useRerouteStore } from '@/store/rerouteStore';

export function SimControls() {
  const { playing, speed, setPlaying, setSpeed, reset: resetSim } = useSimulationStore();
  const { reset: resetTrip } = useTripStore();
  const { reset: resetJunctions } = useJunctionStore();
  const { reset: resetAudit } = useAuditStore();
  const { reset: resetUi } = useUiStore();
  const { reset: resetReroute } = useRerouteStore();

  const handleReset = () => {
    resetSim();
    resetTrip();
    resetJunctions();
    resetAudit();
    resetUi();
    resetReroute();
  };

  const speeds = [1, 2, 4, 8] as const;

  return (
    <div
      style={{
        height: '48px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '0 16px',
        background: '#FFFFFF',
        flexShrink: 0,
        boxShadow: '0 -1px 3px rgba(11, 37, 69, 0.04)',
      }}
    >
      <Badge variant="muted" mono>
        SIM CONTROLS
      </Badge>

      <button
        onClick={handleReset}
        title="Reset demo to initial state"
        style={{
          background: '#FFFFFF',
          border: '1px solid #D6DFEA',
          borderRadius: '6px',
          color: '#0B2545',
          cursor: 'pointer',
          padding: '5px 12px',
          fontSize: '12px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          transition: 'all 150ms',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#1D4ED8')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#D6DFEA')}
        aria-label="Reset demo"
      >
        <span>↺</span>
        <span>Reset</span>
      </button>

      <button
        onClick={() => setPlaying(!playing)}
        style={{
          background: playing ? '#FEE2E2' : '#DCFCE7',
          border: `1.5px solid ${playing ? '#FECACA' : '#86EFAC'}`,
          borderRadius: '6px',
          color: playing ? '#B91C1C' : '#15803D',
          cursor: 'pointer',
          padding: '5px 16px',
          fontSize: '13px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 150ms',
        }}
        aria-label={playing ? 'Pause simulation' : 'Play simulation'}
      >
        <span>{playing ? '⏸' : '▶'}</span>
        <span>{playing ? 'Pause' : 'Play'}</span>
      </button>

      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: '#5B6B80', marginRight: '4px', fontWeight: 600 }}>Speed:</span>
        {speeds.map((s) => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            style={{
              background: speed === s ? '#1D4ED8' : '#EEF3F9',
              border: `1px solid ${speed === s ? '#1D4ED8' : '#D6DFEA'}`,
              borderRadius: '5px',
              color: speed === s ? '#FFFFFF' : '#0B2545',
              cursor: 'pointer',
              padding: '3px 8px',
              fontSize: '11px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono, monospace)',
              transition: 'all 120ms',
            }}
          >
            {s}×
          </button>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ fontSize: '11px', color: '#92400E', fontWeight: 600 }}>
        SIMULATED DATA · NOT FOR OPERATIONAL DEPLOYMENT
      </div>
    </div>
  );
}
