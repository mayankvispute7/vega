import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { TopBar } from '@/components/ui/TopBar';
import { Sidebar } from '@/components/ui/Sidebar';
import { ToastContainer } from '@/components/ui/Toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VEGA — Emergency Mobility Intelligence',
  description:
    'Junction coordination platform for emergency vehicle routing. SIMULATED DATA — not for operational use.',
  keywords: ['emergency', 'ambulance', 'junction coordination', 'SEVA Innovation Challenge'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body
        style={{
          fontFamily: 'var(--font-inter, Inter, system-ui, sans-serif)',
          background: 'var(--bg)',
          color: 'var(--text)',
          margin: 0,
          padding: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <TopBar />
        <div style={{ flex: 1, display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
          <Suspense fallback={<aside style={{ width: '210px', background: '#0B2545', flexShrink: 0 }} />}>
            <Sidebar />
          </Suspense>
          <div
            id="main-scroll-container"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--bg)',
              minWidth: 0,
              height: '100%',
              overflowY: 'auto',
            }}
          >
            <main style={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column' }}>
              {children}
            </main>

            {/* Persistent Government Disclaimer Footer */}
            <footer
              style={{
                height: '36px',
                background: '#FFFFFF',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 20px',
                fontSize: '11px',
                color: 'var(--muted)',
                boxSizing: 'border-box',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 600, color: 'var(--navy)' }}>VEGA Control Room System</span>
                <span>·</span>
                <span>Version 1.0 (Demo Prototype)</span>
              </div>
              <div style={{ fontWeight: 500, color: '#B45309' }}>
                Prototype for demonstration. Not an official government portal. All data simulated.
              </div>
            </footer>
          </div>
        </div>
        <ToastContainer />
      </body>
    </html>
  );
}
