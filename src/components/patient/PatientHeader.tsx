import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PATIENT_ROUTES } from '../../constants/routes';
import { BRAND } from '../../constants/tokens';
import { SUPPORTED_LANGUAGES } from '../../constants/languages';
import { usePatientIntake } from '../../context/PatientIntakeContext';
import { Globe, HelpCircle, LogOut, Eye, Check, ShieldCheck, X } from 'lucide-react';
import { Button } from '../common/Button';
import { IconButton } from '../common/IconButton';
import { Modal } from '../common/Modal';
import { cn } from '../../utils/cn';

export const PatientHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    language,
    setLanguage,
    accessibility,
    toggleAccessibilitySetting,
    speak,
    stopSpeaking,
    requestStaffAssistance,
    resetIntake,
    t,
  } = usePatientIntake();
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  const selectedLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  // Determine current workflow step
  const currentPath = location.pathname;
  let currentStepIndex = 0;
  if (currentPath.includes('/identity') || currentPath.includes('/consent')) currentStepIndex = 0;
  else if (currentPath.includes('/intake') || currentPath.includes('/conversation')) currentStepIndex = 1;
  else if (currentPath.includes('/documents') || currentPath.includes('/document-processing')) currentStepIndex = 2;
  else if (currentPath.includes('/patient-story') || currentPath.includes('/review') || currentPath.includes('/complete')) currentStepIndex = 3;

  const workflowSteps = [
    { label: t('header.step.identity'), route: PATIENT_ROUTES.IDENTITY },
    { label: t('header.step.history'), route: PATIENT_ROUTES.CONVERSATION },
    { label: t('header.step.documents'), route: PATIENT_ROUTES.DOCUMENTS },
    { label: t('header.step.review'), route: PATIENT_ROUTES.REVIEW },
  ];

  const handleSelectLanguage = (code: string) => {
    setLanguage(code);
    setIsLangModalOpen(false);
  };

  return (
    <>
      <header className="bg-white border-b border-clinical-border sticky top-0 z-40 shadow-subtle px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Wordmark */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => {
            stopSpeaking();
            resetIntake();
            navigate('/');
          }}
          title="Return to Main Portal"
        >
          <div className="w-10 h-10 rounded-clinical bg-brand-700 text-white flex items-center justify-center font-extrabold text-xl shadow-sm hover:scale-105 transition-transform">
            MK
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl text-clinical-navy tracking-tight">
                {t('brand.name', BRAND.NAME)}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-brand-100 text-brand-900 border border-brand-200 hidden sm:inline-block">
                {t('header.kioskId')}
              </span>
            </div>
            <p className="text-xs text-clinical-muted font-medium hidden md:block">{t('brand.tagline')}</p>
          </div>
        </div>

        {/* Center: Quiet Workflow Progress Bar */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-200">
          {workflowSteps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <React.Fragment key={step.label}>
                <div className="flex items-center gap-1.5 text-xs">
                  <span
                    className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] transition-colors',
                      isCompleted && 'bg-emerald-600 text-white',
                      isCurrent && 'bg-brand-700 text-white font-black ring-2 ring-brand-200',
                      !isCompleted && !isCurrent && 'bg-slate-200 text-slate-500'
                    )}
                  >
                    {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                  </span>
                  <span
                    className={cn(
                      'font-medium',
                      isCurrent && 'font-bold text-brand-900',
                      isCompleted && 'text-slate-800',
                      !isCompleted && !isCurrent && 'text-slate-400'
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < workflowSteps.length - 1 && <span className="text-slate-300 mx-1">•</span>}
              </React.Fragment>
            );
          })}
        </div>

        {/* Right Controls: Language, Accessibility, Help, Exit */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Pill */}
          <button
            type="button"
            onClick={() => setIsLangModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-900 font-semibold text-xs hover:bg-brand-100 transition-colors shadow-xs"
            title={t('header.changeLanguage')}
          >
            <Globe className="w-3.5 h-3.5 text-brand-700" />
            <span>{selectedLangObj.nativeName} ({selectedLangObj.name})</span>
          </button>

          {/* Easy / Accessibility Toggle */}
          <button
            type="button"
            onClick={() => {
              const nextMode = !accessibility.easyMode;
              toggleAccessibilitySetting('easyMode');
              if (nextMode) {
                speak(t('accessibility.sampleQuestionText'), true);
              } else {
                stopSpeaking();
              }
            }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full border transition-all select-none',
              accessibility.easyMode
                ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-300'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            )}
          >
            <Eye className="w-3.5 h-3.5 text-amber-700" />
            <span>{accessibility.easyMode ? t('header.easyModeOn') : t('header.easyModeOff')}</span>
          </button>

          {/* Staff Help */}
          <IconButton
            icon={HelpCircle}
            variant="ghost"
            size="md"
            ariaLabel={t('btn.needHelp')}
            onClick={() => requestStaffAssistance('Need Help tapped on top bar')}
          />

          {/* Exit Kiosk Button */}
          <Button
            variant="outline"
            size="sm"
            leftIcon={LogOut}
            onClick={() => {
              stopSpeaking();
              resetIntake();
              navigate('/');
            }}
            className="flex items-center text-slate-700 hover:text-red-700 hover:border-red-300 font-bold"
          >
            {t('header.exitKiosk')}
          </Button>
        </div>
      </header>

      {/* Quick Language Selection Modal */}
      <Modal
        isOpen={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
        title={t('header.selectLanguage')}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-clinical-muted">
            {t('language.subtitle')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={cn(
                    'flex flex-col items-center justify-center p-3.5 rounded-clinical border-2 text-center transition-all cursor-pointer select-none',
                    isSelected
                      ? 'border-brand-700 bg-brand-50 text-brand-950 font-bold shadow-sm ring-2 ring-brand-300'
                      : 'border-slate-200 bg-white hover:border-brand-400 hover:bg-slate-50 text-slate-800'
                  )}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className="text-base font-extrabold mt-1">{lang.nativeName}</span>
                  <span className="text-[11px] text-slate-500 font-medium">{lang.name}</span>
                  {isSelected && (
                    <span className="mt-1 text-[10px] font-bold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-full">
                      ✓ Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-200">
            <Button variant="outline" size="sm" onClick={() => setIsLangModalOpen(false)}>
              {t('btn.close')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
