'use client';
import { useState } from 'react';
import { useRerouteStore } from '@/store/rerouteStore';
import { RouteComparison } from '@/components/exceptions/RouteComparison';
import { AffectedJunctionsPanel } from '@/components/exceptions/AffectedJunctionsPanel';
import { RoadblockModal } from '@/components/exceptions/RoadblockModal';
import { Badge } from '@/components/ui/Badge';
import { useBroadcast } from '@/hooks/useBroadcast';
import Link from 'next/link';

export default function ExceptionsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { proposal } = useRerouteStore();
  const { broadcast } = useBroadcast();

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 52px)',
        background: 'var(--bg-base)',
        color: 'var(--text)',
        padding: '24px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Link href="/command" style={{ color: 'var(--teal)', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>
                ← Command Centre
              </Link>
              <span style={{ color: 'var(--border)' }}>/</span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Exceptions & Detours</span>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>
              Corridor Exception & Reroute Hub
            </h1>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            style={{
              background: 'var(--danger)',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 18px',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 0 16px rgba(248, 113, 113, 0.4)',
              transition: 'all 150ms',
            }}
          >
            <span>🚧</span>
            <span>Report Roadblock Incident</span>
          </button>
        </div>

        {/* Content Area */}
        {proposal ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <RouteComparison proposal={proposal} />
            <AffectedJunctionsPanel
              cancelledJunctionIds={['J3']}
              updatedJunctionIds={['J4', 'J5']}
            />
          </div>
        ) : (
          <div
            style={{
              background: 'var(--bg-panel)',
              border: '1px dashed var(--border)',
              borderRadius: '16px',
              padding: '48px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🟢</div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text)' }}>
              Primary Corridor Operating Normally
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '480px', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              All 5 junction segments are clear with zero active obstructions reported. To test the Dijkstra dynamic reroute engine, click below to simulate an incident near J3 (Alka Talkies).
            </p>
            <button
              onClick={() => setModalOpen(true)}
              style={{
                background: 'rgba(255, 190, 92, 0.15)',
                border: '1.5px solid var(--amber)',
                borderRadius: '8px',
                padding: '12px 24px',
                color: 'var(--amber)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>⚡</span>
              <span>Simulate Roadblock at J3 (Alka Talkies)</span>
            </button>
          </div>
        )}
      </div>

      <RoadblockModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
