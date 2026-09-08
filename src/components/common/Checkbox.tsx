import React, { InputHTMLAttributes, forwardRef } from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  isKiosk?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, isKiosk = false, className, checked, onChange, onClick, ...props }, ref) => {
    return (
      <label
        className={cn(
          'inline-flex items-center gap-3 select-none cursor-pointer p-1 touch-manipulation',
          isKiosk && 'min-h-[44px]',
          className
        )}
      >
        <div className="relative flex items-center shrink-0">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            onClick={onClick}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              'border-2 transition-all rounded-lg flex items-center justify-center text-white cursor-pointer shadow-xs',
              checked
                ? 'bg-emerald-600 border-emerald-700'
                : 'bg-white border-slate-400 hover:border-slate-700',
              isKiosk ? 'w-9 h-9 rounded-xl' : 'w-6 h-6'
            )}
          >
            <Check className={cn('stroke-[3.5] transition-opacity', isKiosk ? 'w-6 h-6' : 'w-4 h-4', checked ? 'opacity-100' : 'opacity-0')} />
          </div>
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && <span className={cn('font-bold text-clinical-navy', isKiosk ? 'text-lg' : 'text-sm')}>{label}</span>}
            {description && <span className="text-xs text-clinical-muted">{description}</span>}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

