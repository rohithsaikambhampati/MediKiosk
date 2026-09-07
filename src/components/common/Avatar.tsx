import React from 'react';
import { User } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface AvatarProps {
  name?: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  roleBadge?: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name, src, size = 'md', roleBadge, className }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : null;

  return (
    <div className="relative inline-block">
      <div
        className={cn(
          'rounded-full bg-slate-200 border border-clinical-border flex items-center justify-center font-semibold text-clinical-navy overflow-hidden shrink-0 select-none shadow-subtle',
          sizes[size],
          className
        )}
      >
        {src ? (
          <img src={src} alt={name || 'Avatar'} className="w-full h-full object-cover" />
        ) : initials ? (
          <span>{initials}</span>
        ) : (
          <User className="w-1/2 h-1/2 text-clinical-muted" />
        )}
      </div>
      {roleBadge && (
        <span className="absolute -bottom-0.5 -right-0.5 bg-brand-700 text-white text-[9px] font-extrabold px-1 rounded border border-white uppercase">
          {roleBadge}
        </span>
      )}
    </div>
  );
};
