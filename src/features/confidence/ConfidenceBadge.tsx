import { usePatientIntake } from '../../context/PatientIntakeContext';
import React from 'react';
import { Check, HelpCircle, AlertCircle } from 'lucide-react';
import { ConfidenceLevel } from '../../types/clinical';
import { cn } from '../../utils/cn';

export interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
  score?: number; // e.g. 0.95 -> 95%
  showScore?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  level,
  score,
  showScore = false,
  size = 'md',
  className,
}) => {
  const { t } = usePatientIntake();
  const config: Record<ConfidenceLevel, { label: string; icon: any; styles: string }> = {
    high: {
      label: t('badge.highConfidence', 'High AI Confidence'),
      icon: Check,
      styles: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    medium: {
      label: t('badge.moderateConfidence', 'Moderate AI Confidence'),
      icon: HelpCircle,
      styles: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    low: {
      label: 'Needs Verification',
      icon: AlertCircle,
      styles: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    },
  };

  const item = config[level] || config.medium;
  const Icon = item.icon;

  const displayPercent = score ? `${Math.round(score * 100)}%` : null;

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border text-xs px-2.5 py-0.5 gap-1.5 transition-colors select-none',
        item.styles,
        size === 'sm' && 'text-[11px] px-2 py-0.2 gap-1',
        className
      )}
      title="AI extraction confidence estimate"
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{item.label}</span>
      {showScore && displayPercent && (
        <span className="font-semibold opacity-75 border-l border-current pl-1.5 ml-0.5">
          {displayPercent}
        </span>
      )}
    </span>
  );
};
