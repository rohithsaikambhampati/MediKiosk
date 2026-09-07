import React from 'react';
import { OperationalLoad } from '../../types/admin';
import { cn } from '../../utils/cn';

export interface LoadIndicatorProps {
  load: OperationalLoad;
  className?: string;
  size?: 'sm' | 'md';
}

export const LoadIndicator: React.FC<LoadIndicatorProps> = ({
  load,
  className,
  size = 'md',
}) => {
  const config = {
    low: {
      label: 'Low Load',
      dotColor: 'bg-emerald-500',
      badgeStyle: 'bg-emerald-50 text-emerald-900 border-emerald-200 font-bold',
    },
    moderate: {
      label: 'Moderate Load',
      dotColor: 'bg-sky-500',
      badgeStyle: 'bg-sky-50 text-sky-900 border-sky-200 font-bold',
    },
    high: {
      label: 'High Load',
      dotColor: 'bg-amber-500',
      badgeStyle: 'bg-amber-50 text-amber-950 border-amber-300 font-extrabold',
    },
    critical: {
      label: 'Critical Load',
      dotColor: 'bg-red-600 animate-ping',
      badgeStyle: 'bg-red-100 text-red-950 border-red-300 font-black',
    },
  }[load];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border select-none',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        config.badgeStyle,
        className
      )}
    >
      <span className={cn('w-2 h-2 rounded-full shrink-0', config.dotColor)} />
      <span>{config.label}</span>
    </span>
  );
};
