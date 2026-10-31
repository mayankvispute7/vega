'use client';
import { useSimulationStore } from '@/store/simulationStore';
import { useJunctionStore } from '@/store/junctionStore';
import { useTripStore } from '@/store/tripStore';
import { useAuditStore } from '@/store/auditStore';
import { useSimClock } from '@/hooks/useSimClock';
import { tick } from '@/lib/engine/scheduler';
import { StatusChip } from '@/components/ui/StatusChip';
import { Badge } from '@/components/ui/Badge';
import { formatSeconds } from '@/hooks/useCountdown';
import { JUNCTIONS } from '@/lib/data/corridor';
import Link from 'next/link';

export default function EngineDebugPage() {
  const { playing, speed, simTime, setPlaying, setSpeed, reset: resetSim } = useSimulationStore();
  const { trip, vehicle, setVehicle, reset: resetTrip } = useTripStore();
  const { tasks, patchTasks, reset: resetJunctions } = useJunctionStore();
  const { events, addRawEvents, reset: resetAudit } = useAuditStore();

  useSimClock((currentTime) => {
    const durationMs = trip.estimatedDurationS * 1000;
    const ratio = Math.min(1, currentTime / durationMs);
    const updatedVehicle = {
      ...vehicle,
      progressRatio: ratio,
      speedKmh: ratio >= 1 ? 0 : 38,
      lastUpdatedAt: currentTime,
    };
    setVehicle(updatedVehicle);

    const { updatedTasks, newEvents } = tick(currentTime, tasks, updatedVehicle, events);
    patchTasks(updatedTasks);
    if (newEvents.length > 0) {
      addRawEvents(newEvents);
    }
  });

  const handleReset = () => {
    resetSim();
    resetTrip();
    resetJunctions();
    resetAudit();
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: 'var(--text)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>VEGA Coordination Engine Debug</h1>
            <Badge variant="teal" mono>v1.0</Badge>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            Live inspection of task state machine, ETA engine, scheduler ticks, and audit log stream.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link
            href="/command"
            style={{
              background: 'rgba(45, 212, 191, 0.1)',
              border: '1px solid rgba(45, 212, 191, 0.3)',
              borderRadius: '6px',
              padding: '6px 14px',
              color: 'var(--teal)',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            ← Back to Command Centre
          </Link>
          <Link
            href="/dev/ui-kit"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '6px 14px',
              color: 'var(--text-muted)',
              fontSize: '13px',
              textDecoration: 'none',
            }}
          >
            UI Kit
          </Link>
        </div>
      </div>

      {/* Engine Controls Bar */}
      <div
        style={{
          background: 'var(--bg-raised)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => setPlaying(!playing)}
          style={{
            background: playing ? 'rgba(248, 113, 113, 0.2)' : 'rgba(45, 212, 191, 0.2)',
            border: `1px solid ${playing ? 'var(--danger)' : 'var(--teal)'}`,
            borderRadius: '6px',
            color: playing ? 'var(--danger)' : 'var(--teal)',
            padding: '8px 20px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {playing ? '⏸ Pause Engine' : '▶ Run Engine'}
        </button>

        <button
          onClick={handleReset}
          style={{
            background: 'none',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            color: 'var(--text-muted)',
            padding: '8px 16px',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          ↺ Reset Engine State
        </button>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Speed:</span>
          {[1, 2, 4, 8].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s as any)}
              style={{
                background: speed === s ? 'rgba(45, 212, 191, 0.2)' : 'none',
                border: `1px solid ${speed === s ? 'var(--teal)' : 'var(--border)'}`,
                borderRadius: '6px',
                color: speed === s ? 'var(--teal)' : 'var(--text-muted)',
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: speed === s ? 700 : 400,
                cursor: 'pointer',
              }}
            >
              {s}×
            </button>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Sim Clock: </span>
            <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: 'var(--teal)' }}>
              {formatSeconds(Math.round(simTime / 1000))} ({(simTime / 1000).toFixed(1)}s)
            </span>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Vehicle Progress: </span>
            <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700 }}>
              {(vehicle.progressRatio * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Junction Tasks Table */}
      <div
        style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          overflow: 'hidden',
          marginBottom: '24px',
        }}
      >
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '13px' }}>
          Corridor Tasks State (5 Junctions)
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '10px 16px' }}>ID</th>
              <th style={{ padding: '10px 16px' }}>Junction Name</th>
              <th style={{ padding: '10px 16px' }}>Status</th>
              <th style={{ padding: '10px 16px' }}>ETA</th>
              <th style={{ padding: '10px 16px' }}>Lead Time</th>
              <th style={{ padding: '10px 16px' }}>Escalation</th>
              <th style={{ padding: '10px 16px' }}>Decision Support</th>
              <th style={{ padding: '10px 16px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {JUNCTIONS.map((j) => {
              const task = tasks[j.id];
              return (
                <tr key={j.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700 }}>
                    {j.id}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{j.name}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <StatusChip status={task?.status ?? 'Scheduled'} size="sm" />
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono, monospace)' }}>
                    {task?.etaSeconds ? `${Math.round(task.etaSeconds)}s` : '0s'}
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-muted)' }}>
                    {j.leadTime}s
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {task?.escalationLevel && task.escalationLevel > 0 ? (
                      <Badge variant="amber" mono>Level {task.escalationLevel}</Badge>
                    ) : (
                      <span style={{ color: 'var(--text-dim)' }}>None</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {task?.decisionSupport ? (
                      <span style={{ color: 'var(--amber)', fontSize: '11px' }}>
                        {task.decisionSupport.outcome ?? 'Pending'}: {task.decisionSupport.action.slice(0, 30)}...
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-dim)' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <Link
                      href={`/junction/${j.id}`}
                      target="_blank"
                      style={{ color: 'var(--teal)', textDecoration: 'none', fontWeight: 600 }}
                    >
                      Console ↗
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Audit Log Stream */}
      <div
        style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
          <span>Live Engine Audit Log Stream ({events.length} Events)</span>
          <span style={{ color: 'var(--text-dim)', fontSize: '11px', fontFamily: 'var(--font-mono, monospace)' }}>Append-only</span>
        </div>
        <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
          {events.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No events generated yet. Start the engine to trigger corridor events.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '11px' }}>
              <tbody>
                {events.slice(-20).reverse().map((ev) => (
                  <tr key={ev.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '8px 16px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--teal)', width: '70px' }}>
                      +{formatSeconds(Math.round(ev.simTimestamp / 1000))}
                    </td>
                    <td style={{ padding: '8px 16px', fontWeight: 700, width: '180px' }}>
                      {ev.type}
                    </td>
                    <td style={{ padding: '8px 16px', color: 'var(--text-muted)', width: '160px' }}>
                      {ev.actor} {ev.junctionId ? `[${ev.junctionId}]` : ''}
                    </td>
                    <td style={{ padding: '8px 16px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-dim)' }}>
                      {JSON.stringify(ev.payload)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
