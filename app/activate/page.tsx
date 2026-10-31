'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTripStore } from '@/store/tripStore';
import { useSimulationStore } from '@/store/simulationStore';
import { useJunctionStore } from '@/store/junctionStore';
import { useAuditStore } from '@/store/auditStore';
import { useBroadcast } from '@/hooks/useBroadcast';
import { createAuditEvent } from '@/lib/engine/audit';
import { Badge } from '@/components/ui/Badge';
import { RoadUserAlertPreview } from '@/components/activation/RoadUserAlertPreview';
import { JUNCTIONS, ORIGIN, DESTINATION } from '@/lib/data/corridor';
import Link from 'next/link';

export default function ActivatePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Form State
  const [dispatcherId, setDispatcherId] = useState('CMD-01');
  const [incidentCode, setIncidentCode] = useState('INC-2024-0731');
  const [authorized, setAuthorized] = useState(true);

  const [vehicleId, setVehicleId] = useState('MH-12-AMB-108');
  const [priority, setPriority] = useState<'Critical' | 'High' | 'Medium'>('Critical');

  const { setTrip, activateTrip } = useTripStore();
  const { setPlaying, reset: resetSim } = useSimulationStore();
  const { reset: resetJunctions } = useJunctionStore();
  const { addRawEvent, reset: resetAudit } = useAuditStore();
  const { broadcast } = useBroadcast();

  const handleActivate = () => {
    // 1. Reset all state to clean beginning
    resetSim();
    resetJunctions();
    resetAudit();

    // 2. Set updated trip parameters
    setTrip({
      vehicleId,
      vehicleLabel: `${vehicleId} (simulated)`,
      priority,
      incidentCode,
      dispatcherId,
      status: 'Active',
      activatedAt: 0,
    });

    activateTrip(0);

    // 3. Log initial activation event
    const event = createAuditEvent('TRIP_ACTIVATED', `Dispatcher (${dispatcherId})`, 0, {
      vehicleId,
      priority,
      incidentCode,
      corridorJunctions: JUNCTIONS.map((j) => j.id),
    });

    addRawEvent(event);

    // 4. Start simulation playback
    setPlaying(true);

    broadcast({ type: 'AUDIT_EVENT', payload: event });
    broadcast({ type: 'SIM_CONTROL', payload: { action: 'play' } });

    // 5. Navigate to Command Centre
    router.push('/command');
  };

  const steps = [
    { num: 1, label: 'Authorization' },
    { num: 2, label: 'Vehicle & Priority' },
    { num: 3, label: 'Corridor Route' },
    { num: 4, label: 'Review & Activate' },
  ];

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 52px)',
        background: 'var(--bg-base)',
        color: 'var(--text)',
        padding: '32px 16px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: '640px' }}>
        {/* Header Breadcrumb */}
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/command" style={{ color: 'var(--teal)', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>
            ← Back to Command Centre
          </Link>
          <Badge variant="amber" mono>SIMULATED MISSION</Badge>
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 8px 0' }}>
          Activate Emergency Corridor Mission
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 28px 0', lineHeight: 1.5 }}>
          Four-stage verification protocol for pre-clearing traffic signal corridors. All downstream operators will receive automated task schedules based on real-time vehicle ETAs.
        </p>

        {/* Stepper Progress Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          {steps.map((s, idx) => (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center', flex: idx < steps.length - 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: step === s.num ? '#1D4ED8' : step > s.num ? '#DCFCE7' : '#EEF3F9',
                    border: `1.5px solid ${step === s.num ? '#1D4ED8' : step > s.num ? '#86EFAC' : '#D6DFEA'}`,
                    color: step === s.num ? '#FFFFFF' : step > s.num ? '#15803D' : '#5B6B80',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono, monospace)',
                  }}
                >
                  {step > s.num ? '✓' : s.num}
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: step === s.num ? 700 : 500,
                    color: step === s.num ? 'var(--text)' : 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {s.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: '2px',
                    background: step > s.num ? 'var(--teal)' : 'var(--border)',
                    margin: '0 12px 18px 12px',
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Incident & Authorization */}
        {step === 1 && (
          <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px 0' }}>
              Step 1: Dispatcher Credentials & Incident
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Authorised Dispatcher ID
              </label>
              <input
                type="text"
                value={dispatcherId}
                onChange={(e) => setDispatcherId(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-raised)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: 'var(--text)',
                  fontSize: '13px',
                  fontFamily: 'var(--font-mono, monospace)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Incident Authorization Code
              </label>
              <input
                type="text"
                value={incidentCode}
                onChange={(e) => setIncidentCode(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-raised)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: 'var(--text)',
                  fontSize: '13px',
                  fontFamily: 'var(--font-mono, monospace)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: '#F8FAFC',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '24px',
              }}
            >
              <input
                type="checkbox"
                id="authCheck"
                checked={authorized}
                onChange={(e) => setAuthorized(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--teal)' }}
              />
              <label htmlFor="authCheck" style={{ fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                I confirm this emergency mission is authorized by the Regional Emergency Medical Transport Directorate.
              </label>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!authorized || !incidentCode}
              style={{
                width: '100%',
                background: authorized ? '#1D4ED8' : '#EEF3F9',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                color: authorized ? '#FFFFFF' : '#5B6B80',
                fontWeight: 700,
                fontSize: '13px',
                cursor: authorized ? 'pointer' : 'not-allowed',
                boxShadow: authorized ? '0 2px 8px rgba(29, 78, 216, 0.25)' : 'none',
              }}
            >
              Continue to Vehicle Selection →
            </button>
          </div>
        )}

        {/* Step 2: Vehicle & Priority */}
        {step === 2 && (
          <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px 0' }}>
              Step 2: Vehicle & Mission Priority
            </h2>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Assigned Emergency Vehicle
              </label>
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-raised)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: 'var(--text)',
                  fontSize: '13px',
                  fontFamily: 'var(--font-mono, monospace)',
                  outline: 'none',
                }}
              >
                <option value="MH-12-AMB-108">MH-12-AMB-108 (Advanced Life Support - ALS)</option>
                <option value="MH-12-AMB-204">MH-12-AMB-204 (Basic Life Support - BLS)</option>
                <option value="MH-12-AMB-310">MH-12-AMB-310 (Neonatal Transport Unit)</option>
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Corridor Pre-emption Priority
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {(['Critical', 'High', 'Medium'] as const).map((p) => {
                  const isSel = priority === p;
                  const color = p === 'Critical' ? 'var(--danger)' : p === 'High' ? 'var(--amber)' : 'var(--info)';
                  return (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      style={{
                        background: isSel ? `${color}25` : 'var(--bg-raised)',
                        border: `1.5px solid ${isSel ? color : 'var(--border)'}`,
                        borderRadius: '8px',
                        padding: '12px 8px',
                        color: isSel ? color : 'var(--text-muted)',
                        fontWeight: isSel ? 700 : 500,
                        fontSize: '13px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 150ms',
                      }}
                    >
                      <div>{p === 'Critical' ? '🚨' : p === 'High' ? '⚠️' : 'ℹ️'}</div>
                      <div style={{ marginTop: '4px' }}>{p}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  background: 'none',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '12px 18px',
                  color: 'var(--text-muted)',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                style={{
                  flex: 1,
                  background: 'var(--teal)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#0A1222',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Inspect Corridor Route →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Route & Junction Corridor */}
        {step === 3 && (
          <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px 0' }}>
              Step 3: Pune City Corridor Alignment
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: 'var(--teal)' }}>📍 Origin:</span>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Deccan Gymkhana (simulated)</span>
              </div>
              <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: 'var(--danger)' }}>🏥 Destination:</span>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Hospital – Karve Nagar (simulated)</span>
              </div>
            </div>

            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Coordinated Junction Sequence (5 Intersections · 5.2 km)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '24px' }}>
              {JUNCTIONS.map((j, idx) => (
                <div
                  key={j.id}
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Badge variant="teal" mono>{j.id}</Badge>
                    <span>{j.name}</span>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono, monospace)' }}>
                    +{j.distanceFromOriginM}m · {j.leadTime}s lead
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setStep(2)}
                style={{
                  background: 'none',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '12px 18px',
                  color: 'var(--text-muted)',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(4)}
                style={{
                  flex: 1,
                  background: 'var(--teal)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#0A1222',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Review & Activate Corridor →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Final Activation */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px 0' }}>
                Step 4: Mission Pre-Flight Summary
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Assigned Ambulance</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>
                    {vehicleId}
                  </div>
                </div>
                <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Corridor Priority</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: priority === 'Critical' ? 'var(--danger)' : 'var(--amber)', marginTop: '2px' }}>
                    {priority}
                  </div>
                </div>
                <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Distance & ETD</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--teal)', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>
                    5,200m (~10 mins)
                  </div>
                </div>
                <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Active Signal Nodes</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>
                    5 Pune Intersections
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setStep(3)}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '14px 18px',
                    color: 'var(--text-muted)',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  ← Back
                </button>
                <button
                  onClick={handleActivate}
                  style={{
                    flex: 1,
                    background: 'var(--danger)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '14px',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '15px',
                    cursor: 'pointer',
                    boxShadow: '0 0 24px rgba(248, 113, 113, 0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <span>🚨</span>
                  <span>ACTIVATE EMERGENCY TRIP</span>
                </button>
              </div>
            </div>

            {/* Road User Alert Preview */}
            <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '16px', textAlign: 'center' }}>
                Downstream Citizen Alert Preview
              </div>
              <RoadUserAlertPreview junctionName="Deccan Gymkhana Chowk" etaSeconds={52} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
