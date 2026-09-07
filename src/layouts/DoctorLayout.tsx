import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { DOCTOR_ROUTES } from '../constants/routes';
import { BRAND } from '../constants/tokens';
import { Avatar } from '../components/common/Avatar';
import { SearchInput } from '../components/common/SearchInput';
import { DoctorWorkspaceProvider, useDoctorWorkspace } from '../context/DoctorWorkspaceContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  LineChart,
  Bell,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '../utils/cn';

const DoctorLayoutContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const { searchQuery, setSearchQuery, queue } = useDoctorWorkspace();

  const urgentCount = queue.filter((p) => p.riskLevel === 'immediate').length;

  const primaryNavItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: DOCTOR_ROUTES.DASHBOARD },
    { label: 'Patient Queue', icon: Users, path: DOCTOR_ROUTES.QUEUE, badge: urgentCount, badgeVariant: 'urgent' },
    { label: 'Patient Workspace', icon: UserCheck, path: DOCTOR_ROUTES.PATIENT_OVERVIEW.replace(':patientId', 'patient-ramesh-01') },
    { label: 'Consultation Handoff', icon: LineChart, path: DOCTOR_ROUTES.CONSULTATION },
  ];

  return (
    <div className="min-h-screen bg-clinical-bg flex">
      {/* Compact Doctor Left Sidebar */}
      <aside
        className={cn(
          'bg-slate-900 text-slate-300 flex flex-col justify-between transition-all duration-300 z-30 border-r border-slate-800 shrink-0 sticky top-0 h-screen',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <div>
          {/* Brand Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-clinical bg-brand-700 text-white flex items-center justify-center font-bold text-base">
                  MK
                </div>
                <div>
                  <h1 className="font-bold text-sm text-white tracking-tight">{BRAND.NAME}</h1>
                  <p className="text-[10px] text-slate-400 font-medium">Doctor Workspace</p>
                </div>
              </div>
            )}
            {collapsed && (
              <div className="w-8 h-8 rounded-clinical bg-brand-700 text-white flex items-center justify-center font-bold text-base mx-auto">
                MK
              </div>
            )}

            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors hidden sm:block"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Primary Nav Links */}
          <nav className="p-2 space-y-1">
            <div className={cn('text-[10px] uppercase font-bold tracking-wider text-slate-500 px-3 py-2', collapsed && 'sr-only')}>
              Clinical Operations
            </div>
            {primaryNavItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path.includes('/patient/') && location.pathname.includes('/patient/'));
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-clinical text-xs font-semibold transition-all select-none',
                    isActive
                      ? 'bg-brand-700 text-white shadow-subtle'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
                  {!collapsed && item.badge && item.badge > 0 ? (
                    <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-red-600 text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          {/* Secondary Nav Links — no external navigation, use local panels */}
          <nav className="p-2 space-y-1 border-t border-slate-800/60 mt-2">
            <div className={cn('text-[10px] uppercase font-bold tracking-wider text-slate-500 px-3 py-2', collapsed && 'sr-only')}>
              Account & System
            </div>
            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowSettings(false); }}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-clinical transition-all select-none text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              title={collapsed ? 'Notifications' : undefined}
            >
              <Bell className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="flex-1 text-left">Notifications</span>}
              {!collapsed && <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-red-600 text-white">2</span>}
            </button>
            <button
              onClick={() => { setShowSettings(!showSettings); setShowNotifications(false); }}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-clinical transition-all select-none text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              title={collapsed ? 'Settings' : undefined}
            >
              <Settings className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="flex-1 text-left">Settings</span>}
            </button>
            <button
              className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-clinical transition-all select-none text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              title={collapsed ? 'My Profile' : undefined}
            >
              <User className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="flex-1 text-left">My Profile</span>}
            </button>
          </nav>

          {/* Notifications Panel */}
          {showNotifications && (
            <div className="mx-2 mb-2 p-3 bg-slate-800 rounded-clinical border border-slate-700 space-y-2 text-xs">
              <div className="font-bold text-white flex items-center justify-between">
                <span>Clinical Notifications</span>
                <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-white"><AlertTriangle className="w-3.5 h-3.5" /></button>
              </div>
              <div className="p-2 bg-red-900/40 border border-red-700 rounded text-red-200 font-medium">
                🔴 Patient Ramesh Kumar — Immediate risk flag requires review.
              </div>
              <div className="p-2 bg-amber-900/40 border border-amber-700 rounded text-amber-200 font-medium">
                🟠 Patient Mohan Singh — Nurse escalation received.
              </div>
              <div className="p-2 bg-slate-700 rounded text-slate-300">
                ✅ 12 patients ready in today's consultation queue.
              </div>
            </div>
          )}

          {/* Settings Panel */}
          {showSettings && (
            <div className="mx-2 mb-2 p-3 bg-slate-800 rounded-clinical border border-slate-700 space-y-2 text-xs">
              <div className="font-bold text-white flex items-center justify-between">
                <span>Workspace Preferences</span>
                <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white"><AlertTriangle className="w-3.5 h-3.5" /></button>
              </div>
              <div className="space-y-1.5 text-slate-300">
                {[
                  'Auto-expand AI Summary: On',
                  'High-Risk First Sorting: On',
                  'Evidence Confidence Level: ≥ 60%',
                  'Session Timeout: 15 min',
                ].map((setting) => (
                  <div key={setting} className="flex items-center gap-2 px-2 py-1 bg-slate-700 rounded">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{setting}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Settings are persisted per session in this prototype.</p>
            </div>
          )}
        </div>

        {/* Doctor User Footer */}
        <div className="p-3 border-t border-slate-800 flex items-center justify-between">
          {!collapsed ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Avatar name="Dr. Ananya Sharma" roleBadge="MD" size="sm" />
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate">Dr. Ananya Sharma</div>
                <div className="text-[10px] text-brand-400 font-semibold truncate">General Medicine</div>
              </div>
            </div>
          ) : (
            <Avatar name="Dr. Ananya Sharma" roleBadge="MD" size="sm" className="mx-auto" />
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-clinical-border sticky top-0 z-20 px-6 py-3 flex items-center justify-between shadow-subtle gap-4">
          <div className="flex items-center gap-4 flex-1">
            {/* Department Badge */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-clinical bg-brand-50 border border-brand-200 text-xs font-bold text-brand-900 shrink-0">
              <Building2 className="w-4 h-4 text-brand-700" />
              <span>General Medicine</span>
            </div>

            <SearchInput
              value={searchQuery}
              onSearchChange={setSearchQuery}
              placeholder="Search patients by name, MRN (#102), or symptom..."
              className="max-w-md"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-clinical-slate font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-700" />
              <span>Clinical Evidence Engine</span>
            </div>

            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowSettings(false); }}
              className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-600 ring-2 ring-white" />
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <Avatar name="Dr. Ananya Sharma" roleBadge="MD" size="sm" />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-clinical-navy leading-tight">Dr. Ananya Sharma</div>
                <div className="text-[10px] text-clinical-muted font-medium">General Medicine</div>
              </div>
            </div>

            <button
              onClick={() => navigate(DOCTOR_ROUTES.LOGIN)}
              className="text-xs font-semibold text-clinical-slate hover:text-red-600 flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-slate-100 ml-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* View Outlet Container */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const DoctorLayout: React.FC = () => {
  return (
    <DoctorWorkspaceProvider>
      <DoctorLayoutContent />
    </DoctorWorkspaceProvider>
  );
};
