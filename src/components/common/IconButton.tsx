import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'kiosk';
  ariaLabel: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon: Icon, variant = 'outline', size = 'md', ariaLabel, className, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-clinical transition-all focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-brand-700 text-white hover:bg-brand-800 focus-visible:ring-brand-500',
      secondary: 'bg-clinical-slate text-white hover:bg-clinical-navy focus-visible:ring-slate-400',
      outline: 'border border-clinical-border bg-white text-clinical-slate hover:bg-slate-50 hover:text-clinical-navy focus-visible:ring-slate-400',
      ghost: 'text-clinical-slate hover:bg-slate-100 hover:text-clinical-navy focus-visible:ring-slate-400',
      danger: 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 focus-visible:ring-red-400',
    };

    const sizes = {
      sm: 'w-8 h-8 p-1.5',
      md: 'w-10 h-10 p-2',
      lg: 'w-12 h-12 p-3',
      kiosk: 'w-14 h-14 p-3.5 rounded-kiosk',
    };

    const iconSizes = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      kiosk: 'w-7 h-7',
    };

    return (
      <button
        ref={ref}
        type="button"
        aria-label={ariaLabel}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        <Icon className={iconSizes[size]} />
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
