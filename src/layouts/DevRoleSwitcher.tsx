import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types/clinical';
import { PATIENT_ROUTES, DOCTOR_ROUTES, NURSE_ROUTES, ADMIN_ROUTES } from '../constants/routes';
import { UserCheck, Stethoscope, HeartPulse, ShieldAlert, Monitor, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '../utils/cn';

export interface DevRoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const DevRoleSwitcher: React.FC<DevRoleSwitcherProps> = ({ currentRole, onRoleChange }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const roles: { role: UserRole; label: string; icon: any; defaultPath: string; color: string }[] = [
    { role: 'patient', label: 'Patient Kiosk', icon: UserCheck, defaultPath: PATIENT_ROUTES.WELCOME, color: 'bg-emerald-600' },
    { role: 'doctor', label: 'Doctor Workspace', icon: Stethoscope, defaultPath: DOCTOR_ROUTES.DASHBOARD, color: 'bg-teal-700' },
    { role: 'nurse', label: 'Nurse / Triage', icon: HeartPulse, defaultPath: NURSE_ROUTES.DASHBOARD, color: 'bg-sky-600' },
    { role: 'admin', label: 'Admin Portal', icon: ShieldAlert, defaultPath: ADMIN_ROUTES.DASHBOARD, color: 'bg-indigo-700' },
  ];

  const handleSwitch = (item: (typeof roles)[0]) => {
    onRoleChange(item.role);
    navigate(item.defaultPath);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-3 right-3 z-50 select-none">
      {/* Collapsed Pill Trigger - Clearly labeled Presentation Mode / Demo Role */}
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white px-3 py-1.5 rounded-full text-[11px] font-bold border border-slate-700/80 shadow-lg backdrop-blur-md flex items-center gap-1.5 transition-all opacity-80 hover:opacity-100"
          title="Toggle Presentation Mode Role Switcher"
        >
          <Monitor className="w-3.5 h-3.5 text-amber-400" />
          <span>Demo Role</span>
          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        </button>
      ) : (
        /* Expanded Role Options Panel */
        <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-2xl backdrop-blur-lg border border-slate-700 space-y-2 max-w-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[10px] uppercase font-bold tracking-wider text-slate-400">
            <span className="flex items-center gap-1 text-amber-400 font-bold">
              <Monitor className="w-3.5 h-3.5" /> Presentation Mode
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-0.5 rounded"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-1">
            {roles.map((item) => {
              const isActive = currentRole === item.role;
              const Icon = item.icon;
              return (
                <button
                  key={item.role}
                  onClick={() => handleSwitch(item)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-clinical transition-all',
                    isActive
                      ? `${item.color} text-white shadow-sm font-bold`
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <span className="text-[10px] uppercase font-bold bg-white/20 px-1.5 py-0.5 rounded">Active</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
