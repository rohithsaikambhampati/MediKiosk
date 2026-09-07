import React, { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'flat' | 'interactive' | 'urgent' | 'kiosk';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'kiosk';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  padding = 'md',
  ...props
}) => {
  const baseStyles = 'bg-white rounded-clinical border transition-all';
  
  const variants = {
    default: 'border-clinical-border shadow-card',
    outline: 'border-clinical-border shadow-none',
    flat: 'border-transparent bg-slate-50 shadow-none',
    interactive: 'border-clinical-border shadow-card hover:border-brand-500 hover:shadow-dropdown cursor-pointer active:scale-[0.995]',
    urgent: 'border-red-200 bg-red-50/40 shadow-subtle',
    kiosk: 'border-brand-200 shadow-kiosk rounded-kiosk bg-white',
  };

  const paddings = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4 sm:p-5',
    lg: 'p-6 sm:p-8',
    kiosk: 'p-6 sm:p-8 rounded-kiosk',
  };

  return (
    <div className={cn(baseStyles, variants[variant], paddings[padding], className)} {...props}>
      {children}
    </div>
  );
};
