import React, { InputHTMLAttributes } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onSearchChange: (value: string) => void;
  onClear?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onSearchChange,
  onClear,
  placeholder = 'Search patients, MRN, symptoms...',
  className,
  ...props
}) => {
  return (
    <div className={cn('relative flex items-center w-full max-w-md', className)}>
      <Search className="w-4 h-4 text-clinical-muted absolute left-3 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white border border-clinical-border text-clinical-navy text-sm h-10 pl-9 pr-9 rounded-clinical focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 shadow-subtle"
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onSearchChange('');
            if (onClear) onClear();
          }}
          className="absolute right-3 text-clinical-muted hover:text-clinical-navy"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
