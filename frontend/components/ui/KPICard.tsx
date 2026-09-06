import { ReactNode } from 'react';
import Panel from './Panel';

interface KPICardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: string;
  className?: string;
}

export default function KPICard({ title, value, icon, trend, className = '' }: KPICardProps) {
  return (
    <Panel className={`rounded-xl ${className}`}>
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-xs font-medium text-slate-400">{title}</h4>
        {icon && (
          <div className="text-orange-500 bg-orange-500/10 p-1.5 rounded-lg border border-orange-500/20">
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-end gap-3 mt-1">
        <span className="text-2xl font-semibold text-white tracking-tight">{value}</span>
      </div>
      {trend && (
        <div className="mt-2 text-[10px] font-mono text-slate-500">
          {trend}
        </div>
      )}
    </Panel>
  );
}
