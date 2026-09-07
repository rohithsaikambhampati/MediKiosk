import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { AlertOctagon, ArrowRight, ShieldAlert, X } from 'lucide-react';
import { TriagePatient } from '../../types/triage';

export interface EscalationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  patient: TriagePatient | null;
}

export const EscalationModal: React.FC<EscalationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  patient,
}) => {
  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card variant="urgent" padding="lg" className="max-w-md w-full bg-white border-2 border-red-300 shadow-2xl space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold shrink-0">
              <AlertOctagon className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-red-950">Escalate This Case?</h3>
              <p className="text-xs text-red-800 font-medium">Immediate Clinical Staff Priority Marker</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 rounded-clinical bg-red-50 border border-red-200 space-y-1 text-xs text-red-950">
          <div className="font-bold">
            Patient: {patient.name} ({patient.token})
          </div>
          <p className="text-red-900">
            This will mark the patient for immediate clinical staff review and flag the triage alert as escalated.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            leftIcon={AlertOctagon}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="shadow-sm font-bold"
          >
            Escalate Case
          </Button>
        </div>
      </Card>
    </div>
  );
};

export interface SendToDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  patient: TriagePatient | null;
}

export const SendToDoctorModal: React.FC<SendToDoctorModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  patient,
}) => {
  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card variant="default" padding="lg" className="max-w-md w-full bg-white border-2 border-emerald-300 shadow-2xl space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
              <ArrowRight className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Send Patient to Doctor Queue?</h3>
              <p className="text-xs text-slate-500 font-medium">Pre-consultation intake handoff</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 rounded-clinical bg-emerald-50 border border-emerald-200 space-y-1.5 text-xs text-emerald-950">
          <div className="font-extrabold text-slate-900">
            Patient: {patient.name} ({patient.token})
          </div>
          <div className="text-emerald-900">
            Department: <strong>{patient.department}</strong> • Priority: <strong>{patient.priority.toUpperCase()}</strong>
          </div>
          <p className="text-[11px] text-emerald-800 italic pt-1 border-t border-emerald-200/80">
            Status will update to <strong>“Ready for Doctor Review”</strong> in the physician's workspace queue console.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={ArrowRight}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm font-bold"
          >
            Confirm Handoff
          </Button>
        </div>
      </Card>
    </div>
  );
};
