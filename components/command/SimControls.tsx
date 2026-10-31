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
        background: 'rgba(10, 18, 34, 0.85)',
        backdropFilter: 'blur(8px)',
        flexShrink: 0,
      }}
    >
      <Badge variant="muted" mono>
        SIM CONTROLS
      </Badge>

      <button
        onClick={handleReset}
        title="Reset demo to initial state"
        style={{
          background: 'none',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '5px 12px',
          fontSize: '12px',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          transition: 'all 150ms',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--text)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
        aria-label="Reset demo"
      >
        <span>↺</span>
        <span>Reset</span>
      </button>

      <button
        onClick={() => setPlaying(!playing)}
        style={{
          background: playing ? 'rgba(248, 113, 113, 0.15)' : 'rgba(45, 212, 191, 0.15)',
          border: `1px solid ${playing ? 'rgba(248, 113, 113, 0.35)' : 'rgba(45, 212, 191, 0.35)'}`,
          borderRadius: '6px',
          color: playing ? 'var(--danger)' : 'var(--teal)',
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
        <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginRight: '2px' }}>Speed:</span>
        {speeds.map((s) => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            style={{
              background: speed === s ? 'rgba(45, 212, 191, 0.18)' : 'none',
              border: `1px solid ${speed === s ? 'rgba(45, 212, 191, 0.4)' : 'var(--border)'}`,
              borderRadius: '6px',
              color: speed === s ? 'var(--teal)' : 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: speed === s ? 700 : 400,
              fontFamily: 'var(--font-mono, monospace)',
              transition: 'all 150ms',
            }}
            aria-label={`Set simulation speed to ${s}x`}
            aria-pressed={speed === s}
          >
            {s}×
          </button>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      <span
        style={{
          fontSize: '11px',
          color: 'var(--text-dim)',
          fontFamily: 'var(--font-mono, monospace)',
          letterSpacing: '0.04em',
        }}
      >
        SIMULATED DATA · NOT FOR OPERATIONAL DEPLOYMENT
      </span>
    </div>
  );
}
