'use client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { SCENARIOS } from '@/lib/data/scenarios';
import type { ScenarioName } from '@/lib/types';

interface BenchmarkChartProps {
  selectedScenario: ScenarioName;
}

export function BenchmarkChart({ selectedScenario }: BenchmarkChartProps) {
  // 1. Total Journey Time comparison across all 3 scenarios
  const journeyTimeData = SCENARIOS.map((s) => ({
    name: s.name,
    seconds: s.totalJourneyTimeS,
    minutes: (s.totalJourneyTimeS / 60).toFixed(1),
    fill: s.name === 'VEGA-Assisted' ? '#2DD4BF' : s.name === 'Baseline' ? '#FFBE5C' : '#F87171',
  }));

  // 2. Per-Junction Wait Time across scenarios
  const junctionWaitData = [
    {
      junction: 'J1 Deccan',
      Baseline: 45,
      'VEGA-Assisted': 0,
      Failure: 0,
    },
    {
      junction: 'J2 Sambhaji',
      Baseline: 90,
      'VEGA-Assisted': 12,
      Failure: 120,
    },
    {
      junction: 'J3 Alka',
      Baseline: 60,
      'VEGA-Assisted': 0,
      Failure: 90,
    },
    {
      junction: 'J4 Nal Stop',
      Baseline: 75,
      'VEGA-Assisted': 5,
      Failure: 85,
    },
    {
      junction: 'J5 Karve',
      Baseline: 30,
      'VEGA-Assisted': 0,
      Failure: 40,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Chart 1: Total Journey Time */}
      <div
        style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '20px',
        }}
      >
        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
          Simulated Corridor Transit Time (Seconds)
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Total duration from Deccan Gymkhana origin to Karve Nagar destination across simulated protocols.
        </div>

        <div style={{ width: '100%', height: '240px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={journeyTimeData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="name" stroke="#8FA3BF" tick={{ fontSize: 12 }} />
              <YAxis stroke="#8FA3BF" tick={{ fontSize: 11 }} unit="s" />
              <Tooltip
                contentStyle={{
                  background: 'rgba(18, 32, 58, 0.95)',
                  borderColor: 'rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#fff',
                }}
                formatter={(val: any) => [`${val}s (${(Number(val) / 60).toFixed(1)} mins)`, 'Journey Time']}
              />
              <Bar dataKey="seconds" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ fontSize: '11px', color: 'var(--text-dim)', textAlign: 'right', fontStyle: 'italic', marginTop: '8px' }}>
          * Simulated result — not a real-world measurement. Model assumes Pune road segment specifications.
        </div>
      </div>

      {/* Chart 2: Per-Junction Wait Time */}
      <div
        style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '20px',
        }}
      >
        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
          Intersection Signal Hold Delay by Node (Seconds)
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Simulated vehicle wait time experienced at each individual intersection.
        </div>

        <div style={{ width: '100%', height: '260px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={junctionWaitData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="junction" stroke="#8FA3BF" tick={{ fontSize: 11 }} />
              <YAxis stroke="#8FA3BF" tick={{ fontSize: 11 }} unit="s" />
              <Tooltip
                contentStyle={{
                  background: 'rgba(18, 32, 58, 0.95)',
                  borderColor: 'rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#fff',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="Baseline" fill="#FFBE5C" radius={[4, 4, 0, 0]} />
              <Bar dataKey="VEGA-Assisted" fill="#2DD4BF" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Failure" fill="#F87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ fontSize: '11px', color: 'var(--text-dim)', textAlign: 'right', fontStyle: 'italic', marginTop: '8px' }}>
          * Simulated result — not a real-world measurement.
        </div>
      </div>
    </div>
  );
}
