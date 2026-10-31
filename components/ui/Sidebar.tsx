'use client';
import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUiStore } from '@/store/uiStore';

function SidebarContent() {
  const pathname = usePathname();
  const { language } = useUiStore();

  const navItems = [
    {
      href: '/command',
      icon: '🏛',
      labelEn: 'Command Centre',
      labelMr: 'नियंत्रण कक्ष',
    },
    {
      href: '/junction/J1',
      icon: '🚨',
      labelEn: 'Police Alerts',
      labelMr: 'पोलीस सूचना',
      badge: 'LIVE',
    },
    {
      href: '/junction/J2',
      icon: '🚦',
      labelEn: 'Signal Portal',
      labelMr: 'सिग्नल पोर्टल',
    },
    {
      href: '/activate',
      icon: '🚑',
      labelEn: 'Trip Operations',
      labelMr: 'मोहीम कृती',
    },
    {
      href: '/exceptions',
      icon: '⚠️',
      labelEn: 'Roadblocks',
      labelMr: 'अडथळे / वळण',
    },
    {
      href: '/driver',
      icon: '📱',
      labelEn: 'Driver HUD',
      labelMr: 'चालक दृष्य',
    },
    {
      href: '/sim',
      icon: '📈',
      labelEn: 'Simulation Benchmarks',
      labelMr: 'प्रायोगिक आकडेवारी',
    },
    {
      href: '/review',
      icon: '📑',
      labelEn: 'Audit & Reports',
      labelMr: 'अहवाल व तपासणी',
    },
    {
      href: '/dev/ui-kit',
      icon: '🛠',
      labelEn: 'Govt UI Kit',
      labelMr: 'यूआय किट',
    },
  ];

  return (
    <aside
      style={{
        width: '210px',
        flexShrink: 0,
        background: '#0B2545',
        borderRight: '1px solid #13335A',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '12px 8px',
        boxSizing: 'border-box',
        userSelect: 'none',
      }}
    >
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div
          style={{
            padding: '4px 8px 8px 8px',
            fontSize: '10px',
            fontWeight: 700,
            color: '#64748B',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {language === 'MR' ? 'नेव्हिगेशन' : 'Navigation'}
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/command' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#FFFFFF' : '#CBD5E1',
                background: isActive ? '#1D4ED8' : 'transparent',
                transition: 'background 120ms ease, color 120ms ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = '#13335A';
                  (e.currentTarget as HTMLElement).style.color = '#FFFFFF';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = '#CBD5E1';
                }
              }}
            >
              <span style={{ fontSize: '14px' }}>{item.icon}</span>
              <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {language === 'MR' ? item.labelMr : item.labelEn}
              </span>
              {item.badge && (
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    background: '#16A34A',
                    color: '#FFFFFF',
                    padding: '1px 5px',
                    borderRadius: '4px',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Control Room Identification Footer in Sidebar */}
      <div
        style={{
          padding: '10px 8px',
          borderTop: '1px solid #13335A',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          color: '#64748B',
          fontSize: '10px',
        }}
      >
        <div style={{ fontWeight: 700, color: '#94A3B8' }}>PUNE TRAFFIC POLICE</div>
        <div>Control Room Unit · CMD-01</div>
        <div style={{ fontSize: '9px', marginTop: '4px', color: '#B45309' }}>Simulated Deployment</div>
      </div>
    </aside>
  );
}

export function Sidebar() {
  return (
    <Suspense
      fallback={
        <aside
          style={{
            width: '210px',
            flexShrink: 0,
            background: '#0B2545',
            borderRight: '1px solid #13335A',
          }}
        />
      }
    >
      <SidebarContent />
    </Suspense>
  );
}
