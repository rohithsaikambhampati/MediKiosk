import React from 'react';
import { Filter } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface FilterItem {
  id: string;
  label: string;
  count?: number;
}

export interface FilterBarProps {
  filters: FilterItem[];
  activeFilter: string;
  onFilterChange: (id: string) => void;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  activeFilter,
  onFilterChange,
  className,
}) => {
  return (
    <div className={cn('flex items-center gap-2 overflow-x-auto py-1', className)}>
      <div className="flex items-center gap-1.5 text-xs text-clinical-muted font-semibold uppercase tracking-wider pr-2 border-r border-clinical-border">
        <Filter className="w-3.5 h-3.5" />
        <span>Filter</span>
      </div>
      {filters.map((f) => {
        const isActive = activeFilter === f.id;
        return (
          <button
            key={f.id}
            onClick={() => onFilterChange(f.id)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border transition-all select-none',
              isActive
                ? 'bg-brand-700 text-white border-brand-700 shadow-subtle'
                : 'bg-white text-clinical-slate border-clinical-border hover:border-slate-300'
            )}
          >
            <span>{f.label}</span>
            {f.count !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.2 text-[10px] font-extrabold rounded-full',
                  isActive ? 'bg-brand-800 text-white' : 'bg-slate-100 text-slate-700'
                )}
              >
                {f.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
