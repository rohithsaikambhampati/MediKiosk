import React from 'react';
import { AuditEvent } from '../../types/admin';
import { Button } from '../common/Button';
import { X, ShieldCheck, Clock, UserCheck, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface AuditDetailDrawerProps {
  event: AuditEvent | null;
  onClose: () => void;
}

export const AuditDetailDrawer: React.FC<AuditDetailDrawerProps> = ({ event, onClose }) => {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-200">
        <div>
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="font-extrabold text-sm text-white">Clinical Audit Event Detail</h3>
                <p className="text-[10px] text-slate-400 font-mono">Trace Event ID: AUD-{event.id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Event Metadata Body */}
          <div className="p-5 space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-clinical flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>Recorded Timestamp:</span>
              </div>
              <span className="text-xs font-mono font-black text-slate-900">{event.timestamp}</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">
                  Actor & Role
                </label>
                <div className="p-2.5 bg-white border border-slate-200 rounded-clinical flex items-center gap-2.5">
                  <UserCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <strong className="text-xs font-bold text-slate-900 block">{event.actor}</strong>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
                      {event.role}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">
                  Action Executed
                </label>
                <div className="p-2.5 bg-white border border-slate-200 rounded-clinical font-semibold text-xs text-slate-900">
                  {event.action}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">
                  Target Resource / Token
                </label>
                <div className="p-2.5 bg-white border border-slate-200 rounded-clinical font-mono font-bold text-xs text-indigo-900 bg-indigo-50/50">
                  {event.resource}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">
                  Outcome Status
                </label>
                <div className="p-2.5 bg-white border border-slate-200 rounded-clinical flex items-center justify-between">
                  <span
                    className={cn(
                      'text-xs font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1.5',
                      event.status === 'Success'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        : 'bg-amber-100 text-amber-900 border border-amber-200'
                    )}
                  >
                    {event.status === 'Success' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                    )}
                    <span>{event.status}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Code: 200 OK</span>
                </div>
              </div>

              {event.details && (
                <div>
                  <label className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">
                    Extended Context & Audit Details
                  </label>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-clinical text-xs font-mono text-slate-700 leading-relaxed">
                    <FileText className="w-4 h-4 text-slate-400 mb-1" />
                    {event.details}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="font-bold text-xs">
            Close Event Inspector
          </Button>
        </div>
      </div>
    </div>
  );
};
