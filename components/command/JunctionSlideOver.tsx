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
            width: '350px',
            background: '#FFFFFF',
            borderLeft: '1px solid #D6DFEA',
            boxShadow: '-4px 0 24px rgba(11, 37, 69, 0.12)',
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
              borderBottom: '1px solid #D6DFEA',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              background: '#EEF3F9',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span
                  style={{
                    background: '#1D4ED8',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono, monospace)',
                  }}
                >
                  {junction.id}
                </span>
                <span style={{ fontSize: '11px', color: '#5B6B80', fontWeight: 600 }}>
                  {junction.distanceFromOriginM}m along corridor
                </span>
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0B2545', margin: 0 }}>
                {junction.name}
              </h2>
            </div>
            <button
              onClick={() => selectJunction(null)}
              style={{
                background: '#FFFFFF',
                border: '1px solid #D6DFEA',
                borderRadius: '6px',
                color: '#5B6B80',
                cursor: 'pointer',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: 700,
              }}
              aria-label="Close slide-over"
            >
              ✕
            </button>
          </div>

          {/* Body Content */}
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
            {/* Status & Countdown banner */}
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #D6DFEA',
                borderRadius: '10px',
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: '#5B6B80', fontWeight: 600, marginBottom: '4px' }}>
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
                  <div style={{ fontSize: '10px', color: '#5B6B80', fontWeight: 600, marginTop: '2px' }}>ETA</div>
                </div>
              )}
            </div>

            {/* Operator Card */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #D6DFEA',
                borderRadius: '10px',
                padding: '14px',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#0B2545',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '8px',
                }}
              >
                Assigned Traffic Officer
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F1B2D', marginBottom: '2px' }}>
                {operator?.name ?? 'Assigned Officer'}
              </div>
              <div style={{ fontSize: '12px', color: '#5B6B80', marginBottom: '8px' }}>
                {operator?.phone} · Role: {operator?.role ?? 'operator'}
              </div>
              <div style={{ fontSize: '11px', color: '#0369A1', background: '#E0F2FE', padding: '6px 8px', borderRadius: '6px', fontWeight: 500 }}>
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
                  background: '#FFFFFF',
                  border: '1px solid #D6DFEA',
                  borderRadius: '8px',
                  padding: '10px',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div style={{ fontSize: '11px', color: '#5B6B80', fontWeight: 600 }}>Required Lead Time</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F766E', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>
                  {junction.leadTime}s
                </div>
              </div>
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #D6DFEA',
                  borderRadius: '8px',
                  padding: '10px',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div style={{ fontSize: '11px', color: '#5B6B80', fontWeight: 600 }}>Current Queue</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#B45309', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>
                  ~{junction.queueLength} vehicles
                </div>
              </div>
            </div>

            {/* Pedestrian phase info */}
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #D6DFEA',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '12px',
                color: '#5B6B80',
              }}
            >
              Pedestrian Crossing Phase:{' '}
              <strong style={{ color: junction.hasPedestrianPhase ? '#B45309' : '#0F1B2D' }}>
                {junction.hasPedestrianPhase ? 'Active (Clearance needed)' : 'None'}
              </strong>
            </div>

            {/* Decision Support recommendation (if available) */}
            {task?.decisionSupport && (
              <div
                style={{
                  background: '#FEF3C7',
                  border: '1px solid #FCD34D',
                  borderRadius: '8px',
                  padding: '12px',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#92400E', marginBottom: '4px' }}>
                  💡 DECISION SUPPORT RECOMMENDATION
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#78350F', marginBottom: '4px' }}>
                  {task.decisionSupport.action}
                </div>
                <div style={{ fontSize: '11px', color: '#92400E' }}>
                  {task.decisionSupport.rationale}
                </div>
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div style={{ padding: '16px', borderTop: '1px solid #D6DFEA', background: '#F8FAFC' }}>
            <Link
              href={`/junction/${junction.id}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                background: '#1D4ED8',
                color: '#FFFFFF',
                borderRadius: '8px',
                padding: '10px 16px',
                fontSize: '13px',
                fontWeight: 700,
                textAlign: 'center',
                textDecoration: 'none',
                boxShadow: '0 2px 6px rgba(29, 78, 216, 0.25)',
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
