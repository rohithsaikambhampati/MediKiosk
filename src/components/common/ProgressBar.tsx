import React from 'react';
import { cn } from '../../utils/cn';

export interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  showPercent?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'brand' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  showPercent = true,
  size = 'md',
  variant = 'brand',
  className,
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  const variants = {
    brand: 'bg-brand-600',
    success: 'bg-emerald-600',
    warning: 'bg-amber-500',
    danger: 'bg-red-600',
  };

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4 rounded-full',
  };

  return (
    <div className={cn('w-full flex flex-col gap-1', className)}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between text-xs text-clinical-muted font-medium">
          {label && <span>{label}</span>}
          {showPercent && <span>{Math.round(clampedValue)}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-slate-200 rounded-full overflow-hidden', heights[size])}>
        <div
          className={cn('h-full transition-all duration-300 ease-out rounded-full', variants[variant])}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};
