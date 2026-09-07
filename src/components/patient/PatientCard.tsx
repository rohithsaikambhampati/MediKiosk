import React from 'react';
import { Patient } from '../../types/clinical';
import { RiskBadge } from '../../features/risk/RiskBadge';
import { StatusBadge } from '../common/StatusBadge';
import { Card } from '../../components/common/Card';
import { Avatar } from '../../components/common/Avatar';
import { Clock, FileText, AlertTriangle, ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface PatientCardProps {
  patient: Patient;
  onSelect?: (patient: Patient) => void;
  isActive?: boolean;
  className?: string;
}

export const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  onSelect,
  isActive = false,
  className,
}) => {
  return (
    <Card
      variant="interactive"
      padding="sm"
      onClick={() => onSelect && onSelect(patient)}
      className={cn(
        'flex flex-col gap-3 transition-all border',
        isActive ? 'border-brand-700 bg-brand-50/30 ring-1 ring-brand-700 shadow-md' : 'border-clinical-border',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={patient.name} src={patient.photoUrl} size="md" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-clinical-navy">{patient.name}</h3>
              <span className="text-xs font-medium text-clinical-muted">
                {patient.age}y • {patient.gender[0].toUpperCase()}
              </span>
            </div>
            <div className="text-xs font-mono text-slate-500 mt-0.5">
              MRN: <span className="font-bold text-slate-700">{patient.mrn}</span>
            </div>
          </div>
        </div>

        <RiskBadge level={patient.triagePriority} size="sm" />
      </div>

      {/* Chief Complaint Brief */}
      <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs text-clinical-navy line-clamp-2 font-medium">
        "{patient.chiefComplaint}"
      </div>

      {/* Status & Indicators Footer */}
      <div className="flex items-center justify-between text-xs text-clinical-muted pt-2 border-t border-clinical-border">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-brand-700" />
            <span>{patient.arrivalTime}</span>
          </span>
          <span className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <span>{patient.documentsUploadedCount} docs</span>
          </span>
          {patient.unverifiedFactsCount > 0 && (
            <span className="flex items-center gap-1 text-amber-700 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{patient.unverifiedFactsCount} unverified</span>
            </span>
          )}
        </div>

        <ArrowRight className="w-4 h-4 text-clinical-muted group-hover:text-brand-700 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Card>
  );
};
