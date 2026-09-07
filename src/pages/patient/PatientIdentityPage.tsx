import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATIENT_ROUTES } from '../../constants/routes';
import { usePatientIntake } from '../../context/PatientIntakeContext';
import { PageContainer } from '../../components/common/containers/LayoutContainers';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Avatar } from '../../components/common/Avatar';
import { Phone, CreditCard, Link2, CheckCircle2, ArrowRight, ArrowLeft, HelpCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export const PatientIdentityPage: React.FC = () => {
  const navigate = useNavigate();
  const { identity, verifyIdentity, requestStaffAssistance, accessibility, speak, stopSpeaking, t } = usePatientIntake();
  const [tab, setTab] = useState<'phone' | 'mrn' | 'abha'>('phone');
  const [inputValue, setInputValue] = useState('9876543210');
  const [isVerifying, setIsVerifying] = useState(false);

  React.useEffect(() => {
    if (accessibility.voiceGuidance || accessibility.easyMode) {
      const timer = setTimeout(() => {
        speak(
          'Identity verification. Please verify your mobile number, or tap the quick check-in card to continue without typing.'
        );
      }, 400);
      return () => {
        clearTimeout(timer);
        stopSpeaking();
      };
    }
  }, [accessibility.voiceGuidance, accessibility.easyMode, speak, stopSpeaking]);

  const handleSimulateVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      verifyIdentity();
    }, 800);
  };

  return (
    <PageContainer
      title={t('identity.title')}
      subtitle={t('identity.subtitle')}
      maxWidth="md"
    >
      {/* Easy Mode 1-Tap Check-In Banner */}
      {accessibility.easyMode && (
        <Card
          variant="interactive"
          padding="lg"
          onClick={() => {
            setInputValue('9876543210');
            handleSimulateVerify();
          }}
          className="mb-6 border-3 border-amber-500 bg-amber-50 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer hover:bg-amber-100/80 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-2xl shadow-sm shrink-0">
              ⚡
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-amber-900">
                1-Tap Easy Check-In (Elder Assist)
              </div>
              <h3 className="font-black text-xl text-slate-950">
                Check In as Ramesh Kumar (Age 68)
              </h3>
              <p className="text-sm font-semibold text-slate-700 mt-0.5">
                Tap here to verify automatically without typing on the keyboard.
              </p>
            </div>
          </div>
          <Button
            variant="kiosk"
            size="lg"
            isLoading={isVerifying}
            className="w-full sm:w-auto shrink-0 bg-slate-950 hover:bg-slate-900 text-white font-black text-base px-6 py-4"
          >
            Check In Now
          </Button>
        </Card>
      )}

      {/* Identity Method Selector */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <button
          type="button"
          onClick={() => {
            setTab('phone');
            setInputValue('9876543210');
          }}
          className={cn(
            'flex flex-col items-center gap-1.5 p-3 rounded-clinical border-2 font-bold text-xs transition-all',
            tab === 'phone'
              ? 'border-brand-700 bg-brand-50 text-brand-900 shadow-sm'
              : 'border-clinical-border bg-white text-clinical-slate'
          )}
        >
          <Phone className="w-5 h-5 text-brand-700" />
          <span>{t('identity.tabPhone')}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setTab('mrn');
            setInputValue('MRN-90214');
          }}
          className={cn(
            'flex flex-col items-center gap-1.5 p-3 rounded-clinical border-2 font-bold text-xs transition-all',
            tab === 'mrn'
              ? 'border-brand-700 bg-brand-50 text-brand-900 shadow-sm'
              : 'border-clinical-border bg-white text-clinical-slate'
          )}
        >
          <CreditCard className="w-5 h-5 text-brand-700" />
          <span>{t('identity.tabMrn')}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setTab('abha');
            setInputValue('91-8841-2026-90');
          }}
          className={cn(
            'flex flex-col items-center gap-1.5 p-3 rounded-clinical border-2 font-bold text-xs transition-all',
            tab === 'abha'
              ? 'border-brand-700 bg-brand-50 text-brand-900 shadow-sm'
              : 'border-clinical-border bg-white text-clinical-slate'
          )}
        >
          <Link2 className="w-5 h-5 text-brand-700" />
          <span>{t('identity.tabAbha')}</span>
        </button>
      </div>

      {/* Input Field Form */}
      <Card variant="default" padding="lg" className="space-y-4 mb-6 bg-white border-clinical-border">
        <Input
          label={
            tab === 'phone'
              ? t('identity.phoneLabel')
              : tab === 'mrn'
              ? t('identity.mrnLabel')
              : t('identity.abhaLabel')
          }
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t('identity.placeholder')}
          isKiosk
          leftIcon={tab === 'phone' ? Phone : tab === 'mrn' ? CreditCard : Link2}
        />

        <Button
          variant="secondary"
          size="md"
          fullWidth
          isLoading={isVerifying}
          onClick={handleSimulateVerify}
        >
          {t('identity.verifyBtn')}
        </Button>
      </Card>

      {/* Verification Result Card */}
      {identity.isVerified && (
        <Card
          variant="default"
          padding="lg"
          className={cn(
            'border-2 border-emerald-500 bg-emerald-50/60 mb-6 shadow-sm',
            accessibility.easyMode && 'border-4 border-emerald-600 bg-emerald-50 p-6'
          )}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar name={identity.name} roleBadge="PAT" size="lg" />
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  <h3 className="font-extrabold text-lg text-clinical-navy">{identity.name}</h3>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                    {t('identity.verifiedBadge')}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs sm:text-sm text-clinical-muted mt-1.5 flex-wrap">
                  <span>{t('identity.age')}: <strong className="text-slate-900 font-black">{identity.age}y</strong></span>
                  <span>{t('identity.gender')}: <strong className="text-slate-900 font-black">{identity.gender.toUpperCase()}</strong></span>
                  <span>{t('identity.mrn')}: <strong className="text-slate-900 font-mono font-black">{identity.mrn}</strong></span>
                  <span>{t('identity.dept')}: <strong className="text-brand-800 font-black">{identity.department}</strong></span>
                </div>
              </div>
            </div>

            {accessibility.easyMode && (
              <Button
                variant="kiosk"
                size="lg"
                rightIcon={ArrowRight}
                onClick={() => navigate(PATIENT_ROUTES.INTAKE)}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg px-8 py-5 min-h-[60px] shadow-md shrink-0"
              >
                CONTINUE TO INTAKE ➔
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-clinical-border w-full">
        <Button
          variant="ghost"
          size="md"
          leftIcon={HelpCircle}
          onClick={() => requestStaffAssistance('Identity verification assistance requested')}
          className="text-slate-600 font-semibold"
        >
          {t('btn.staffAssistance')}
        </Button>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="lg"
            leftIcon={ArrowLeft}
            onClick={() => navigate(PATIENT_ROUTES.CONSENT)}
          >
            {t('btn.back')}
          </Button>

          <Button
            variant="kiosk"
            size="lg"
            disabled={!identity.isVerified}
            rightIcon={ArrowRight}
            onClick={() => navigate(PATIENT_ROUTES.INTAKE)}
          >
            {t('btn.continue')}
          </Button>
        </div>
      </div>
    </PageContainer>
  );
};

export default PatientIdentityPage;
