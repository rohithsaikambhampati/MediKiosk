import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATIENT_ROUTES } from '../../constants/routes';
import { usePatientIntake } from '../../context/PatientIntakeContext';
import { CenteredTaskLayout } from '../../components/common/containers/LayoutContainers';
import { Card } from '../../components/common/Card';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Button } from '../../components/common/Button';
import { CheckCircle2, Loader2, ArrowRight, FileCheck } from 'lucide-react';
import { cn } from '../../utils/cn';

export const PatientDocumentProcessingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, refreshPatientStory, accessibility, speak, stopSpeaking } = usePatientIntake();
  const [progress, setProgress] = useState(15);
  const [stage, setStage] = useState(1);

  React.useEffect(() => {
    if (accessibility.voiceGuidance || accessibility.easyMode) {
      const timer = setTimeout(() => {
        speak('We are now analysing your documents and building your clinical story. Please wait a few moments.');
      }, 300);
      return () => {
        clearTimeout(timer);
        stopSpeaking();
      };
    }
  }, [accessibility.voiceGuidance, accessibility.easyMode, speak, stopSpeaking]);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setProgress(40);
      setStage(2);
    }, 800);

    const timer2 = setTimeout(() => {
      setProgress(78);
      setStage(3);
    }, 1600);

    const timer3 = setTimeout(() => {
      setProgress(100);
      setStage(4);
      refreshPatientStory().catch(() => {});
    }, 2400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [refreshPatientStory]);

  const isComplete = progress === 100;

  return (
    <CenteredTaskLayout maxWidth="md">
      <Card variant="kiosk" padding="lg" className="text-center flex flex-col items-center gap-6 bg-white border-brand-200 shadow-kiosk">
        <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center border border-brand-200 shadow-sm">
          {isComplete ? (
            <FileCheck className="w-8 h-8 text-emerald-600 animate-bounce" />
          ) : (
            <Loader2 className="w-8 h-8 text-brand-700 animate-spin" />
          )}
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-clinical-navy">
            {isComplete ? t('docProc.readyTitle') : t('docProc.loadingTitle')}
          </h2>
          <p className="text-sm text-clinical-muted">
            {isComplete
              ? t('docProc.readySubtitle')
              : t('docProc.loadingSubtitle')}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-clinical-navy">
            <span>{t('docProc.extraction')}</span>
            <span className="text-brand-800 font-mono">{progress}%</span>
          </div>
          <ProgressBar value={progress} size="md" variant={isComplete ? 'success' : 'brand'} showPercent={false} />
        </div>

        {/* Stage Checklist */}
        <div className="w-full max-w-sm space-y-2 text-xs text-left bg-slate-50 p-4 rounded-clinical border border-slate-200">
          <div className="flex items-center justify-between">
            <span className={stage >= 1 ? 'font-bold text-slate-800' : 'text-slate-400'}>
              {stage > 1 ? `✓ ${t('docProc.stage1')}` : `● ${t('docProc.stage1')}...`}
            </span>
            {stage > 1 && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
          </div>

          <div className="flex items-center justify-between">
            <span className={stage >= 2 ? 'font-bold text-slate-800' : 'text-slate-400'}>
              {stage > 2 ? `✓ ${t('docProc.stage2')}` : stage === 2 ? `● ${t('docProc.stage2')}...` : `○ ${t('docProc.stage2')}`}
            </span>
            {stage > 2 && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
          </div>

          <div className="flex items-center justify-between">
            <span className={stage >= 3 ? 'font-bold text-slate-800' : 'text-slate-400'}>
              {stage > 3 ? `✓ ${t('docProc.stage3')}` : stage === 3 ? `● ${t('docProc.stage3')}...` : `○ ${t('docProc.stage3')}`}
            </span>
            {stage > 3 && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
          </div>

          <div className="flex items-center justify-between">
            <span className={stage >= 4 ? 'font-bold text-emerald-800 font-black' : 'text-slate-400'}>
              {stage >= 4 ? `✓ ${t('docProc.stage4')}` : `○ ${t('docProc.stage4')}`}
            </span>
            {stage >= 4 && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
          </div>
        </div>

        {/* CTA */}
        {isComplete && (
          <>
            {accessibility.easyMode && (
              <div className="p-3 rounded-2xl bg-emerald-50 border-2 border-emerald-500 text-center">
                <div className="font-black text-sm text-emerald-900">✓ Analysis Complete</div>
                <div className="text-xs text-emerald-800 font-semibold mt-0.5">
                  Your clinical story is ready. Tap below to view it.
                </div>
              </div>
            )}
            <Button
              variant="kiosk"
              size="xl"
              fullWidth
              rightIcon={ArrowRight}
              onClick={() => {
                stopSpeaking();
                navigate(PATIENT_ROUTES.PATIENT_STORY);
              }}
              className={cn(
                'shadow-md',
                accessibility.easyMode &&
                  'bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg min-h-[64px] shadow-xl border-2 border-emerald-800'
              )}
            >
              {accessibility.easyMode ? 'VIEW YOUR CLINICAL STORY ➔' : t('docProc.viewStoryBtn')}
            </Button>
          </>
        )}
      </Card>
    </CenteredTaskLayout>
  );
};

export default PatientDocumentProcessingPage;
