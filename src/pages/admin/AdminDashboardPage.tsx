import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ADMIN_ROUTES } from '../../constants/routes';
import { useAdmin } from '../../context/AdminContext';
import { PageContainer, ContentGrid } from '../../components/common/containers/LayoutContainers';
import { Card } from '../../components/common/Card';
import { ClinicalFunnel } from '../../components/admin/ClinicalFunnel';
import { LoadIndicator } from '../../components/admin/LoadIndicator';
import { DepartmentDetailDrawer } from '../../components/admin/DepartmentDetailDrawer';
import { DepartmentMetric } from '../../types/admin';
import {
  Users,
  CheckCircle2,
  Clock,
  Stethoscope,
  TrendingUp,
  Building2,
  ChevronRight,
  BarChart2,
  ShieldCheck,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { departments } = useAdmin();
  const [selectedDept, setSelectedDept] = useState<DepartmentMetric | null>(null);

  const handleFlowClick = (filterStatus?: string) => {
    if (filterStatus) {
      navigate(`${ADMIN_ROUTES.PATIENTS}?status=${filterStatus}`);
    } else {
      navigate(ADMIN_ROUTES.PATIENTS);
    }
  };

  return (
    <PageContainer
      title="Hospital Operations"
      subtitle="Overview of today's MediKiosk intake workflow and clinical throughput."
      maxWidth="2xl"
    >
      {/* Top 4 Compact KPI Cards */}
      <ContentGrid columns={4} className="mb-6">
        <Card
          variant="default"
          padding="sm"
          onClick={() => handleFlowClick('arrived')}
          className="border-l-4 border-l-indigo-600 bg-white hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Patients Today</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">1,284</div>
          <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +8.4% vs yesterday
          </span>
        </Card>

        <Card
          variant="default"
          padding="sm"
          onClick={() => handleFlowClick('completed')}
          className="border-l-4 border-l-emerald-600 bg-white hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-black text-emerald-800 tracking-wider">Completed Intake</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-950 mt-1">91%</div>
          <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">1,146 / 1,284 completed</span>
        </Card>

        <Card
          variant="default"
          padding="sm"
          onClick={() => handleFlowClick('awaiting-triage')}
          className="border-l-4 border-l-amber-500 bg-white hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-black text-amber-800 tracking-wider">Awaiting Triage</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-950 mt-1">47</div>
          <span className="text-[10px] text-amber-800 font-semibold mt-1 block">Nurse review required</span>
        </Card>

        <Card
          variant="default"
          padding="sm"
          onClick={() => handleFlowClick('ready-for-doctor')}
          className="border-l-4 border-l-sky-600 bg-white hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-black text-sky-900 tracking-wider">Ready for Doctor</span>
            <Stethoscope className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black font-mono text-sky-950 mt-1">136</div>
          <span className="text-[10px] text-sky-800 font-semibold mt-1 block">Surfaced to doctor queue</span>
        </Card>
      </ContentGrid>

      {/* Clinical Workflow Funnel */}
      <ClinicalFunnel className="mb-6" />

      {/* Today's Patient Flow Panel */}
      <Card padding="md" className="bg-white border-clinical-border shadow-xs mb-6 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="font-extrabold text-sm text-clinical-navy uppercase tracking-wide">
            Today's Patient Flow Breakdown
          </h3>
          <span className="text-xs text-clinical-muted font-medium">Click metric to filter patient directory</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {[
            { label: 'Arrived', count: 1284, filter: 'all', color: 'border-slate-300 text-slate-900' },
            { label: 'In Intake', count: 38, filter: 'in-intake', color: 'border-sky-300 text-sky-900 bg-sky-50/50' },
            { label: 'Awaiting Triage', count: 47, filter: 'awaiting-triage', color: 'border-amber-300 text-amber-950 bg-amber-50/50' },
            { label: 'Ready for Doctor', count: 136, filter: 'ready-for-doctor', color: 'border-indigo-300 text-indigo-950 bg-indigo-50/50' },
            { label: 'In Consultation', count: 82, filter: 'in-consultation', color: 'border-purple-300 text-purple-950 bg-purple-50/50' },
            { label: 'Completed', count: 981, filter: 'completed', color: 'border-emerald-300 text-emerald-950 bg-emerald-50/50' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => handleFlowClick(item.filter)}
              className={cn(
                'p-2.5 rounded-clinical border text-center transition-all hover:scale-[1.02] select-none',
                item.color
              )}
            >
              <span className="text-[10px] uppercase font-bold block opacity-75">{item.label}</span>
              <span className="text-lg font-black font-mono block mt-0.5">{item.count}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Department Performance Overview */}
      <Card padding="md" className="bg-white border-clinical-border shadow-xs mb-6 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h3 className="font-extrabold text-sm text-clinical-navy uppercase tracking-wide">
              Department Operations & Load Balance
            </h3>
            <p className="text-xs text-clinical-muted font-medium">
              OPD department throughput and active physician distribution.
            </p>
          </div>
          <button
            onClick={() => navigate(ADMIN_ROUTES.DEPARTMENTS)}
            className="text-xs font-extrabold text-indigo-700 hover:underline flex items-center gap-1"
          >
            <span>View All Departments</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] uppercase font-black text-slate-500 bg-slate-50">
                <th className="p-2.5">Department</th>
                <th className="p-2.5 text-center">Active Physicians</th>
                <th className="p-2.5 text-center">Patients Today</th>
                <th className="p-2.5 text-center">Intake Rate</th>
                <th className="p-2.5 text-center">Awaiting Triage</th>
                <th className="p-2.5 text-center">Operational Load</th>
                <th className="p-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-2.5 font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <span>{dept.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono block">{dept.code}</span>
                    </div>
                  </td>
                  <td className="p-2.5 text-center font-mono font-bold text-slate-800">{dept.activeDoctors}</td>
                  <td className="p-2.5 text-center font-mono font-black text-slate-900">{dept.patientsToday}</td>
                  <td className="p-2.5 text-center font-mono font-bold text-emerald-800">{dept.completedIntakePercent}%</td>
                  <td className="p-2.5 text-center font-mono font-bold text-amber-900">{dept.awaitingTriage}</td>
                  <td className="p-2.5 text-center">
                    <LoadIndicator load={dept.load} size="sm" />
                  </td>
                  <td className="p-2.5 text-right">
                    <button
                      onClick={() => setSelectedDept(dept)}
                      className="text-xs font-bold text-indigo-700 hover:underline"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Operations Benchmarks & Trend Visualization */}
      <ContentGrid columns={2} className="mb-6">
        {/* Operations Duration Metrics */}
        <Card padding="md" className="bg-white border-clinical-border shadow-xs space-y-3">
          <h3 className="font-extrabold text-sm text-clinical-navy uppercase tracking-wide border-b border-slate-100 pb-2">
            Synthetic Benchmark Metrics
          </h3>
          <div className="space-y-3 pt-1">
            <div className="p-3 bg-slate-50 rounded-clinical border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-700 block">Average Kiosk Intake Duration</span>
                <span className="text-[10px] text-slate-500 font-medium">Self-guided patient intake completion</span>
              </div>
              <span className="text-lg font-black font-mono text-indigo-900">4m 12s</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-clinical border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-700 block">Average Doctor Review Time</span>
                <span className="text-[10px] text-slate-500 font-medium">Pre-consultation summary scan time</span>
              </div>
              <span className="text-lg font-black font-mono text-emerald-800">38s</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-clinical border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-700 block">Average Nurse Triage Review Time</span>
                <span className="text-[10px] text-slate-500 font-medium">Red-flag assessment & handoff time</span>
              </div>
              <span className="text-lg font-black font-mono text-amber-900">52s</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-clinical border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-700 block">Overall Intake Completion Rate</span>
                <span className="text-[10px] text-slate-500 font-medium">Successful intake vs abandonment</span>
              </div>
              <span className="text-lg font-black font-mono text-emerald-900">91%</span>
            </div>
          </div>
        </Card>

        {/* Operational Hourly Volume Chart (Clean Healthcare Minimalist) */}
        <Card padding="md" className="bg-white border-clinical-border shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-extrabold text-sm text-clinical-navy uppercase tracking-wide">
              Patients Per Hour Throughput
            </h3>
            <BarChart2 className="w-4 h-4 text-indigo-600" />
          </div>

          <div className="pt-2 space-y-2">
            {[
              { time: '08:00 - 09:00', count: 142, barWidth: '70%', color: 'bg-indigo-600' },
              { time: '09:00 - 10:00', count: 198, barWidth: '95%', color: 'bg-indigo-700' },
              { time: '10:00 - 11:00', count: 210, barWidth: '100%', color: 'bg-indigo-800' },
              { time: '11:00 - 12:00', count: 175, barWidth: '82%', color: 'bg-indigo-600' },
              { time: '12:00 - 13:00', count: 120, barWidth: '58%', color: 'bg-indigo-500' },
              { time: '13:00 - 14:00', count: 155, barWidth: '74%', color: 'bg-indigo-600' },
            ].map((row) => (
              <div key={row.time} className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                  <span>{row.time}</span>
                  <span className="font-mono font-bold text-slate-900">{row.count} patients</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all', row.color)} style={{ width: row.barWidth }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </ContentGrid>

      {/* Department Detail Drawer */}
      <DepartmentDetailDrawer
        department={selectedDept}
        onClose={() => setSelectedDept(null)}
      />
    </PageContainer>
  );
};

export default AdminDashboardPage;
