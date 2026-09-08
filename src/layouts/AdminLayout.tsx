import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ADMIN_ROUTES } from '../constants/routes';
import { BRAND } from '../constants/tokens';
import { AdminProvider } from '../context/AdminContext';
import { Avatar } from '../components/common/Avatar';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Building2,
  BarChart3,
  Globe,
  Plug,
  ShieldCheck,
  FileCheck2,
  Settings,
  LogOut,
  Bell,
  Activity,
  Calendar,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '../utils/cn';

export const AdminLayoutContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: ADMIN_ROUTES.DASHBOARD },
    { label: 'Patients', icon: Users, path: ADMIN_ROUTES.PATIENTS },
    { label: 'Doctors', icon: Stethoscope, path: ADMIN_ROUTES.DOCTORS },
    { label: 'Departments', icon: Building2, path: ADMIN_ROUTES.DEPARTMENTS },
    { label: 'Analytics', icon: BarChart3, path: ADMIN_ROUTES.ANALYTICS },
    { label: 'Languages', icon: Globe, path: ADMIN_ROUTES.LANGUAGES },
    { label: 'Integrations', icon: Plug, path: ADMIN_ROUTES.INTEGRATIONS },
    { label: 'Security', icon: ShieldCheck, path: ADMIN_ROUTES.SECURITY },
    { label: 'Audit Logs', icon: FileCheck2, path: ADMIN_ROUTES.AUDIT_LOGS },
  ];

  return (
    <div className="min-h-screen bg-clinical-bg flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 shrink-0 sticky top-0 h-screen">
        <div>
          <div className="p-4 border-b border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-clinical bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-subtle">
              MK
            </div>
            <div>
              <h1 className="font-extrabold text-sm text-white tracking-tight">{BRAND.NAME}</h1>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Hospital Administration</p>
            </div>
          </div>

          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-3 py-1.5">
              Operations & Governance
            </div>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-clinical text-xs font-semibold transition-all select-none',
                    isActive
                      ? 'bg-indigo-700 text-white shadow-subtle'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0 text-indigo-400" />
                  <span className="truncate flex-1 text-left">{item.label}</span>
                </button>
              );
            })}

            <div className="my-2 border-t border-slate-800" />
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-3 py-1">
              System Settings
            </div>

            <button
              onClick={() => navigate(ADMIN_ROUTES.SECURITY)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-clinical text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Footer Admin User */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Avatar name="System Admin" roleBadge="ADM" size="sm" />
            <div>
              <div className="text-xs font-bold text-white">System Admin</div>
              <div className="text-[10px] text-indigo-400 font-medium">Govt General Hospital</div>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
            title="Exit to Main Portal"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-clinical-border sticky top-0 z-20 px-6 py-3 flex items-center justify-between shadow-subtle">
          <div className="flex items-center gap-4">
            <div>
              <div className="font-extrabold text-base text-clinical-navy flex items-center gap-2">
                <span>Hospital Administration</span>
                <span className="text-xs font-semibold text-slate-500">| Government General Hospital</span>
              </div>
              <div className="text-xs text-clinical-muted flex items-center gap-2 font-medium">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>Today: Sunday, September 6, 2026</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* System Status Link */}
            <button
              onClick={() => navigate(ADMIN_ROUTES.INTEGRATIONS)}
              className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-extrabold flex items-center gap-2 hover:bg-emerald-100 transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>● All Systems Operational</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-600 relative"
                title="Admin Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-2 ring-white" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-clinical border border-slate-200 shadow-xl z-50 p-3 space-y-2">
                  <div className="font-extrabold text-xs text-slate-900 border-b border-slate-100 pb-2">
                    System Alerts & Operations Feed
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-950 font-medium">
                      <strong>High OPD Load:</strong> General Medicine at 92% capacity (420 patients).
                    </div>
                    <div className="p-2 rounded bg-indigo-50 border border-indigo-200 text-indigo-950 font-medium">
                      <strong>ABDM Prototype:</strong> Mock Health ID connector synced 1,240 ABHA records.
                    </div>
                    <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-950 font-medium">
                      <strong>System Health:</strong> All 9 AI intake services running at 100% uptime.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const AdminLayout: React.FC = () => {
  return (
    <AdminProvider>
      <AdminLayoutContent />
    </AdminProvider>
  );
};

export default AdminLayout;
