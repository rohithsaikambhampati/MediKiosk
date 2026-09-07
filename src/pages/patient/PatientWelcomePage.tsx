import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PATIENT_ROUTES } from '../../constants/routes';
import { usePatientIntake } from '../../context/PatientIntakeContext';
import { CenteredTaskLayout } from '../../components/common/containers/LayoutContainers';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Stethoscope, ShieldCheck, Clock, ArrowRight, HelpCircle, Sparkles, Eye } from 'lucide-react';
import { cn } from '../../utils/cn';

export const PatientWelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { accessibility, setEasyMode, requestStaffAssistance, setIdentity, resetIntake, t } = usePatientIntake();

  const handleLaunchRameshDemo = () => {
    resetIntake();
    setIdentity({
      mrn: 'MRN-102948',
      phone: '+91-98765-43210',
      abhaId: '91-8273-1928-4451',
      isVerified: true,
      name: 'Ramesh Kumar',
      age: 54,
      gender: 'male',
      department: 'Cardiology',
    });
    navigate(PATIENT_ROUTES.CONSENT);
  };

  return (
    <CenteredTaskLayout maxWidth="md">
      {/* Synthetic Demo Indicator Banner */}
      <div className="flex items-center justify-center mb-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-amber-100 text-amber-900 border border-amber-300 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          SYNTHETIC DEMO ENVIRONMENT
        </span>
      </div>

      <Card
        variant="kiosk"
        padding="lg"
        className="text-center flex flex-col items-center gap-6 border-brand-200 shadow-kiosk bg-white relative overflow-hidden"
      >
        {/* Subtle decorative clinical icon graphic background */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-brand-50/60 pointer-events-none" />

        {/* Clean healthcare symbol - NOT an AI robot or chatbot */}
        <div className="w-20 h-20 rounded-full bg-brand-50 border-2 border-brand-200 text-brand-700 flex items-center justify-center shadow-sm">
          <Stethoscope className="w-10 h-10 stroke-[2.2]" />
        </div>

        {/* Headings */}
        <div className="space-y-2 max-w-lg">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-clinical-navy tracking-tight">
            {t('welcome.title')}
          </h1>
          <p className="text-base sm:text-lg text-clinical-slate font-medium leading-relaxed">
            {t('welcome.subtitle')}
          </p>
        </div>

        {/* Dominant Primary CTA */}
        <div className={cn("w-full space-y-4 pt-2", accessibility.easyMode ? "max-w-lg" : "max-w-sm")}>
          <Button
            variant="kiosk"
            size="xl"
            fullWidth
            rightIcon={ArrowRight}
            onClick={() => navigate(PATIENT_ROUTES.LANGUAGE)}
            className="shadow-md"
          >
            {t('welcome.startIntake')}
          </Button>

          {/* Easy Mode Quick Access on Welcome Screen */}
          {!accessibility.easyMode ? (
            <Button
              variant="outline"
              size="lg"
              fullWidth
              leftIcon={Eye}
              onClick={() => setEasyMode(true)}
              className="border-2 border-amber-600 bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs sm:text-sm shadow-xs"
            >
              AA Turn On Easy Mode (Elder / Assist)
            </Button>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-amber-100 border-2 border-amber-500 w-full text-slate-950 font-bold gap-3">
              <span className="flex items-center gap-2 text-center sm:text-left">
                <Eye className="w-5 h-5 text-amber-700 stroke-[2.5] shrink-0" />
                <span>Easy Mode Active: Voice & Large Text</span>
              </span>
              <button
                type="button"
                onClick={() => setEasyMode(false)}
                className="text-amber-900 underline font-extrabold px-3 py-1 hover:bg-amber-200 rounded-lg whitespace-nowrap"
              >
                Turn Off
              </button>
            </div>
          )}

          {/* Direct Demo Quick Launch */}
          <Button
            variant="outline"
            size="md"
            fullWidth
            leftIcon={Sparkles}
            onClick={handleLaunchRameshDemo}
            className="border-amber-400 bg-amber-50/70 hover:bg-amber-100 text-amber-950 font-bold text-xs shadow-sm"
          >
            Ramesh Kumar — Complete SIH Demo Flow
          </Button>

          <Button
            variant="ghost"
            size="md"
            fullWidth
            leftIcon={HelpCircle}
            onClick={() => requestStaffAssistance('Patient requested assistance at Welcome screen')}
            className="text-slate-600 hover:text-brand-800 font-semibold"
          >
            {t('btn.needHelp')}
          </Button>
        </div>

        {/* Reassuring Contextual Badges */}
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 text-xs font-semibold text-clinical-muted pt-4 border-t border-clinical-border w-full">
          <span className="flex items-center gap-1.5 text-slate-700">
            <Clock className="w-4 h-4 text-brand-700 shrink-0" />
            <span>{t('welcome.duration')}</span>
          </span>
          <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t('welcome.security')}</span>
          </span>
        </div>
      </Card>
    </CenteredTaskLayout>
  );
};

export default PatientWelcomePage;
