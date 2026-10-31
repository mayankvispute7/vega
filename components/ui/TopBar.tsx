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
  const label = `T+${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  return (
    <span
      style={{
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: '12px',
        fontWeight: 600,
        color: tripStarted ? '#2DD4BF' : '#94A3B8',
        letterSpacing: '0.05em',
        background: 'rgba(255, 255, 255, 0.08)',
        padding: '2px 7px',
        borderRadius: '4px',
      }}
    >
      {tripStarted ? label : '--:--'}
    </span>
  );
}

export function TopBar() {
  const { role, setRole, language, setLanguage } = useUiStore();
  const { trip } = useTripStore();
  const [wallTime, setWallTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setWallTime(
        now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const t = {
    appName: language === 'MR' ? 'वेगा (VEGA)' : 'VEGA',
    subTitle: language === 'MR' ? 'आपत्कालीन गतिशीलता गुप्तचर' : 'Emergency Mobility Intelligence',
    simulated: language === 'MR' ? 'प्रायोगिक डेटा' : 'Simulated Data',
    live: language === 'MR' ? 'थेट' : 'LIVE',
    officer: language === 'MR' ? 'पोलीस निरीक्षक के. जाधव' : 'Insp. K. Jadhav',
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', flexDirection: 'column' }}>
      {/* 4px Indian Tricolour Band */}
      <div className="tricolour-band">
        <div className="tricolour-saffron" />
        <div className="tricolour-white" />
        <div className="tricolour-green" />
      </div>

      {/* Main Navy Header */}
      <div
        style={{
          height: '52px',
          background: '#0B2545',
          borderBottom: '1px solid #13335A',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: '14px',
          color: '#FFFFFF',
        }}
      >
        {/* Government Wordmark */}
        <Link href="/command" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              fontWeight: 800,
              fontSize: '19px',
              letterSpacing: '0.12em',
              color: '#FFFFFF',
              fontFamily: 'var(--font-mono, monospace)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>{t.appName}</span>
            <span style={{ color: '#2DD4BF', fontSize: '12px' }}>●</span>
          </div>
          <div
            style={{
              color: '#94A3B8',
              fontSize: '11px',
              fontWeight: 500,
              borderLeft: '1px solid #1E3A8A',
              paddingLeft: '10px',
            }}
          >
            {t.subTitle}
          </div>
        </Link>

        {/* SIMULATED DATA pill */}
        <span className="simulated-badge">{t.simulated}</span>

        <div style={{ flex: 1 }} />

        {/* Active Emergency Trip chip */}
        {trip.status === 'Active' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#FEE2E2',
              border: '1px solid #FECACA',
              borderRadius: '6px',
              padding: '3px 10px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#B91C1C',
            }}
          >
            <span>🚨</span>
            <span>{trip.vehicleLabel.split(' ')[0]}</span>
            <span style={{ color: '#6B7280' }}>→</span>
            <span>{trip.destinationLabel.split('–')[1]?.trim() ?? trip.destinationLabel}</span>
          </div>
        )}

        {/* LIVE status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="live-dot" />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#4ADE80', letterSpacing: '0.06em' }}>
            {t.live}
          </span>
        </div>

        {/* Clocks */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SimClock />
          <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '12px', color: '#CBD5E1' }}>
            {wallTime}
          </span>
        </div>

        {/* Language Toggle EN | मराठी */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#13335A',
            border: '1px solid #1E3A8A',
            borderRadius: '6px',
            padding: '2px',
          }}
        >
          <button
            onClick={() => setLanguage('EN')}
            style={{
              background: language === 'EN' ? '#1D4ED8' : 'transparent',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              padding: '2px 7px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('MR')}
            style={{
              background: language === 'MR' ? '#1D4ED8' : 'transparent',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              padding: '2px 7px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            मराठी
          </button>
        </div>

        {/* Officer Identity Chip with Role Selector */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#13335A',
            border: '1px solid #1E3A8A',
            borderRadius: '6px',
            padding: '3px 8px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#FFFFFF' }}>{t.officer}</span>
            <span style={{ fontSize: '9px', color: '#94A3B8' }}>CMD-01 · Pune Traffic</span>
          </div>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            aria-label="Switch role"
            style={{
              background: '#0B2545',
              border: '1px solid #2563EB',
              borderRadius: '4px',
              color: '#93C5FD',
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 6px',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {ROLES.map((r) => (
              <option key={r} value={r} style={{ background: '#0B2545', color: '#FFFFFF' }}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
