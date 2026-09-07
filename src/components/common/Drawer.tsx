import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';
import { cn } from '../../utils/cn';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  position?: 'right' | 'left';
  width?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  position = 'right',
  width = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widths = {
    sm: 'w-full max-w-sm',
    md: 'w-full max-w-md',
    lg: 'w-full max-w-xl',
    xl: 'w-full max-w-3xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className={cn('absolute inset-y-0 flex max-w-full', position === 'right' ? 'right-0' : 'left-0')}>
        <div
          className={cn(
            'bg-white shadow-2xl flex flex-col h-full border-l border-clinical-border animate-in duration-300',
            position === 'right' ? 'slide-in-from-right' : 'slide-in-from-left',
            widths[width]
          )}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 py-4 border-b border-clinical-border bg-slate-50/70">
            <div>
              {title && <h3 className="text-lg font-semibold text-clinical-navy">{title}</h3>}
              {subtitle && <p className="text-xs text-clinical-muted mt-0.5">{subtitle}</p>}
            </div>
            <IconButton icon={X} variant="ghost" size="sm" ariaLabel="Close panel" onClick={onClose} />
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-clinical-border bg-slate-50/70 flex items-center justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
