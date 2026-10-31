import type { ReactNode, CSSProperties } from 'react';

interface PanelProps {
  children: ReactNode;
  raised?: boolean;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}

export function Panel({ children, raised = false, className = '', style, onClick }: PanelProps) {
  return (
    <div
      className={`${raised ? 'panel-raised' : 'panel'} ${className}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
