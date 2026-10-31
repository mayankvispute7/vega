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
    fill: s.name === 'VEGA-Assisted' ? '#0F766E' : s.name === 'Baseline' ? '#B45309' : '#B91C1C',
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Chart 1: Total Journey Time */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--navy)', marginBottom: '4px' }}>
          Simulated Corridor Transit Duration (Seconds)
        </div>
        <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '16px' }}>
          Total duration from Deccan Gymkhana origin to Karve Nagar destination across simulated protocols.
        </div>

        <div style={{ width: '100%', height: '240px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={journeyTimeData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D6DFEA" />
              <XAxis dataKey="name" stroke="#0B2545" tick={{ fontSize: 12, fontWeight: 600 }} />
              <YAxis stroke="#0B2545" tick={{ fontSize: 11, fontWeight: 600 }} unit="s" />
              <Tooltip
                contentStyle={{
                  background: '#FFFFFF',
                  border: '1px solid #D6DFEA',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#0F1B2D',
                  boxShadow: 'var(--shadow-panel)',
                }}
                formatter={(val: any) => [`${val}s (${(Number(val) / 60).toFixed(1)} mins)`, 'Journey Time']}
              />
              <Bar dataKey="seconds" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ fontSize: '11px', color: 'var(--muted)', textAlign: 'right', fontStyle: 'italic', marginTop: '8px' }}>
          * Simulated result — not a real-world measurement. Model assumes Pune road segment specifications.
        </div>
      </div>

      {/* Chart 2: Per-Junction Wait Time */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--navy)', marginBottom: '4px' }}>
          Intersection Signal Hold Delay by Node (Seconds)
        </div>
        <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '16px' }}>
          Simulated vehicle wait time experienced at each individual intersection.
        </div>

        <div style={{ width: '100%', height: '260px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={junctionWaitData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D6DFEA" />
              <XAxis dataKey="junction" stroke="#0B2545" tick={{ fontSize: 11, fontWeight: 600 }} />
              <YAxis stroke="#0B2545" tick={{ fontSize: 11, fontWeight: 600 }} unit="s" />
              <Tooltip
                contentStyle={{
                  background: '#FFFFFF',
                  border: '1px solid #D6DFEA',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#0F1B2D',
                  boxShadow: 'var(--shadow-panel)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px', color: '#0B2545', fontWeight: 600 }} />
              <Bar dataKey="Baseline" fill="#B45309" radius={[4, 4, 0, 0]} />
              <Bar dataKey="VEGA-Assisted" fill="#0F766E" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Failure" fill="#B91C1C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ fontSize: '11px', color: 'var(--muted)', textAlign: 'right', fontStyle: 'italic', marginTop: '8px' }}>
          * Simulated result — not a real-world measurement.
        </div>
      </div>
    </div>
  );
}
