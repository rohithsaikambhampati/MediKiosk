import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface StepItem {
  id: string;
  label: string;
}

export interface IntakeProgressProps {
  steps: StepItem[];
  currentStepIndex: number;
  className?: string;
}

export const IntakeProgress: React.FC<IntakeProgressProps> = ({
  steps,
  currentStepIndex,
  className,
}) => {
  return (
    <div className={cn('w-full flex items-center justify-between gap-2 max-w-3xl mx-auto py-2', className)}>
      {steps.map((step, idx) => {
        const isCompleted = idx < currentStepIndex;
        const isCurrent = idx === currentStepIndex;

        return (
          <React.Fragment key={step.id}>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all shrink-0',
                  isCompleted && 'bg-brand-700 text-white',
                  isCurrent && 'bg-brand-100 text-brand-800 border-2 border-brand-700 scale-110 shadow-sm',
                  !isCompleted && !isCurrent && 'bg-slate-100 text-slate-400 border border-slate-200'
                )}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
              </div>
              <span
                className={cn(
                  'text-xs font-semibold hidden md:inline-block',
                  isCurrent && 'text-brand-800 font-bold',
                  isCompleted && 'text-clinical-navy',
                  !isCompleted && !isCurrent && 'text-clinical-muted'
                )}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  'h-1 flex-1 rounded-full transition-colors',
                  idx < currentStepIndex ? 'bg-brand-700' : 'bg-slate-200'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
