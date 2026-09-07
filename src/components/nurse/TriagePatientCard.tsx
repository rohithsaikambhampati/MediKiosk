import React from 'react';
import { TriagePatient } from '../../types/triage';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { RiskBadge } from '../../features/risk/RiskBadge';
import { TriageStatusBadge } from './TriageStatusBadge';
import { Avatar } from '../common/Avatar';
import { AlertTriangle, Clock, Eye, FileText, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface TriagePatientCardProps {
  patient: TriagePatient;
  onReview: (patient: TriagePatient) => void;
  onOpenPatientStory?: (patient: TriagePatient) => void;
  className?: string;
}

export const TriagePatientCard: React.FC<TriagePatientCardProps> = ({
  patient,
  onReview,
  onOpenPatientStory,
  className,
}) => {
  const isImmediate = patient.priority === 'immediate';

  return (
    <Card
      variant={isImmediate ? 'urgent' : 'default'}
      padding="md"
      className={cn(
        'bg-white border-clinical-border shadow-card hover:shadow-lg transition-all flex flex-col justify-between gap-4',
        isImmediate && 'border-l-4 border-l-red-600 bg-red-50/20',
        className
      )}
    >
      {/* Top Card Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black font-mono text-clinical-navy bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
              {patient.token}
            </span>
            <Avatar name={patient.name} roleBadge="PAT" size="sm" />
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                {patient.name}
              </h4>
              <span className="text-[11px] text-clinical-muted font-medium">
                {patient.age} yrs • {patient.gender.toUpperCase()}
              </span>
            </div>
          </div>

          <RiskBadge level={patient.riskLevel} size="sm" />
        </div>

        {/* Chief Complaint */}
        <div className="p-2.5 rounded-clinical bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800">
          “{patient.chiefComplaint}”
        </div>

        {/* Why Flagged Section */}
        {patient.whyFlagged && patient.whyFlagged.length > 0 && (
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider block">
              Why Flagged:
            </span>
            <div className="flex flex-wrap gap-1">
              {patient.whyFlagged.map((flag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-100/80 text-red-950 border border-red-200"
                >
                  <AlertTriangle className="w-2.5 h-2.5 text-red-600 shrink-0" />
                  <span>{flag}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Card Footer Info & Actions */}
      <div className="pt-3 border-t border-slate-200 space-y-3">
        <div className="flex items-center justify-between text-[11px] font-medium text-clinical-muted">
          <TriageStatusBadge status={patient.status} size="sm" />

          <div className="flex items-center gap-1 font-mono font-bold text-slate-700">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Waiting: {patient.waitTime}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenPatientStory && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={FileText}
              onClick={() => onOpenPatientStory(patient)}
              className="flex-1 text-xs py-1.5 border-slate-300 hover:bg-slate-50 text-slate-700"
            >
              Patient Story
            </Button>
          )}

          <Button
            variant={isImmediate ? 'danger' : 'primary'}
            size="sm"
            rightIcon={ChevronRight}
            onClick={() => onReview(patient)}
            className="flex-1 text-xs py-1.5 shadow-xs font-bold"
          >
            Review Triage
          </Button>
        </div>
      </div>
    </Card>
  );
};
