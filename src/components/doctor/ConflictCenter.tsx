import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { AlertTriangle, FileText, Mic, CheckCircle2 } from 'lucide-react';

export interface ConflictCenterProps {
  onOpenSources: () => void;
  onMarkResolved?: () => void;
  className?: string;
}

export const ConflictCenter: React.FC<ConflictCenterProps> = ({
  onOpenSources,
  onMarkResolved,
  className,
}) => {
  return (
    <Card
      variant="urgent"
      padding="md"
      className="border-l-4 border-l-amber-500 bg-amber-50/90 shadow-md space-y-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 mt-0.5 font-bold">
            <AlertTriangle className="w-5 h-5 text-amber-700" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm text-amber-950">⚠ CLINICAL INFORMATION CONFLICT</h4>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                Sources Disagree
              </span>
            </div>

            <p className="text-xs text-amber-900 font-medium mt-1">
              Metformin dosage differs between intake sources:
            </p>

            <div className="text-xs text-amber-950 mt-1.5 space-y-1 bg-amber-100/60 p-2.5 rounded-clinical border border-amber-200/80">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium">
                  <Mic className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <strong>Patient Reported:</strong>
                </span>
                <span className="font-bold text-amber-950 bg-white px-2 py-0.5 rounded border border-amber-300 font-mono">
                  500 mg BD
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-amber-200/80 pt-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <FileText className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <strong>Latest Prescription (Feb 2025):</strong>
                </span>
                <span className="font-bold text-amber-950 bg-white px-2 py-0.5 rounded border border-amber-300 font-mono">
                  850 mg BD
                </span>
              </div>
            </div>

            <p className="text-[11px] text-amber-800 italic mt-1.5">
              MediKiosk flags discrepancies for human review. Attending physician determines verified dosage.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          <Button
            variant="outline"
            size="sm"
            leftIcon={FileText}
            onClick={onOpenSources}
            className="border-amber-300 bg-white hover:bg-amber-100 text-amber-950 font-bold"
          >
            View Evidence
          </Button>

          {onMarkResolved && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={CheckCircle2}
              onClick={onMarkResolved}
              className="text-amber-900 hover:bg-amber-100"
            >
              Review & Resolve
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
