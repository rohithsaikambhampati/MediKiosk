import React from 'react';
import { DepartmentMetric } from '../../types/admin';
import { LoadIndicator } from './LoadIndicator';
import { Button } from '../common/Button';
import { X, Building2, Users, Clock, AlertTriangle, Stethoscope } from 'lucide-react';

export interface DepartmentDetailDrawerProps {
  department: DepartmentMetric | null;
  onClose: () => void;
}

export const DepartmentDetailDrawer: React.FC<DepartmentDetailDrawerProps> = ({
  department,
  onClose,
}) => {
  if (!department) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-200">
        <div>
          {/* Header */}
          <div className="p-4 bg-indigo-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-clinical bg-indigo-800 flex items-center justify-center font-bold text-white text-base">
                {department.code}
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">{department.name}</h3>
                <p className="text-xs text-indigo-300 font-medium">Department Operational Performance</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-indigo-300 hover:text-white p-1 rounded hover:bg-indigo-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Operational Load Banner */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-clinical flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Current Operational Load:</span>
              <LoadIndicator load={department.load} />
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white border border-slate-200 rounded-clinical space-y-1">
                <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Patients Today</span>
                <span className="text-xl font-black font-mono text-slate-900">{department.patientsToday}</span>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-clinical space-y-1">
                <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Intake Completion</span>
                <span className="text-xl font-black font-mono text-emerald-800">{department.completedIntakePercent}%</span>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-clinical space-y-1">
                <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Active Physicians</span>
                <span className="text-xl font-black font-mono text-indigo-900 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-indigo-600" />
                  {department.activeDoctors}
                </span>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-clinical space-y-1">
                <span className="text-[10px] uppercase font-extrabold text-amber-800 block">High Priority Cases</span>
                <span className="text-xl font-black font-mono text-amber-950 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  {department.highPriorityCases}
                </span>
              </div>
            </div>

            {/* Throughput Durations */}
            <div className="space-y-2">
              <h4 className="text-xs uppercase font-extrabold text-slate-500 tracking-wider">
                Intake & Review Duration Benchmarks
              </h4>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-clinical space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Avg Kiosk Intake Duration:</span>
                  <strong className="font-mono font-bold text-slate-900">{department.avgIntakeTime}</strong>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Avg Triage Review Time:</span>
                  <strong className="font-mono font-bold text-slate-900">{department.avgTriageTime}</strong>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Avg Doctor Pre-Consultation Review:</span>
                  <strong className="font-mono font-bold text-indigo-900">{department.avgDoctorTime}</strong>
                </div>
              </div>
            </div>

            {/* Operational Queue Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs uppercase font-extrabold text-slate-500 tracking-wider">
                Current Operational Queue
              </h4>
              <div className="p-3 bg-white border border-slate-200 rounded-clinical space-y-2">
                <div className="flex items-center justify-between text-xs p-2 bg-amber-50/60 rounded border border-amber-100">
                  <span className="font-bold text-amber-950">Awaiting Nurse Triage:</span>
                  <span className="font-mono font-black text-amber-950">{department.awaitingTriage} patients</span>
                </div>
                <div className="flex items-center justify-between text-xs p-2 bg-indigo-50/60 rounded border border-indigo-100">
                  <span className="font-bold text-indigo-950">Ready for Doctor Consultation:</span>
                  <span className="font-mono font-black text-indigo-950">{department.readyForDoctor} patients</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="font-bold text-xs">
            Close Department View
          </Button>
        </div>
      </div>
    </div>
  );
};
