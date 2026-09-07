import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'brand' | 'white' | 'slate';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', variant = 'brand', className }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const variants = {
    brand: 'text-brand-700',
    white: 'text-white',
    slate: 'text-clinical-slate',
  };

  return <Loader2 className={cn('animate-spin', sizes[size], variants[variant], className)} />;
};
