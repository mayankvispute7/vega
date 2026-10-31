'use client';
import { useState } from 'react';
import { SCENARIOS } from '@/lib/data/scenarios';
import type { ScenarioName } from '@/lib/types';
import { BenchmarkChart } from '@/components/sim/BenchmarkChart';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

export default function SimBenchmarkPage() {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioName>('VEGA-Assisted');

  const scenario = SCENARIOS.find((s) => s.name === selectedScenario) ?? SCENARIOS[1];

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 92px)',
        background: '#F4F7FB',
        color: 'var(--text)',
        padding: '24px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Link href="/command" style={{ color: '#1D4ED8', fontSize: '13px', textDecoration: 'none', fontWeight: 700 }}>
                ← Command Centre
              </Link>
              <span style={{ color: '#CBD5E1' }}>/</span>
              <span style={{ fontSize: '13px', color: '#5B6B80', fontWeight: 600 }}>Simulation Benchmark</span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--navy)', margin: 0 }}>
              Corridor Performance Benchmarks
            </h1>
          </div>
          <Badge variant="simulated" mono>ALL DATA SIMULATED</Badge>
        </div>

        {/* Scenario Tab Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            background: '#FFFFFF',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '6px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {SCENARIOS.map((s) => {
            const isSel = selectedScenario === s.name;
            const activeBg =
              s.name === 'VEGA-Assisted'
                ? '#DCFCE7'
                : s.name === 'Baseline'
                ? '#FEF3C7'
                : '#FEE2E2';
            const activeColor =
              s.name === 'VEGA-Assisted'
                ? '#15803D'
                : s.name === 'Baseline'
                ? '#B45309'
                : '#B91C1C';
            const activeBorder =
              s.name === 'VEGA-Assisted'
                ? '#86EFAC'
                : s.name === 'Baseline'
                ? '#FDE68A'
                : '#FECACA';

            return (
              <button
                key={s.name}
                onClick={() => setSelectedScenario(s.name)}
                style={{
                  flex: 1,
                  background: isSel ? activeBg : '#F8FAFC',
                  border: `1.5px solid ${isSel ? activeBorder : '#E2E8F0'}`,
                  borderRadius: '6px',
                  padding: '10px 16px',
                  color: isSel ? activeColor : '#5B6B80',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 150ms',
                }}
              >
                {s.name} Protocol
              </button>
            );
          })}
        </div>

        {/* Selected Scenario Narrative Card */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '16px 20px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Scenario Protocol Definition
            </span>
            <span style={{ fontSize: '13px', fontWeight: 800, fontFamily: 'var(--font-mono, monospace)', color: '#0F766E' }}>
              Est. Transit: {Math.round(scenario.totalJourneyTimeS / 60)} mins ({scenario.totalJourneyTimeS}s)
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#5B6B80', margin: '0 0 10px 0', lineHeight: 1.5 }}>
            {scenario.description}
          </p>
          {(() => {
            const acks = scenario.junctionMetrics.map((m) => m.ackTimeS).filter((t): t is number => t !== null);
            const avgAck = acks.length > 0 ? (acks.reduce((a, b) => a + b, 0) / acks.length).toFixed(0) : '--';
            const totalWait = scenario.junctionMetrics.reduce((acc, m) => acc + m.waitTimeS, 0);
            const totalUnresolved = scenario.junctionMetrics.reduce((acc, m) => acc + m.unresolvedAlerts, 0);
            return (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <Badge variant="teal">Avg Ack Time: {avgAck}s</Badge>
                <Badge variant={totalWait <= 30 ? 'teal' : 'amber'}>Total Signal Delay: {totalWait}s</Badge>
                <Badge variant={totalUnresolved === 0 ? 'teal' : 'danger'}>Unresolved Alerts: {totalUnresolved}</Badge>
                <Badge variant="muted">5 Intersections</Badge>
              </div>
            );
          })()}
        </div>

        {/* Charts Container */}
        <BenchmarkChart selectedScenario={selectedScenario} />
      </div>
    </div>
  );
}
