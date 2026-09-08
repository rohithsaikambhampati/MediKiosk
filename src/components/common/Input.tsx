import React, { InputHTMLAttributes, forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  isKiosk?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon: LeftIcon, rightIcon: RightIcon, isKiosk = false, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className={cn('font-medium text-clinical-navy', isKiosk ? 'text-base' : 'text-xs uppercase tracking-wider text-clinical-muted')}>
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {LeftIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-clinical-muted pointer-events-none z-10 flex items-center justify-center">
              <LeftIcon className={cn(isKiosk ? 'w-6 h-6' : 'w-4 h-4')} />
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full bg-white border border-clinical-border text-clinical-navy placeholder:text-slate-400 transition-colors focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 disabled:bg-slate-50 disabled:cursor-not-allowed',
              isKiosk ? 'h-14 text-lg rounded-kiosk' : 'h-10 text-sm rounded-clinical',
              LeftIcon ? (isKiosk ? '!pl-14' : '!pl-10') : (isKiosk ? 'px-4' : 'px-3.5'),
              RightIcon ? (isKiosk ? '!pr-14' : '!pr-10') : (isKiosk ? 'px-4' : 'px-3.5'),
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              className
            )}
            {...props}
          />
          {RightIcon && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-clinical-muted pointer-events-none z-10 flex items-center justify-center">
              <RightIcon className={cn(isKiosk ? 'w-6 h-6' : 'w-4 h-4')} />
            </div>
          )}
        </div>
        {error ? (
          <span className="text-xs text-red-600 font-medium">{error}</span>
        ) : helperText ? (
          <span className="text-xs text-clinical-muted">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
