import React from 'react';
import { cn } from '../../utils/cn';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  width,
  height,
}) => {
  const baseStyles = 'animate-shimmer rounded bg-slate-200';

  const variants = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-clinical w-full h-24',
    card: 'rounded-clinical w-full h-32 border border-clinical-border',
  };

  return (
    <div
      className={cn(baseStyles, variants[variant], className)}
      style={{ width, height }}
    />
  );
};
