import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATIENT_ROUTES } from '../../constants/routes';
import { usePatientIntake } from '../../context/PatientIntakeContext';
import { CenteredTaskLayout } from '../../components/common/containers/LayoutContainers';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Mic, Keyboard, Clock, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '../../utils/cn';

export const PatientIntakePage: React.FC = () => {
  const navigate = useNavigate();
  const { accessibility, speak, stopSpeaking, t } = usePatientIntake();
  const [inputMethod, setInputMethod] = useState<'voice' | 'text'>('voice');

  React.useEffect(() => {
    if (accessibility.voiceGuidance || accessibility.easyMode) {
      const timer = setTimeout(() => {
        speak(`${t('intake.title')}. ${t('intake.subtitle')}`);
      }, 400);
      return () => {
        clearTimeout(timer);
        stopSpeaking();
      };
    }
  }, [accessibility.voiceGuidance, accessibility.easyMode, speak, stopSpeaking, t]);

  return (
    <CenteredTaskLayout maxWidth="md">
      <Card variant="kiosk" padding="lg" className="text-center flex flex-col items-center gap-6 bg-white border-brand-200 shadow-kiosk">
        {/* Step Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-900 text-xs font-bold uppercase tracking-wider">
          <span>{t('intake.stepBadge')}</span>
        </div>

        {/* Headings */}
        <div className="space-y-2 max-w-lg">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-clinical-navy tracking-tight">
            {t('intake.title')}
          </h1>
          <p className="text-sm sm:text-base text-clinical-slate font-medium leading-relaxed">
            {t('intake.subtitle')}
          </p>
        </div>

        {/* Easy Mode 1-Tap Proceed Card */}
        {accessibility.easyMode && (
          <div
            onClick={() => navigate(PATIENT_ROUTES.CONVERSATION)}
            className="w-full max-w-sm p-5 rounded-2xl bg-amber-50 border-3 border-amber-500 shadow-md flex flex-col items-center gap-3 cursor-pointer hover:bg-amber-100 transition-all"
          >
            <div className="text-xs font-black uppercase tracking-wider text-amber-900">
              {t('intake.easyModeStartTitle')}
            </div>
            <h3 className="font-black text-xl text-slate-950 text-center">
              {t('intake.easyModeStartDesc')}
            </h3>
            <p className="text-sm font-semibold text-slate-700 text-center">
              {t('intake.easyModeStartHelp')}
            </p>
            <Button
              variant="kiosk"
              size="lg"
              rightIcon={ArrowRight}
              className="w-full bg-slate-950 hover:bg-slate-900 text-white font-black text-base px-6 py-4"
            >
              {t('intake.startInterviewBtn')}
            </Button>
          </div>
        )}

        {/* Interaction Mode Choice */}
        <div className={cn('grid grid-cols-2 gap-4 w-full max-w-sm', accessibility.easyMode && 'opacity-60')}>
          <button
            type="button"
            onClick={() => setInputMethod('voice')}
            className={cn(
              'flex flex-col items-center justify-center p-4 rounded-clinical border-2 gap-2 transition-all',
              inputMethod === 'voice'
                ? 'border-brand-700 bg-brand-50/60 ring-2 ring-brand-700 text-brand-900 shadow-sm'
                : 'border-clinical-border bg-white text-clinical-slate hover:border-slate-300'
            )}
          >
            <Mic className="w-7 h-7 text-brand-700" />
            <span className="font-extrabold text-sm">{t('intake.voiceMode')}</span>
            <span className="text-[11px] text-clinical-muted">{t('intake.voiceModeDesc')}</span>
          </button>

          <button
            type="button"
            onClick={() => setInputMethod('text')}
            className={cn(
              'flex flex-col items-center justify-center p-4 rounded-clinical border-2 gap-2 transition-all',
              inputMethod === 'text'
                ? 'border-brand-700 bg-brand-50/60 ring-2 ring-brand-700 text-brand-900 shadow-sm'
                : 'border-clinical-border bg-white text-clinical-slate hover:border-slate-300'
            )}
          >
            <Keyboard className="w-7 h-7 text-brand-700" />
            <span className="font-extrabold text-sm">{t('intake.textMode')}</span>
            <span className="text-[11px] text-clinical-muted">{t('intake.textModeDesc')}</span>
          </button>
        </div>

        {/* Expected Time & Context */}
        <div className="flex items-center justify-center gap-2 text-xs text-clinical-muted font-semibold bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
          <Clock className="w-4 h-4 text-brand-700" />
          <span>{t('intake.duration')}</span>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-clinical-border w-full">
          <Button
            variant="outline"
            size="lg"
            leftIcon={ArrowLeft}
            onClick={() => navigate(PATIENT_ROUTES.IDENTITY)}
          >
            {t('btn.back')}
          </Button>

          <Button
            variant="kiosk"
            size="lg"
            rightIcon={ArrowRight}
            onClick={() => navigate(PATIENT_ROUTES.CONVERSATION)}
            className={cn(
              accessibility.easyMode &&
                'bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg px-8 py-5 min-h-[60px] shadow-lg border-2 border-emerald-800'
            )}
          >
            {accessibility.easyMode ? t('intake.startInterviewBtn') : t('intake.startBtn')}
          </Button>
        </div>
      </Card>
    </CenteredTaskLayout>
  );
};

export default PatientIntakePage;
