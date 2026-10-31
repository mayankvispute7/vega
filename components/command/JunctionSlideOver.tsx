'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { StatusChip } from '@/components/ui/StatusChip';
import { CountdownRing } from '@/components/ui/CountdownRing';
import { useUiStore } from '@/store/uiStore';
import { useJunctionStore } from '@/store/junctionStore';
import { JUNCTIONS } from '@/lib/data/corridor';
import { getOperatorByJunction } from '@/lib/data/operators';
import { formatSeconds } from '@/hooks/useCountdown';
import Link from 'next/link';

export function JunctionSlideOver() {
  const { selectedJunctionId, selectJunction } = useUiStore();
  const { tasks } = useJunctionStore();

  const junction = JUNCTIONS.find((j) => j.id === selectedJunctionId);
  const task = junction ? tasks[junction.id] : undefined;
  const operator = junction ? getOperatorByJunction(junction.id) : undefined;
  const eta = task?.etaSeconds ?? 0;

  return (
    <AnimatePresence>
      {junction && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: '340px',
            background: 'rgba(18, 32, 58, 0.96)',
            backdropFilter: 'blur(16px)',
            borderLeft: '1px solid var(--border)',
            boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 30,
            overflowY: 'auto',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span
                  style={{
                    background: 'var(--teal)',
                    color: '#0A1222',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono, monospace)',
                  }}
                >
                  {junction.id}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {junction.distanceFromOriginM}m from start
                </span>
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                {junction.name}
              </h2>
            </div>
            <button
              onClick={() => selectJunction(null)}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: 'none',
                borderRadius: '6px',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
              }}
              aria-label="Close slide-over"
            >
              ✕
            </button>
          </div>

          {/* Body Content */}
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
            {/* Status & Countdown banner */}
            <div
              style={{
                background: 'var(--bg-raised)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Current Task Status
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <StatusChip status={task?.status ?? 'Scheduled'} size="md" />
                  {task?.escalationLevel && task.escalationLevel > 0 ? (
                    <Badge variant="amber" mono>
                      L{task.escalationLevel} Escalated
                    </Badge>
                  ) : null}
                </div>
              </div>
              {eta > 0 && (
                <div style={{ textAlign: 'center' }}>
                  <CountdownRing seconds={Math.round(eta)} maxSeconds={120} size={54} strokeWidth={4} />
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>ETA</div>
                </div>
              )}
            </div>

            {/* Operator Card */}
            <div
              style={{
                background: 'var(--bg-raised)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '14px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '8px',
                }}
              >
                Traffic Controller
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>
                {operator?.name ?? 'Assigned Officer'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                {operator?.phone} · Role: {operator?.role ?? 'operator'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--info)', background: 'rgba(96,165,250,0.08)', padding: '6px 8px', borderRadius: '6px' }}>
                Behavior Profile: {operator?.behaviour ?? 'Standard operator'}
              </div>
            </div>

            {/* Physical Intersection Specs */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
              }}
            >
              <div
                style={{
                  background: 'var(--bg-raised)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '10px',
                }}
              >
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Required Lead Time</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--teal)', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>
                  {junction.leadTime}s
                </div>
              </div>
              <div
                style={{
                  background: 'var(--bg-raised)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '10px',
                }}
              >
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Current Queue</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--amber)', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>
                  ~{junction.queueLength} vehicles
                </div>
              </div>
            </div>

            {/* Pedestrian phase info */}
            <div
              style={{
                background: 'rgba(10, 18, 34, 0.6)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '12px',
                color: 'var(--text-muted)',
              }}
            >
              Pedestrian Crossing Phase:{' '}
              <strong style={{ color: junction.hasPedestrianPhase ? 'var(--amber)' : 'var(--text)' }}>
                {junction.hasPedestrianPhase ? 'Active (Clearance needed)' : 'None'}
              </strong>
            </div>

            {/* Decision Support recommendation (if available) */}
            {task?.decisionSupport && (
              <div
                style={{
                  background: 'rgba(255, 190, 92, 0.08)',
                  border: '1px solid rgba(255, 190, 92, 0.3)',
                  borderRadius: '8px',
                  padding: '12px',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--amber)', marginBottom: '4px' }}>
                  💡 DECISION SUPPORT RECOMMENDATION
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text)', marginBottom: '6px' }}>
                  {task.decisionSupport.action}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {task.decisionSupport.rationale}
                </div>
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
            <Link
              href={`/junction/${junction.id}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                background: 'var(--teal)',
                color: '#0A1222',
                borderRadius: '8px',
                padding: '10px 16px',
                fontSize: '13px',
                fontWeight: 700,
                textAlign: 'center',
                textDecoration: 'none',
                boxShadow: '0 0 16px rgba(45, 212, 191, 0.35)',
              }}
            >
              Open Live Operator Console ↗
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
