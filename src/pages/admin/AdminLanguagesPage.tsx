import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { PageContainer } from '../../components/common/containers/LayoutContainers';
import { Card } from '../../components/common/Card';
import { Globe, Mic, CheckCircle2, Clock, Volume2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export const AdminLanguagesPage: React.FC = () => {
  const { languages, toggleLanguage } = useAdmin();

  return (
    <PageContainer
      title="Multilingual NLP Engine & Language Models"
      subtitle="Configure supported Indian & Global languages and review multi-modal usage statistics."
      maxWidth="2xl"
    >
      <Card padding="sm" className="bg-amber-50 border-amber-200 mb-6 text-amber-950 text-xs font-semibold">
        💡 Note: Language model usage metrics are synthetic demo metrics demonstrating MediKiosk's multilingual intake capability across Indian regional languages.
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {languages.map((lang) => (
          <Card key={lang.id} padding="md" className="bg-white border-clinical-border shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-clinical bg-indigo-50 border border-indigo-200 text-indigo-900 flex items-center justify-center font-bold text-base shrink-0 font-mono">
                  {lang.code.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <span>{lang.name}</span>
                    <span className="text-xs font-normal text-slate-500">({lang.nativeName})</span>
                  </h3>
                  <span className="text-xs text-clinical-muted font-medium">
                    {lang.sessionsToday} Intake Sessions Today
                  </span>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => toggleLanguage(lang.id)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-extrabold transition-all border select-none',
                  lang.isEnabled
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-slate-100 text-slate-500 border-slate-300'
                )}
              >
                {lang.isEnabled ? '✓ Enabled' : '○ Disabled'}
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2 bg-emerald-50/60 rounded border border-emerald-100">
                <span className="text-[10px] uppercase font-bold text-emerald-900 block">Completion</span>
                <span className="text-base font-black font-mono text-emerald-950">{lang.completionRatePercent}%</span>
              </div>

              <div className="p-2 bg-sky-50/60 rounded border border-sky-100">
                <span className="text-[10px] uppercase font-bold text-sky-900 block">Voice Usage</span>
                <span className="text-base font-black font-mono text-sky-950 flex items-center justify-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 text-sky-600" />
                  {lang.voiceUsagePercent}%
                </span>
              </div>

              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Avg Duration</span>
                <span className="text-xs font-mono font-extrabold text-slate-900">{lang.avgIntakeTime}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
};

export default AdminLanguagesPage;
