import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { RiskLevel } from '../../types/clinical';
import { cn } from '../../utils/cn';

export interface RiskBadgeProps {
  level: RiskLevel;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, label, size = 'md', className }) => {
  const config: Record<RiskLevel, { text: string; icon: any; styles: string }> = {
    routine: {
      text: 'Routine',
      icon: CheckCircle,
      styles: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    'needs-attention': {
      text: 'Needs Attention',
      icon: Info,
      styles: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    'high-priority': {
      text: 'High Priority',
      icon: AlertTriangle,
      styles: 'bg-orange-50 text-orange-800 border-orange-200',
    },
    immediate: {
      text: 'Immediate Review Required',
      icon: AlertCircle,
      styles: 'bg-red-50 text-red-700 border-red-200 font-bold animate-pulse',
    },
  };

  const item = config[level] || config.routine;
  const Icon = item.icon;

  const sizes = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border transition-colors select-none',
        item.styles,
        sizes[size],
        className
      )}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{label || item.text}</span>
    </span>
  );
};

export interface RiskBannerProps {
  level: RiskLevel;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const RiskBanner: React.FC<RiskBannerProps> = ({
  level,
  title,
  description,
  action,
  className,
}) => {
  const styles: Record<RiskLevel, string> = {
    routine: 'bg-slate-50 border-slate-200 text-slate-800',
    'needs-attention': 'bg-amber-50 border-amber-200 text-amber-900',
    'high-priority': 'bg-orange-50 border-orange-200 text-orange-950',
    immediate: 'bg-red-50 border-red-200 text-red-950',
  };

  return (
    <div className={cn('p-4 rounded-clinical border flex items-start justify-between gap-4 shadow-subtle', styles[level], className)}>
      <div className="flex items-start gap-3">
        <RiskBadge level={level} size="sm" className="mt-0.5" />
        <div>
          <h4 className="font-semibold text-sm">{title}</h4>
          <p className="text-xs opacity-90 mt-0.5">{description}</p>
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
