import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ShieldCheck, CheckCircle2, FileText, Lock } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ConsentCardProps {
  onAccept: () => void;
  onDecline?: () => void;
  className?: string;
}

export const ConsentCard: React.FC<ConsentCardProps> = ({ onAccept, onDecline, className }) => {
  return (
    <Card variant="default" padding="kiosk" className={cn('flex flex-col gap-6 max-w-2xl mx-auto border-brand-200 shadow-lg', className)}>
      <div className="flex items-center gap-3 pb-4 border-b border-clinical-border">
        <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-clinical-navy">Clinical Privacy & Intake Consent</h2>
          <p className="text-xs sm:text-sm text-clinical-muted mt-0.5">Please review how your intake information will be processed.</p>
        </div>
      </div>

      <div className="space-y-4 text-sm text-clinical-slate bg-slate-50 p-5 rounded-clinical border border-slate-200">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-brand-700 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-clinical-navy">AI Clinical Assistant Notice</h4>
            <p className="text-xs mt-0.5 text-slate-600">
              MediKiosk assists in collecting, structuring, and highlighting your reported symptoms and records before your consultation. <strong>AI does NOT diagnose or prescribe. Your attending physician makes all decisions.</strong>
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-brand-700 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-clinical-navy">Data Privacy & Hospital EMR Integration</h4>
            <p className="text-xs mt-0.5 text-slate-600">
              Your data is encrypted, HIPAA/ABDM compliant, and shared only with your treating clinical care team.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
        {onDecline && (
          <Button variant="outline" size="kiosk" fullWidth onClick={onDecline}>
            Decline & Desk Registration
          </Button>
        )}
        <Button variant="primary" size="kiosk" fullWidth leftIcon={CheckCircle2} onClick={onAccept}>
          I Agree & Continue Intake
        </Button>
      </div>
    </Card>
  );
};
