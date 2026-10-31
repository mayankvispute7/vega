'use client';
import { useUiStore } from '@/store/uiStore';
import type { Toast } from '@/store/uiStore';

const SEVERITY_STYLE: Record<Toast['severity'], { bg: string; border: string; color: string; icon: string }> = {
  info:    { bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.3)',  color: 'var(--info)',   icon: 'ℹ' },
  warning: { bg: 'rgba(255,190,92,0.12)',  border: 'rgba(255,190,92,0.3)',  color: 'var(--amber)',  icon: '⚠' },
  danger:  { bg: 'rgba(248,113,113,0.15)', border: 'rgba(248,113,113,0.3)', color: 'var(--danger)', icon: '✕' },
  success: { bg: 'rgba(45,212,191,0.12)',  border: 'rgba(45,212,191,0.3)',  color: 'var(--teal)',   icon: '✓' },
};

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useUiStore();
  const s = SEVERITY_STYLE[toast.severity];
  return (
    <div
      className="animate-slide-in-right"
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: '10px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        backdropFilter: 'blur(8px)',
        maxWidth: '320px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      <span style={{ color: s.color, fontSize: '14px', marginTop: '1px' }}>{s.icon}</span>
      <span style={{ flex: 1, fontSize: '13px', color: 'var(--text)', lineHeight: 1.4 }}>{toast.message}</span>
      <button
        onClick={() => removeToast(toast.id)}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          fontSize: '14px',
          padding: '0 0 0 4px',
          lineHeight: 1,
        }}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useUiStore();
  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      style={{
        position: 'fixed',
        top: '72px',
        right: '16px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => (
        <div key={t.id} style={{ pointerEvents: 'all' }}>
          <ToastItem toast={t} />
        </div>
      ))}
    </div>
  );
}
