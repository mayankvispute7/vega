'use client';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { StatusChip } from '@/components/ui/StatusChip';
import { JUNCTIONS } from '@/lib/data/corridor';
import { useJunctionStore } from '@/store/junctionStore';

interface AffectedJunctionsPanelProps {
  cancelledJunctionIds: string[];
  updatedJunctionIds: string[];
}

export function AffectedJunctionsPanel({ cancelledJunctionIds, updatedJunctionIds }: AffectedJunctionsPanelProps) {
  const { tasks } = useJunctionStore();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div
      style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '20px',
      }}
    >
      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '14px' }}>
        Affected Corridor Junction Nodes
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
      >
        {JUNCTIONS.map((j) => {
          const task = tasks[j.id];
          const isCancelled = cancelledJunctionIds.includes(j.id) || task?.status === 'Blocked';
          const isUpdated = updatedJunctionIds.includes(j.id);

          return (
            <motion.div
              key={j.id}
              variants={itemVariants}
              style={{
                background: isCancelled ? 'rgba(248, 113, 113, 0.06)' : 'var(--bg-raised)',
                border: `1px solid ${
                  isCancelled ? 'rgba(248, 113, 113, 0.3)' : isUpdated ? 'var(--teal)' : 'var(--border)'
                }`,
                borderRadius: '10px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                opacity: isCancelled ? 0.65 : 1,
                transition: 'all 200ms',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    background: isCancelled ? 'var(--danger)' : isUpdated ? 'var(--teal)' : 'var(--bg-panel)',
                    color: isCancelled || isUpdated ? '#FFFFFF' : 'var(--text)',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono, monospace)',
                  }}
                >
                  {j.id}
                </span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                    {j.name}
                  </div>
                  {isCancelled && (
                    <div style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '2px' }}>
                      Cancelled — Roadblock bypass detour
                    </div>
                  )}
                  {isUpdated && (
                    <div style={{ fontSize: '11px', color: 'var(--teal)', marginTop: '2px' }}>
                      Re-sequenced with updated detour arrival ETA
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isCancelled ? (
                  <Badge variant="danger" mono>CANCELLED</Badge>
                ) : isUpdated ? (
                  <Badge variant="teal" mono>UPDATED</Badge>
                ) : (
                  <Badge variant="muted" mono>UNCHANGED</Badge>
                )}
                <StatusChip status={task?.status ?? 'Scheduled'} size="sm" />
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
