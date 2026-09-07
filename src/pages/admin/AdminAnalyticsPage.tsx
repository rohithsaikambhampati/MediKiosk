import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { PageContainer, ContentGrid } from '../../components/common/containers/LayoutContainers';
import { Card } from '../../components/common/Card';
import { BarChart3, Clock, CheckCircle2, Mic, FileText, Stethoscope, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';

export const AdminAnalyticsPage: React.FC = () => {
  const { selectedTimeRange, setSelectedTimeRange } = useAdmin();

  return (
    <PageContainer
      title="Hospital Operations & Intake Analytics"
      subtitle="Synthetic benchmark metrics for patient flow, pre-consultation intelligence readiness, and triage volume."
      maxWidth="2xl"
    >
      {/* Time Range Selector */}
      <Card padding="sm" className="bg-white border-clinical-border shadow-xs mb-6 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700">Analytics Reporting Range:</span>
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-full border border-slate-200">
          {(['today', '7days', '30days'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setSelectedTimeRange(range)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-extrabold transition-all select-none',
                selectedTimeRange === range
                  ? 'bg-indigo-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              )}
            >
              {range === 'today' ? 'Today' : range === '7days' ? 'Last 7 Days' : 'Last 30 Days'}
            </button>
          ))}
        </div>
      </Card>

      {/* Intake Performance Section */}
      <ContentGrid columns={3} className="mb-6">
        <Card padding="md" className="bg-white border-clinical-border shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Intake Duration</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black font-mono text-indigo-950">4m 12s</div>
          <p className="text-[10px] text-slate-500 font-medium">Average time per self-guided patient session</p>
        </Card>

        <Card padding="md" className="bg-white border-clinical-border shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] uppercase font-black tracking-wider text-emerald-800">Completion Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-950">91.4%</div>
          <p className="text-[10px] text-emerald-800 font-medium">Completed 12-step structured intake vs drop-off</p>
        </Card>

        <Card padding="md" className="bg-white border-clinical-border shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Modalities & OCR</span>
            <Mic className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black font-mono text-sky-950">68% Voice / 82% Docs</div>
          <p className="text-[10px] text-slate-500 font-medium">Multi-modal voice conversation & document upload rate</p>
        </Card>
      </ContentGrid>

      {/* Triage Stratification & Doctor Readiness */}
      <ContentGrid columns={2} className="mb-6">
        {/* Triage Stratification Analytics */}
        <Card padding="md" className="bg-white border-clinical-border shadow-xs space-y-3">
          <h3 className="font-extrabold text-sm text-clinical-navy uppercase tracking-wide border-b border-slate-100 pb-2">
            Triage Risk Stratification Distribution
          </h3>
          <div className="space-y-3">
            {[
              { label: '🔴 Immediate Review', count: 13, percent: '1.2%', color: 'bg-red-600 text-white' },
              { label: '🟠 High Priority', count: 28, percent: '2.6%', color: 'bg-amber-600 text-white' },
              { label: '🟡 Needs Attention', count: 74, percent: '6.8%', color: 'bg-sky-600 text-white' },
              { label: '🟢 Routine', count: 980, percent: '89.4%', color: 'bg-emerald-600 text-white' },
            ].map((row) => (
              <div key={row.label} className="p-2.5 rounded-clinical bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{row.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-700">{row.percent}</span>
                  <span className={cn('text-xs font-black font-mono px-2 py-0.5 rounded', row.color)}>
                    {row.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Doctor Readiness Impact */}
        <Card padding="md" className="bg-white border-clinical-border shadow-xs space-y-3">
          <h3 className="font-extrabold text-sm text-clinical-navy uppercase tracking-wide border-b border-slate-100 pb-2">
            Doctor Pre-Consultation Readiness Impact
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Ready for Review', count: 136, desc: 'Structured summary surfaced to doctor' },
              { label: 'Ready for Consultation', count: 101, desc: 'Doctor opened patient workspace' },
              { label: 'Consultation Started', count: 82, desc: 'Active physician encounter' },
              { label: 'Consultation Completed', count: 920, desc: 'Discharged / Prescribed' },
            ].map((row) => (
              <div key={row.label} className="p-2.5 rounded-clinical bg-indigo-50/40 border border-indigo-100 flex items-center justify-between">
                <div>
                  <strong className="text-xs font-bold text-indigo-950 block">{row.label}</strong>
                  <span className="text-[10px] text-slate-500 font-medium">{row.desc}</span>
                </div>
                <span className="text-base font-black font-mono text-indigo-900">{row.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </ContentGrid>
    </PageContainer>
  );
};

export default AdminAnalyticsPage;
