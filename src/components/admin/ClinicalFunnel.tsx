import React from 'react';
import { Card } from '../common/Card';
import { ChevronRight, ArrowDown } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface FunnelStage {
  label: string;
  count: number;
  subtext?: string;
  colorClass: string;
}

export const CLINICAL_FUNNEL_STAGES: FunnelStage[] = [
  { label: 'Patients Arrived', count: 1284, subtext: 'Total Kiosk Entry', colorClass: 'bg-indigo-700 text-white' },
  { label: 'Identity Verified', count: 1240, subtext: '96.5% Conversion', colorClass: 'bg-sky-700 text-white' },
  { label: 'Intake Started', count: 1180, subtext: '91.9% Conversion', colorClass: 'bg-sky-600 text-white' },
  { label: 'Intake Completed', count: 1146, subtext: '89.2% Conversion', colorClass: 'bg-emerald-600 text-white' },
  { label: 'Triage Reviewed', count: 1092, subtext: '85.0% Conversion', colorClass: 'bg-teal-600 text-white' },
  { label: 'Ready for Doctor', count: 1010, subtext: '78.6% Conversion', colorClass: 'bg-blue-600 text-white' },
  { label: 'Consultation Completed', count: 920, subtext: '71.6% Conversion', colorClass: 'bg-indigo-900 text-white' },
];

export const ClinicalFunnel: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <Card padding="md" className={cn('bg-white border-clinical-border shadow-sm space-y-3', className)}>
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div>
          <h3 className="font-extrabold text-sm text-clinical-navy uppercase tracking-wide">
            Clinical Workflow Throughput Funnel
          </h3>
          <p className="text-xs text-clinical-muted font-medium">
            Visual progression of today's 1,284 MediKiosk intake sessions.
          </p>
        </div>
        <span className="text-[10px] uppercase font-bold bg-emerald-50 text-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-200">
          91% Intake Completion
        </span>
      </div>

      {/* Horizontal Desktop Funnel */}
      <div className="hidden md:flex items-center justify-between gap-1 overflow-x-auto pt-2">
        {CLINICAL_FUNNEL_STAGES.map((stage, idx) => (
          <React.Fragment key={stage.label}>
            <div className="flex-1 min-w-[120px] text-center p-2.5 rounded-clinical bg-slate-50 border border-slate-200 hover:border-sky-300 transition-all space-y-1">
              <span className="text-[10px] uppercase font-extrabold text-slate-500 block truncate">
                {stage.label}
              </span>
              <div className="text-lg font-black font-mono text-slate-900">
                {stage.count.toLocaleString()}
              </div>
              <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-100 block">
                {stage.subtext}
              </span>
            </div>

            {idx < CLINICAL_FUNNEL_STAGES.length - 1 && (
              <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Vertical Mobile/Tablet Stack */}
      <div className="md:hidden space-y-2 pt-2">
        {CLINICAL_FUNNEL_STAGES.map((stage, idx) => (
          <div key={stage.label} className="space-y-1">
            <div className="p-3 rounded-clinical bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <strong className="text-xs font-bold text-slate-900 block">{stage.label}</strong>
                <span className="text-[10px] text-slate-500">{stage.subtext}</span>
              </div>
              <span className="text-base font-black font-mono text-slate-900">{stage.count.toLocaleString()}</span>
            </div>
            {idx < CLINICAL_FUNNEL_STAGES.length - 1 && (
              <ArrowDown className="w-3.5 h-3.5 text-slate-400 mx-auto" />
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
