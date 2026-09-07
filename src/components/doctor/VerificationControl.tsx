import React from 'react';
import { VerificationStatus } from '../../types/clinical';
import { Button } from '../common/Button';
import { CheckCircle2, ShieldAlert, Edit3, XCircle, UserCheck } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface VerificationControlProps {
  factId: string;
  status: VerificationStatus;
  doctorNotes?: string;
  onVerify: (factId: string) => void;
  onReject?: (factId: string) => void;
  onEdit?: (factId: string) => void;
  compact?: boolean;
  className?: string;
}

export const VerificationControl: React.FC<VerificationControlProps> = ({
  factId,
  status,
  doctorNotes,
  onVerify,
  onReject,
  onEdit,
  compact = false,
  className,
}) => {
  const isVerified = status === 'doctor-verified';

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      {/* Current Status Pill */}
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border select-none',
          isVerified
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
            : status === 'needs-verification'
            ? 'bg-amber-50 text-amber-900 border-amber-300'
            : status === 'patient-reported'
            ? 'bg-sky-50 text-sky-900 border-sky-300'
            : 'bg-indigo-50 text-indigo-900 border-indigo-200'
        )}
      >
        {isVerified ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Doctor Verified</span>
          </>
        ) : status === 'needs-verification' ? (
          <>
            <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
            <span>Needs Verification</span>
          </>
        ) : status === 'patient-reported' ? (
          <>
            <UserCheck className="w-3.5 h-3.5 text-sky-700" />
            <span>Patient Reported</span>
          </>
        ) : (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            <span>AI Extracted</span>
          </>
        )}
      </span>

      {/* Doctor Audit Timestamp Stamp */}
      {isVerified && !compact && (
        <span className="text-[11px] text-emerald-800 font-medium">
          Verified by Dr. Ananya Sharma • <span className="font-mono text-[10px]">Today 10:42 AM</span>
        </span>
      )}

      {/* Action Buttons */}
      {!isVerified && (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            leftIcon={CheckCircle2}
            onClick={() => onVerify(factId)}
            className="text-xs py-1 h-7 border-emerald-300 hover:bg-emerald-50 text-emerald-800 font-bold"
          >
            Verify
          </Button>

          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={Edit3}
              onClick={() => onEdit(factId)}
              className="text-xs py-1 h-7 text-slate-600"
            >
              Edit
            </Button>
          )}

          {onReject && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={XCircle}
              onClick={() => onReject(factId)}
              className="text-xs py-1 h-7 text-red-600 hover:bg-red-50"
            >
              Reject
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
