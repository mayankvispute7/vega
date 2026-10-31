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
        minHeight: 'calc(100vh - 52px)',
        background: 'var(--bg-base)',
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
              <Link href="/command" style={{ color: 'var(--teal)', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>
                ← Command Centre
              </Link>
              <span style={{ color: 'var(--border)' }}>/</span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Simulation Benchmark</span>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>
              Corridor Performance Benchmarks
            </h1>
          </div>
          <Badge variant="amber" mono>ALL DATA SIMULATED</Badge>
        </div>

        {/* Scenario Tab Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            background: 'var(--bg-panel)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '6px',
          }}
        >
          {SCENARIOS.map((s) => {
            const isSel = selectedScenario === s.name;
            const color =
              s.name === 'VEGA-Assisted'
                ? 'var(--teal)'
                : s.name === 'Baseline'
                ? 'var(--amber)'
                : 'var(--danger)';

            return (
              <button
                key={s.name}
                onClick={() => setSelectedScenario(s.name)}
                style={{
                  flex: 1,
                  background: isSel ? `${color}25` : 'none',
                  border: `1px solid ${isSel ? color : 'transparent'}`,
                  borderRadius: '6px',
                  padding: '10px 16px',
                  color: isSel ? color : 'var(--text-muted)',
                  fontSize: '13px',
                  fontWeight: isSel ? 700 : 500,
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
            background: 'var(--bg-raised)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '16px 20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Scenario Protocol Definition
            </span>
            <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono, monospace)', color: 'var(--text)' }}>
              Est. Transit: {Math.round(scenario.totalJourneyTimeS / 60)} mins ({scenario.totalJourneyTimeS}s)
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text)', margin: 0, lineHeight: 1.5 }}>
            {scenario.description}
          </p>
        </div>

        {/* Charts */}
        <BenchmarkChart selectedScenario={selectedScenario} />
      </div>
    </div>
  );
}
