interface SeverityBadgeProps {
  status: 'Critical' | 'High Risk' | 'Moderate' | 'Low Risk' | 'Neutral' | 'Active' | 'Inactive';
  className?: string;
}

export default function SeverityBadge({ status, className = '' }: SeverityBadgeProps) {
  const getStyles = () => {
    switch (status) {
      case 'Critical':
      case 'High Risk':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'Moderate':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'Low Risk':
      case 'Neutral':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'Active':
        return 'bg-teal-500/10 text-teal-400 border-teal-500/30';
      case 'Inactive':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[9px] font-mono border font-medium tracking-wider uppercase ${getStyles()} ${className}`}>
      {status}
    </span>
  );
}
