import React from 'react';
import { cn } from '../../../utils/cn';

export interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  title,
  subtitle,
  action,
  maxWidth = 'full',
  className,
}) => {
  const maxWidths = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
  };

  return (
    <div className={cn('w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6', maxWidths[maxWidth], className)}>
      {(title || action) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-clinical-border">
          <div>
            {title && <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-clinical-navy">{title}</h1>}
            {subtitle && <p className="text-xs sm:text-sm text-clinical-muted mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export interface SectionProps {
  children: React.ReactNode;
  title?: string;
  action?: React.ReactNode;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({ children, title, action, className }) => (
  <div className={cn('flex flex-col gap-3', className)}>
    {title && (
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-clinical-slate">{title}</h2>
        {action && <div>{action}</div>}
      </div>
    )}
    {children}
  </div>
);

export const ContentGrid: React.FC<{ children: React.ReactNode; columns?: 1 | 2 | 3 | 4; className?: string }> = ({
  children,
  columns = 3,
  className,
}) => {
  const cols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };
  return <div className={cn('grid gap-4 sm:gap-6', cols[columns], className)}>{children}</div>;
};

export const TwoColumnLayout: React.FC<{ left: React.ReactNode; right: React.ReactNode; rightWidth?: 'narrow' | 'equal' | 'wide' }> = ({
  left,
  right,
  rightWidth = 'narrow',
}) => {
  const widths = {
    narrow: 'lg:col-span-4',
    equal: 'lg:col-span-6',
    wide: 'lg:col-span-8',
  };
  const leftWidths = {
    narrow: 'lg:col-span-8',
    equal: 'lg:col-span-6',
    wide: 'lg:col-span-4',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className={cn('flex flex-col gap-6', leftWidths[rightWidth])}>{left}</div>
      <div className={cn('flex flex-col gap-6', widths[rightWidth])}>{right}</div>
    </div>
  );
};

export const ThreeColumnLayout: React.FC<{ left: React.ReactNode; center: React.ReactNode; right: React.ReactNode }> = ({
  left,
  center,
  right,
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
    <div className="lg:col-span-3 flex flex-col gap-6">{left}</div>
    <div className="lg:col-span-6 flex flex-col gap-6">{center}</div>
    <div className="lg:col-span-3 flex flex-col gap-6">{right}</div>
  </div>
);

export const CenteredTaskLayout: React.FC<{ children: React.ReactNode; maxWidth?: 'sm' | 'md' | 'lg' }> = ({
  children,
  maxWidth = 'md',
}) => {
  const widths = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
  };
  return <div className={cn('w-full mx-auto py-8 sm:py-12 px-4 flex flex-col items-center justify-center min-h-[75vh]', widths[maxWidth])}>{children}</div>;
};
