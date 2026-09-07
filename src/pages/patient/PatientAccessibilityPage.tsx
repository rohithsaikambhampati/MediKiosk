import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PATIENT_ROUTES } from '../../constants/routes';
import { usePatientIntake } from '../../context/PatientIntakeContext';
import { PageContainer } from '../../components/common/containers/LayoutContainers';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Switch } from '../../components/common/Switch';
import { Eye, Volume2, Type, Contrast, ArrowRight, ArrowLeft, Play } from 'lucide-react';
import { cn } from '../../utils/cn';

export const PatientAccessibilityPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    accessibility,
    toggleAccessibilitySetting,
    setEasyMode,
    speak,
    stopSpeaking,
    t,
  } = usePatientIntake();

  React.useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);

  const handleSelectStandardMode = () => {
    setEasyMode(false);
    stopSpeaking();
  };

  const handleSelectEasyMode = () => {
    setEasyMode(true);
    const previewText = t('accessibility.sampleQuestionText');
    speak(previewText, true);
  };

  const handleToggleVoiceGuidance = () => {
    const nextVal = !accessibility.voiceGuidance;
    toggleAccessibilitySetting('voiceGuidance');
    if (nextVal) {
      const previewText = t('accessibility.sampleQuestionText');
      speak(previewText, true);
    } else {
      stopSpeaking();
    }
  };

  const handleTestVoicePreview = () => {
    const previewText = t('accessibility.sampleQuestionText');
    speak(previewText, true);
  };

  return (
    <PageContainer
      title={t('accessibility.title')}
      subtitle={t('accessibility.subtitle')}
      maxWidth="md"
    >
      {/* Mode Preset Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card
          variant="interactive"
          padding="md"
          onClick={handleSelectStandardMode}
          className={cn(
            'flex flex-col items-center text-center gap-2 cursor-pointer border-2 transition-all',
            !accessibility.easyMode
              ? 'border-brand-700 bg-brand-50/60 shadow-sm ring-2 ring-brand-300'
              : 'border-clinical-border bg-white hover:border-brand-300'
          )}
        >
          <div className="font-extrabold text-base text-clinical-navy">
            {t('accessibility.standardMode')}
          </div>
          <span className="text-xs text-clinical-muted">
            {t('accessibility.standardModeDesc')}
          </span>
        </Card>

        <Card
          variant="interactive"
          padding="md"
          onClick={handleSelectEasyMode}
          className={cn(
            'flex flex-col items-center text-center gap-2 cursor-pointer border-2 transition-all',
            accessibility.easyMode
              ? 'border-amber-600 bg-amber-50/70 shadow-md ring-2 ring-amber-400'
              : 'border-clinical-border bg-white hover:border-amber-300'
          )}
        >
          <div className="font-extrabold text-base text-amber-900 flex items-center gap-1.5">
            <Eye className="w-5 h-5 text-amber-700 shrink-0" />
            <span>{t('accessibility.easyMode')}</span>
          </div>
          <span className="text-xs text-amber-800 font-medium">
            {t('accessibility.easyModeDesc')}
          </span>
        </Card>
      </div>

      {/* Granular Toggles */}
      <Card variant="default" padding="md" className="space-y-4 mb-6 bg-white border-clinical-border">
        <h3 className="font-bold text-sm text-clinical-navy uppercase tracking-wider mb-2">
          {t('accessibility.controlsTitle')}
        </h3>

        <div className="flex items-center justify-between p-3 rounded-clinical bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3">
            <Type className="w-5 h-5 text-brand-700 shrink-0" />
            <div>
              <div className="font-bold text-sm text-clinical-navy">{t('accessibility.largeText')}</div>
              <div className="text-xs text-clinical-muted">{t('accessibility.largeTextDesc')}</div>
            </div>
          </div>
          <Switch
            checked={accessibility.largeText}
            onChange={() => toggleAccessibilitySetting('largeText')}
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-clinical bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3">
            <Contrast className="w-5 h-5 text-brand-700 shrink-0" />
            <div>
              <div className="font-bold text-sm text-clinical-navy">{t('accessibility.highContrast')}</div>
              <div className="text-xs text-clinical-muted">{t('accessibility.highContrastDesc')}</div>
            </div>
          </div>
          <Switch
            checked={accessibility.highContrast}
            onChange={() => toggleAccessibilitySetting('highContrast')}
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-clinical bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-brand-700 shrink-0" />
            <div>
              <div className="font-bold text-sm text-clinical-navy">{t('accessibility.voiceGuidance')}</div>
              <div className="text-xs text-clinical-muted">{t('accessibility.voiceGuidanceDesc')}</div>
            </div>
          </div>
          <Switch
            checked={accessibility.voiceGuidance}
            onChange={handleToggleVoiceGuidance}
          />
        </div>
      </Card>

      {/* Live Sample Preview */}
      <Card variant="default" padding="md" className="border-brand-200 bg-brand-50/30 mb-6">
        <div className="text-xs font-bold uppercase tracking-wider text-brand-800 mb-2">
          {t('accessibility.previewTitle')}
        </div>
        <div className="p-4 rounded-clinical bg-white border border-brand-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-clinical-muted">
              {t('accessibility.sampleQuestionLabel')}
            </div>
            <div className="font-bold text-base text-clinical-navy mt-0.5">
              {t('accessibility.sampleQuestionText')}
            </div>
          </div>
          <Button
            variant="kiosk"
            size="md"
            leftIcon={Play}
            onClick={handleTestVoicePreview}
            className="shrink-0"
          >
            {t('accessibility.audioPreviewBtn')}
          </Button>
        </div>
      </Card>

      {/* Navigation Actions */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-clinical-border w-full">
        <Button
          variant="outline"
          size="lg"
          leftIcon={ArrowLeft}
          onClick={() => navigate(PATIENT_ROUTES.LANGUAGE)}
        >
          {t('btn.back')}
        </Button>

        <Button
          variant="kiosk"
          size="lg"
          rightIcon={ArrowRight}
          onClick={() => navigate(PATIENT_ROUTES.CONSENT)}
        >
          {t('btn.continue')}
        </Button>
      </div>
    </PageContainer>
  );
};

export default PatientAccessibilityPage;
