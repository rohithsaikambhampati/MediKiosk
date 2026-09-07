import React from 'react';
import { Card } from '../common/Card';
import { ShieldAlert, AlertTriangle, CheckSquare, Stethoscope } from 'lucide-react';

export interface TriageReasonPanelProps {
  whyFlagged: string[];
  priority: string;
  className?: string;
}

export const TriageReasonPanel: React.FC<TriageReasonPanelProps> = ({
  whyFlagged,
  priority,
  className,
}) => {
  return (
    <Card
      variant={priority === 'immediate' ? 'urgent' : 'default'}
      padding="md"
      className="bg-white border-2 border-red-200 shadow-sm space-y-3"
    >
      <div className="flex items-center justify-between border-b border-red-100 pb-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-700" />
          <h4 className="font-extrabold text-sm text-red-950 uppercase tracking-wide">
            Why Was This Patient Flagged?
          </h4>
        </div>
        <span className="text-[10px] uppercase font-extrabold bg-red-100 text-red-900 px-2 py-0.5 rounded-full border border-red-200">
          AI Risk Signal Summary
        </span>
      </div>

      {/* Structured Signal Badges */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
          Detected Intake Signals:
        </span>
        <div className="flex flex-wrap gap-2">
          {whyFlagged.map((signal, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-clinical text-xs font-extrabold bg-red-50 text-red-950 border border-red-200 shadow-xs"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span>{signal}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Mandatory Safety & Protocol Disclaimer */}
      <div className="p-3 rounded-clinical bg-amber-50/90 border border-amber-200 text-xs text-amber-950 space-y-1">
        <div className="font-extrabold flex items-center gap-1.5 text-amber-900">
          <Stethoscope className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Potential clinical red flags detected.</span>
        </div>
        <p className="text-[11px] text-amber-900 font-medium leading-relaxed">
          Symptoms require clinical review. Review patient with appropriate clinical protocol.
          Attending clinical staff maintains sole diagnostic authority.
        </p>
      </div>
    </Card>
  );
};
