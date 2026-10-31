'use client';
import { useTripStore } from '@/store/tripStore';
import { useJunctionStore } from '@/store/junctionStore';
import { JUNCTIONS } from '@/lib/data/corridor';
import { TOTAL_ROUTE_DISTANCE_M } from '@/lib/constants';
import { formatSeconds } from '@/hooks/useCountdown';
import Link from 'next/link';

export default function DriverHudPage() {
  const { trip, vehicle } = useTripStore();
  const { tasks } = useJunctionStore();

  const vehicleDistM = vehicle.progressRatio * TOTAL_ROUTE_DISTANCE_M;

  // Find the next upcoming junction that has not been passed
  const nextJunction =
    JUNCTIONS.find((j) => j.distanceFromOriginM > vehicleDistM) ?? JUNCTIONS[JUNCTIONS.length - 1];

  const task = tasks[nextJunction.id];
  const eta = task?.etaSeconds ?? 0;
  const status = task?.status ?? 'Scheduled';

  const isReady = status === 'Ready' || status === 'Cleared';
  const isPreparing = status === 'Preparing' || status === 'Received';
  const isAtRisk = status === 'AtRisk' || status === 'Unable' || status === 'Escalated' || status === 'Blocked';

  const remainingM = Math.max(0, Math.round(nextJunction.distanceFromOriginM - vehicleDistM));

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 52px)',
        background: '#040812',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '32px 24px',
        boxSizing: 'border-box',
        textAlign: 'center',
      }}
    >
      {/* Top Bar: Vehicle Info & Back Link */}
      <div style={{ width: '100%', maxWidth: '600px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link
          href="/command"
          style={{
            fontSize: '13px',
            color: 'var(--teal)',
            textDecoration: 'none',
            fontWeight: 700,
            background: 'rgba(45, 212, 191, 0.1)',
            padding: '6px 12px',
            borderRadius: '6px',
          }}
        >
          ← Exit HUD
        </Link>
        <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '14px', fontWeight: 700, color: '#A0B2C6' }}>
          🚑 {vehicle.id} · {(vehicle.speedKmh ?? 30).toFixed(0)} KM/H
        </div>
      </div>

      {/* Center Traffic HUD: Traffic Light Circle, Junction Name & Countdown */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', margin: 'auto 0' }}>
        {/* Next Junction Header */}
        <div>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#8FA3BF',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: '6px',
            }}
          >
            NEXT COORDINATED INTERSECTION
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            {nextJunction.name}
          </h1>
          <div style={{ fontSize: '14px', color: '#8FA3BF', marginTop: '4px', fontFamily: 'var(--font-mono, monospace)' }}>
            {remainingM}m to stop line
          </div>
        </div>

        {/* Large High-Contrast Signal Circle */}
        <div
          style={{
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            background: isReady
              ? 'rgba(45, 212, 191, 0.25)'
              : isPreparing
              ? 'rgba(255, 190, 92, 0.25)'
              : isAtRisk
              ? 'rgba(248, 113, 113, 0.25)'
              : 'rgba(255, 255, 255, 0.08)',
            border: `6px solid ${
              isReady
                ? 'var(--teal)'
                : isPreparing
                ? 'var(--amber)'
                : isAtRisk
                ? 'var(--danger)'
                : 'rgba(255, 255, 255, 0.2)'
            }`,
            boxShadow: isReady
              ? '0 0 40px rgba(45, 212, 191, 0.6)'
              : isPreparing
              ? '0 0 30px rgba(255, 190, 92, 0.5)'
              : isAtRisk
              ? '0 0 40px rgba(248, 113, 113, 0.6)'
              : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '56px',
            animation: isAtRisk ? 'ping 1.5s infinite' : isReady ? 'pulse 2s infinite' : 'none',
          }}
        >
          {isReady ? '🟢' : isPreparing ? '🟡' : isAtRisk ? '🔴' : '⚪'}
        </div>

        {/* Huge Countdown Timer */}
        <div>
          <div
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '72px',
              fontWeight: 800,
              lineHeight: 1,
              color: isReady ? 'var(--teal)' : isAtRisk ? 'var(--danger)' : '#FFFFFF',
            }}
          >
            {eta > 0 ? formatSeconds(eta) : '00:00'}
          </div>
          <div style={{ fontSize: '12px', color: '#8FA3BF', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Estimated Arrival Countdown
          </div>
        </div>

        {/* Bold Pilot Instruction Line */}
        <div
          style={{
            background: isReady
              ? 'rgba(45, 212, 191, 0.15)'
              : isPreparing
              ? 'rgba(255, 190, 92, 0.15)'
              : isAtRisk
              ? 'rgba(248, 113, 113, 0.2)'
              : 'rgba(255, 255, 255, 0.06)',
            border: `1.5px solid ${
              isReady
                ? 'var(--teal)'
                : isPreparing
                ? 'var(--amber)'
                : isAtRisk
                ? 'var(--danger)'
                : 'rgba(255, 255, 255, 0.1)'
            }`,
            borderRadius: '12px',
            padding: '16px 28px',
            fontSize: '20px',
            fontWeight: 800,
            color: isReady
              ? 'var(--teal)'
              : isPreparing
              ? 'var(--amber)'
              : isAtRisk
              ? 'var(--danger)'
              : '#FFFFFF',
            letterSpacing: '0.04em',
          }}
        >
          {isReady
            ? 'PROCEED — JUNCTION READY & SIGNAL HELD'
            : isPreparing
            ? 'CAUTION — JUNCTION PREPARING PHASE'
            : isAtRisk
            ? 'HOLD / CAUTION — AT RISK / ESCALATION'
            : 'EN ROUTE — SCHEDULED'}
        </div>
      </div>

      {/* Bottom Corridor Ribbon */}
      <div style={{ width: '100%', maxWidth: '600px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
        {JUNCTIONS.map((j) => {
          const t = tasks[j.id];
          const passed = vehicleDistM >= j.distanceFromOriginM;
          return (
            <div
              key={j.id}
              style={{
                flex: 1,
                height: '6px',
                borderRadius: '3px',
                background: passed
                  ? 'var(--teal)'
                  : j.id === nextJunction.id
                  ? isReady
                    ? 'var(--teal)'
                    : isAtRisk
                    ? 'var(--danger)'
                    : 'var(--amber)'
                  : 'rgba(255,255,255,0.15)',
              }}
              title={`${j.name}: ${t?.status ?? 'Scheduled'}`}
            />
          );
        })}
      </div>
    </div>
  );
}
