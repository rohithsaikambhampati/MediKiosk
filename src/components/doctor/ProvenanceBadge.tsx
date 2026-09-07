import React from 'react';
import { UserCheck, FileText, Sparkles, Stethoscope } from 'lucide-react';
import { cn } from '../../utils/cn';

export type ProvenanceType = 'patient-reported' | 'document-derived' | 'ai-extracted' | 'doctor-verified';

export interface ProvenanceBadgeProps {
  type: ProvenanceType;
  className?: string;
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({ type, className }) => {
  const config = {
    'patient-reported': {
      label: 'Patient Reported',
      icon: UserCheck,
      style: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    'document-derived': {
      label: 'Document Derived',
      icon: FileText,
      style: 'bg-sky-50 text-sky-800 border-sky-200',
    },
    'ai-extracted': {
      label: 'AI Extracted',
      icon: Sparkles,
      style: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    },
    'doctor-verified': {
      label: 'Doctor Verified',
      icon: Stethoscope,
      style: 'bg-teal-50 text-teal-900 border-teal-300 font-bold',
    },
  }[type];

  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border select-none',
        config.style,
        className
      )}
    >
      <Icon className="w-3 h-3 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
};
