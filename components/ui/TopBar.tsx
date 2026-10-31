'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUiStore } from '@/store/uiStore';
import { useTripStore } from '@/store/tripStore';
import { useSimulationStore } from '@/store/simulationStore';
import type { UserRole } from '@/lib/types';

const ROLES: UserRole[] = ['Dispatcher', 'Operator', 'Supervisor'];

function SimClock() {
  const { simTime, tripStarted } = useSimulationStore();
  const mins = Math.floor(simTime / 60000);
  const secs = Math.floor((simTime % 60000) / 1000);
  const label = `T+${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
  return (
    <span style={{
      fontFamily: 'var(--font-mono, monospace)',
      fontSize: '12px',
      color: tripStarted ? 'var(--teal)' : 'var(--text-muted)',
      letterSpacing: '0.05em',
    }}>
      {tripStarted ? label : '--:--'}
    </span>
  );
}

export function TopBar() {
  const { role, setRole } = useUiStore();
  const { trip } = useTripStore();
  const [wallTime, setWallTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setWallTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header style={{
      height: '52px',
      background: 'rgba(10,18,34,0.95)',
      borderBottom: '1px solid var(--border)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: '12px',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <Link href="/command" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{
          fontWeight: 800,
          fontSize: '18px',
          letterSpacing: '0.12em',
          color: 'var(--teal)',
          textShadow: '0 0 12px rgba(45,212,191,0.6)',
          fontFamily: 'var(--font-mono, monospace)',
        }}>
          VEGA
        </span>
        <span style={{ color: 'var(--text-dim)', fontSize: '11px', fontWeight: 400 }}>
          Emergency Mobility Intelligence
        </span>
      </Link>

      {/* SIMULATED DATA badge */}
      <span className="simulated-badge">Simulated Data</span>

      <div style={{ flex: 1 }} />

      {/* Trip chip */}
      {trip.status === 'Active' && (
        <Link href="/command" style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(248,113,113,0.12)',
            border: '1px solid rgba(248,113,113,0.3)',
            borderRadius: '6px',
            padding: '3px 10px',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--danger)',
          }}>
            <span style={{ fontSize: '10px' }}>🚨</span>
            {trip.vehicleLabel.split(' ')[0]}
            <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>→</span>
            <span style={{ color: 'var(--text-muted)' }}>{trip.destinationLabel.split('–')[1]?.trim() ?? trip.destinationLabel}</span>
          </div>
        </Link>
      )}

      {/* LIVE indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <span className="live-dot" />
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--teal)', letterSpacing: '0.06em' }}>LIVE</span>
      </div>

      {/* Sim clock */}
      <SimClock />

      {/* Wall clock */}
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '12px', color: 'var(--text-muted)' }}>
        {wallTime}
      </span>

      {/* Role switcher */}
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as UserRole)}
        aria-label="Switch role"
        style={{
          background: 'var(--bg-raised)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          color: 'var(--text)',
          fontSize: '12px',
          fontWeight: 500,
          padding: '4px 8px',
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        {ROLES.map((r) => (
          <option key={r} value={r} style={{ background: 'var(--bg-raised)' }}>
            {r}
          </option>
        ))}
      </select>

      {/* Nav links */}
      <nav style={{ display: 'flex', gap: '2px' }}>
        {[
          { href: '/command', label: 'Command' },
          { href: '/activate', label: 'Activate' },
          { href: '/sim', label: 'Sim' },
          { href: '/review', label: 'Review' },
          { href: '/dev/ui-kit', label: 'UI Kit' },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            style={{
              padding: '4px 10px',
              fontSize: '12px',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              borderRadius: '6px',
              transition: 'color 150ms, background 150ms',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.color = 'var(--text)';
              (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.color = 'var(--text-muted)';
              (e.target as HTMLElement).style.background = 'transparent';
            }}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
