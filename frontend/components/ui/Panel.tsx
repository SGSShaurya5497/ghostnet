import { ReactNode } from 'react';

interface PanelProps {
  children: ReactNode;
  className?: string;
  title?: string;
  noPadding?: boolean;
}

export default function Panel({ children, className = '', title, noPadding = false }: PanelProps) {
  return (
    <div className={`bg-[#0d141e]/90 backdrop-blur-md border border-white/5 shadow-xl flex flex-col ${className}`}>
      {title && (
        <div className="px-4 py-2 border-b border-white/5 bg-[#121b29]/50">
          <h3 className="text-xs font-semibold text-slate-300 tracking-wider uppercase font-mono">{title}</h3>
        </div>
      )}
      <div className={`flex-1 overflow-hidden flex flex-col ${noPadding ? '' : 'p-4'}`}>
        {children}
      </div>
    </div>
  );
}
