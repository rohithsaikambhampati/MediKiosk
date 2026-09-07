import React from 'react';
import { Button } from '../../components/common/Button';
import { ConfidenceBadge } from '../../features/confidence/ConfidenceBadge';
import { CheckCircle2, ShieldCheck, UserCheck, AlertTriangle, FileText, Lock } from 'lucide-react';
import { ConfidenceLevel } from '../../types/clinical';
import { cn } from '../../utils/cn';

export interface AIReviewPanelProps {
  unverifiedCount: number;
  totalCount: number;
  overallConfidence: ConfidenceLevel;
  onVerifyAll?: () => void;
  onOpenAuditTrail?: () => void;
  className?: string;
}

export const AIReviewPanel: React.FC<AIReviewPanelProps> = ({
  unverifiedCount,
  totalCount,
  overallConfidence,
  onVerifyAll,
  onOpenAuditTrail,
  className,
}) => {
  const isFullyVerified = unverifiedCount === 0;

  return (
    <div className={cn('p-4 rounded-clinical border bg-white shadow-subtle flex flex-col md:flex-row items-center justify-between gap-4', isFullyVerified ? 'border-emerald-200 bg-emerald-50/20' : 'border-amber-200 bg-amber-50/20', className)}>
      <div className="flex items-center gap-3">
        <div className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0', isFullyVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900')}>
          {isFullyVerified ? <UserCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm text-clinical-navy">Doctor Verification & Audit Status</h4>
            <ConfidenceBadge level={overallConfidence} size="sm" />
          </div>
          <p className="text-xs text-clinical-muted mt-0.5">
            {isFullyVerified ? (
              <span className="text-emerald-800 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> All {totalCount} extracted clinical facts verified by attending physician.
              </span>
            ) : (
              <span>
                <strong className="text-amber-800">{unverifiedCount} of {totalCount} facts</strong> require doctor review before locking consultation record.
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
        {onOpenAuditTrail && (
          <Button variant="ghost" size="sm" leftIcon={FileText} onClick={onOpenAuditTrail}>
            View Audit Log
          </Button>
        )}
        {!isFullyVerified && (
          <Button variant="primary" size="sm" leftIcon={CheckCircle2} onClick={onVerifyAll}>
            Verify All Facts
          </Button>
        )}
      </div>
    </div>
  );
};
