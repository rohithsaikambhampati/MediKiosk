import { usePatientIntake } from '../../context/PatientIntakeContext';
import React, { useState } from 'react';
import { TimelineEvent } from '../../types/timeline';
import { ConfidenceBadge } from '../confidence/ConfidenceBadge';
import { Card } from '../../components/common/Card';
import { Calendar, ChevronDown, ChevronUp, FileText, Activity, Pill, Stethoscope, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface TimelineProps {
  events: TimelineEvent[];
  onSelectEvent?: (event: TimelineEvent) => void;
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ events, onSelectEvent, className }) => {
  const { t } = usePatientIntake();
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'diagnosis':
        return Stethoscope;
      case 'medication':
        return Pill;
      case 'procedure':
      case 'surgery':
        return Activity;
      case 'lab-report':
        return FileText;
      default:
        return Calendar;
    }
  };

  return (
    <div className={cn('relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200', className)}>
      {events.map((event) => {
        const Icon = getEventIcon(event.type);
        const isExpanded = !!expandedIds[event.id];

        return (
          <div key={event.id} className="relative group">
            {/* Timeline Node Icon */}
            <div
              className={cn(
                'absolute -left-6 top-1.5 w-6 h-6 rounded-full border-2 bg-white flex items-center justify-center transition-colors shadow-subtle',
                event.isAbnormal
                  ? 'border-red-500 text-red-600 bg-red-50'
                  : 'border-brand-700 text-brand-700'
              )}
            >
              <Icon className="w-3 h-3" />
            </div>

            {/* Event Content Card */}
            <Card
              variant={event.isAbnormal ? 'urgent' : 'outline'}
              padding="sm"
              className="flex flex-col gap-2 hover:border-brand-400 transition-all cursor-pointer"
              onClick={() => toggleExpand(event.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-clinical-muted">
                    <span className="text-brand-800 font-bold">{event.year}</span>
                    <span>•</span>
                    <span>{event.date}</span>
                    {event.isAbnormal && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-red-700 font-bold px-1.5 py-0.2 rounded bg-red-100">
                        <AlertTriangle className="w-3 h-3" /> {t('timeline.abnormal', 'Abnormal Report')}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-clinical-navy mt-0.5">{event.title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <ConfidenceBadge level={event.confidence} size="sm" />
                  <button type="button" className="text-clinical-muted hover:text-clinical-navy">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <p className="text-xs text-clinical-slate">{event.description}</p>

              {/* Source Attribution & Tags */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-clinical-border text-[11px] text-clinical-muted">
                <span className="font-medium text-slate-700">{t('timeline.source', 'Source:')} {event.source.title}</span>

                {event.tags && event.tags.length > 0 && (
                  <div className="flex items-center gap-1">
                    {event.tags.map((t) => (
                      <span key={t} className="px-1.5 py-0.2 bg-slate-100 rounded text-slate-600 font-mono">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Expandable Details */}
              {isExpanded && (
                <div className="p-3 mt-1 rounded bg-slate-50 border border-slate-200 text-xs text-clinical-navy animate-in fade-in duration-150">
                  <div className="font-bold text-[11px] uppercase tracking-wider text-clinical-muted mb-1">
                    {t('timeline.evidenceDetail', 'Evidence Detail & Hospital Notes')}
                  </div>
                  <p className="italic text-slate-700">"{event.source.snippetText}"</p>
                  {event.hospitalOrDoctor && (
                    <div className="mt-2 text-[11px] text-slate-500">
                      {t('timeline.hospitalPhysician', 'Hospital / Physician:')} <span className="font-medium text-slate-700">{event.hospitalOrDoctor}</span>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        );
      })}
    </div>
  );
};
