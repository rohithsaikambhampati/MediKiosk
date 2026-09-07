import React from 'react';
import { cn } from '../../utils/cn';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className,
  size = 'md',
}) => {
  const isLg = size === 'lg';

  return (
    <label
      className={cn(
        'inline-flex items-center justify-between gap-3 cursor-pointer select-none',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {(label || description) && (
        <div className="flex flex-col">
          {label && <span className="text-sm font-medium text-clinical-navy">{label}</span>}
          {description && <span className="text-xs text-clinical-muted">{description}</span>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault();
          if (!disabled) onChange(!checked);
        }}
        className={cn(
          'relative inline-flex items-center shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 !min-h-0 select-none border-2 border-transparent',
          isLg ? 'h-8 w-14 p-0.5' : 'h-7 w-12 p-0.5',
          checked ? 'bg-brand-700' : 'bg-slate-300'
        )}
        style={{
          minHeight: 'unset',
          height: isLg ? '2rem' : '1.75rem',
          width: isLg ? '3.5rem' : '3rem',
        }}
      >
        <span
          className={cn(
            'pointer-events-none block rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out',
            isLg ? 'h-6 w-6' : 'h-5 w-5',
            checked
              ? (isLg ? 'translate-x-6' : 'translate-x-5')
              : 'translate-x-0.5'
          )}
        />
      </button>
    </label>
  );
};

export default Switch;
