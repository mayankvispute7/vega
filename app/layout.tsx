import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { TopBar } from '@/components/ui/TopBar';
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
          background: 'var(--bg-base)',
          color: 'var(--text)',
          margin: 0,
          padding: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <TopBar />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
        <ToastContainer />
      </body>
    </html>
  );
}
