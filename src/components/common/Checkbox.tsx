import React, { InputHTMLAttributes, forwardRef } from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  isKiosk?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, isKiosk = false, className, checked, ...props }, ref) => {
    return (
      <label className={cn('inline-flex items-start gap-3 select-none cursor-pointer', className)}>
        <div className="relative flex items-center mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              'border border-clinical-strong bg-white rounded transition-colors peer-checked:bg-brand-700 peer-checked:border-brand-700 flex items-center justify-center text-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500',
              isKiosk ? 'w-6 h-6 rounded-md' : 'w-4 h-4'
            )}
          >
            <Check className={cn('stroke-[3]', isKiosk ? 'w-4 h-4' : 'w-3 h-3', checked ? 'opacity-100' : 'opacity-0')} />
          </div>
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && <span className={cn('font-medium text-clinical-navy', isKiosk ? 'text-lg' : 'text-sm')}>{label}</span>}
            {description && <span className="text-xs text-clinical-muted">{description}</span>}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
