import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  badge?: string;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  isKiosk?: boolean;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  selectedValue,
  onChange,
  isKiosk = false,
  className,
}) => {
  return (
    <div className={cn('flex flex-col gap-2.5', className)}>
      {options.map((opt) => {
        const isSelected = selectedValue === opt.value;
        return (
          <label
            key={opt.value}
            className={cn(
              'flex items-center justify-between border rounded-clinical transition-all cursor-pointer select-none',
              isKiosk ? 'p-4 sm:p-5 rounded-kiosk text-lg' : 'p-3 text-sm',
              isSelected
                ? 'border-brand-700 bg-brand-50/50 shadow-subtle'
                : 'border-clinical-border bg-white hover:border-slate-300'
            )}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={isSelected}
                onChange={() => onChange(opt.value)}
                className="sr-only"
              />
              <div
                className={cn(
                  'rounded-full border flex items-center justify-center transition-colors',
                  isKiosk ? 'w-6 h-6 border-2' : 'w-4 h-4',
                  isSelected ? 'border-brand-700 bg-brand-700' : 'border-slate-300 bg-white'
                )}
              >
                {isSelected && <div className={cn('bg-white rounded-full', isKiosk ? 'w-2.5 h-2.5' : 'w-1.5 h-1.5')} />}
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-clinical-navy">{opt.label}</span>
                {opt.description && <span className="text-xs text-clinical-muted">{opt.description}</span>}
              </div>
            </div>
            {opt.badge && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                {opt.badge}
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
};
