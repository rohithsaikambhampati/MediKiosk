import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { NURSE_ROUTES } from '../constants/routes';
import { BRAND } from '../constants/tokens';
import { Avatar } from '../components/common/Avatar';
import { DevRoleSwitcher } from './DevRoleSwitcher';
import { NurseTriageProvider, useNurseTriage } from '../context/NurseTriageContext';
import {
  LayoutDashboard,
  Users,
  Activity,
  AlertTriangle,
  LogOut,
  Bell,
  Building2,
  Clock,
  ShieldCheck,
  X,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../utils/cn';

const NurseLayoutContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { alerts, patients, setActivePatientId } = useNurseTriage();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const newAlertsCount = alerts.filter((a) => a.status === 'new').length;

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: NURSE_ROUTES.DASHBOARD },
    { label: 'Triage Queue', icon: Users, path: NURSE_ROUTES.QUEUE, badge: patients.length },
    { label: 'Triage Workspace', icon: Activity, path: NURSE_ROUTES.TRIAGE },
    {
      label: 'Urgent Alerts',
      icon: AlertTriangle,
      path: NURSE_ROUTES.ALERTS,
      badge: newAlertsCount,
      badgeVariant: 'urgent',
    },
  ];

  const handleOpenAlertPatient = (patientId: string) => {
    setActivePatientId(patientId);
    navigate(NURSE_ROUTES.TRIAGE);
    setIsNotificationsOpen(false);
  };

  return (
    <div className="min-h-screen bg-clinical-bg flex">
      {/* Triage Operational Left Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 shrink-0 sticky top-0 h-screen">
        <div>
          <div className="p-4 border-b border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-clinical bg-sky-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
              MK
            </div>
            <div>
              <h1 className="font-extrabold text-sm text-white tracking-tight">{BRAND.NAME}</h1>
              <p className="text-[10px] text-sky-400 font-bold uppercase tracking-wide">
                Clinical Triage Portal
              </p>
            </div>
          </div>

          <nav className="p-3 space-y-1">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-3 py-2">
              Operational Controls
            </div>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-clinical text-xs font-semibold transition-all select-none',
                    isActive ? 'bg-sky-700 text-white shadow-sm font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate flex-1 text-left">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={cn(
                        'px-2 py-0.5 text-[10px] font-extrabold rounded-full',
                        item.badgeVariant === 'urgent'
                          ? 'bg-red-600 text-white animate-pulse'
                          : 'bg-sky-800 text-white'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Avatar name="Nurse Priya" roleBadge="RN" size="sm" />
            <div>
              <div className="text-xs font-bold text-white">Nurse Priya, RN</div>
              <div className="text-[10px] text-sky-400 font-medium">Triage Desk 02</div>
            </div>
          </div>
          <button
            onClick={() => navigate(NURSE_ROUTES.LOGIN)}
            className="text-slate-400 hover:text-white p-1.5 rounded hover:bg-slate-800"
            title="Logout of Triage Portal"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-clinical-border sticky top-0 z-20 px-6 py-3 flex items-center justify-between shadow-subtle">
          <div className="flex items-center gap-3 font-bold text-sm text-clinical-navy">
            <Activity className="w-4 h-4 text-sky-700" />
            <span>Triage Unit Console</span>
            <span className="text-xs font-semibold text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-brand-700" /> Dept: General Medicine
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full text-[11px]">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Shift: Morning (08:00 - 16:00)</span>
            </div>

            {/* Notification Bell Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-1.5 rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                title="Triage Notifications"
              >
                <Bell className="w-5 h-5" />
                {newAlertsCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center animate-bounce">
                    {newAlertsCount}
                  </span>
                )}
              </button>

              {/* Notification Drawer Popover */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-4 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span>Live Triage Alerts ({newAlertsCount} New)</span>
                    </div>
                    <button
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        onClick={() => handleOpenAlertPatient(alert.patientId)}
                        className={cn(
                          'p-2.5 rounded-clinical border text-xs cursor-pointer hover:bg-slate-50 transition-colors space-y-1',
                          alert.severity === 'immediate'
                            ? 'bg-red-50/50 border-red-200'
                            : 'bg-amber-50/50 border-amber-200'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-900">
                            {alert.token} • {alert.patientName}
                          </span>
                          <span className="text-[10px] font-bold text-red-700 uppercase">
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-700 font-medium">
                          {alert.triggerTitle}
                        </p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      navigate(NURSE_ROUTES.ALERTS);
                      setIsNotificationsOpen(false);
                    }}
                    className="w-full text-center text-xs font-bold text-brand-700 hover:text-brand-800 pt-2 border-t border-slate-100 flex items-center justify-center gap-1"
                  >
                    View All Triage Alerts <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <Avatar name="Nurse Priya" roleBadge="RN" size="sm" />
              <div className="hidden md:block text-left">
                <div className="font-bold text-slate-900 text-xs">Nurse Priya, RN</div>
                <div className="text-[10px] text-slate-500 font-medium">Triage Desk 02</div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      <DevRoleSwitcher currentRole="nurse" onRoleChange={() => {}} />
    </div>
  );
};

export const NurseLayout: React.FC = () => {
  return (
    <NurseTriageProvider>
      <NurseLayoutContent />
    </NurseTriageProvider>
  );
};

export default NurseLayout;
