import React from 'react';
import { TriageStatus } from '../../types/triage';
import { Clock, Eye, AlertOctagon, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface TriageStatusBadgeProps {
  status: TriageStatus;
  className?: string;
  size?: 'sm' | 'md';
}

export const TriageStatusBadge: React.FC<TriageStatusBadgeProps> = ({
  status,
  className,
  size = 'md',
}) => {
  const config = {
    'awaiting-triage': {
      label: 'Awaiting Triage',
      symbol: '●',
      icon: Clock,
      style: 'bg-amber-50 text-amber-900 border-amber-300 font-bold',
    },
    'under-review': {
      label: 'Under Review',
      symbol: '◐',
      icon: Eye,
      style: 'bg-sky-50 text-sky-900 border-sky-300 font-bold',
    },
    escalated: {
      label: 'Escalated',
      symbol: '↑',
      icon: AlertOctagon,
      style: 'bg-red-100 text-red-950 border-red-300 font-extrabold animate-pulse',
    },
    'ready-for-doctor': {
      label: 'Ready for Doctor',
      symbol: '→',
      icon: ArrowRight,
      style: 'bg-emerald-50 text-emerald-900 border-emerald-300 font-extrabold',
    },
    'in-consultation': {
      label: 'In Consultation',
      symbol: '⏱',
      icon: Clock,
      style: 'bg-indigo-50 text-indigo-900 border-indigo-200 font-bold',
    },
    completed: {
      label: 'Completed',
      symbol: '✓',
      icon: CheckCircle2,
      style: 'bg-slate-100 text-slate-700 border-slate-300 font-medium',
    },
  }[status];

  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border select-none',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        config.style,
        className
      )}
    >
      <span className="font-bold text-[11px] shrink-0">{config.symbol}</span>
      <Icon className={cn('shrink-0', size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
      <span>{config.label}</span>
    </span>
  );
};
