import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { LucideIcon, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'kiosk';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'kiosk' | 'xl';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      fullWidth = false,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed select-none rounded-clinical';

    const variants: Record<ButtonVariant, string> = {
      primary: 'bg-brand-700 hover:bg-brand-800 text-white shadow-subtle active:scale-[0.99] focus-visible:ring-brand-500',
      kiosk: 'bg-brand-700 hover:bg-brand-800 text-white font-extrabold shadow-md active:scale-[0.98] focus-visible:ring-brand-500 ring-2 ring-brand-200/50',
      secondary: 'bg-clinical-slate hover:bg-clinical-navy text-white shadow-subtle active:scale-[0.99] focus-visible:ring-slate-400',
      outline: 'border border-clinical-border bg-white text-clinical-navy hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 focus-visible:ring-slate-400',
      ghost: 'bg-transparent text-clinical-slate hover:bg-slate-100 hover:text-clinical-navy active:bg-slate-200 focus-visible:ring-slate-400',
      danger: 'bg-red-600 hover:bg-red-700 text-white shadow-subtle active:scale-[0.99] focus-visible:ring-red-400',
    };

    const sizes: Record<ButtonSize, string> = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
      md: 'text-sm px-4 py-2 gap-2 h-10',
      lg: 'text-base px-6 py-2.5 gap-2.5 h-12',
      kiosk: 'text-lg px-8 py-4 gap-3 h-14 rounded-kiosk font-bold shadow-md',
      xl: 'text-lg px-8 py-4 gap-3 h-14 rounded-kiosk font-bold shadow-md',
    };

    const iconSizeClass = size === 'kiosk' || size === 'xl' ? 'w-6 h-6' : 'w-4 h-4';

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : LeftIcon ? (
          <LeftIcon className={cn('shrink-0', iconSizeClass)} />
        ) : null}

        <span>{children}</span>

        {!isLoading && RightIcon && (
          <RightIcon className={cn('shrink-0', iconSizeClass)} />
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
