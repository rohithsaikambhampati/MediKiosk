import React from 'react';
import { cn } from '../../utils/cn';

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
  badgeVariant?: 'default' | 'urgent' | 'brand';
  icon?: React.ComponentType<{ className?: string }>;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'underline' | 'pills' | 'segmented';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  className,
}) => {
  return (
    <div
      className={cn(
        'flex items-center gap-2 overflow-x-auto scrollbar-none',
        variant === 'underline' && 'border-b border-clinical-border',
        variant === 'segmented' && 'bg-slate-100 p-1 rounded-clinical border border-clinical-border',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'inline-flex items-center gap-2 font-medium text-sm transition-all whitespace-nowrap focus-visible:outline-none select-none',
              variant === 'underline' && [
                'py-2.5 px-3 border-b-2 -mb-px',
                isActive
                  ? 'border-brand-700 text-brand-800 font-semibold'
                  : 'border-transparent text-clinical-muted hover:text-clinical-navy hover:border-slate-300',
              ],
              variant === 'pills' && [
                'py-1.5 px-4 rounded-full',
                isActive
                  ? 'bg-brand-700 text-white shadow-subtle'
                  : 'bg-slate-100 text-clinical-muted hover:bg-slate-200 hover:text-clinical-navy',
              ],
              variant === 'segmented' && [
                'py-1.5 px-3 rounded-md text-xs font-semibold flex-1 justify-center',
                isActive
                  ? 'bg-white text-clinical-navy shadow-subtle'
                  : 'text-clinical-muted hover:text-clinical-navy',
              ]
            )}
          >
            {Icon && <Icon className="w-4 h-4 shrink-0" />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.2 text-[10px] font-bold rounded-full',
                  tab.badgeVariant === 'urgent'
                    ? 'bg-red-500 text-white'
                    : isActive
                    ? 'bg-brand-100 text-brand-800'
                    : 'bg-slate-200 text-slate-700'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
