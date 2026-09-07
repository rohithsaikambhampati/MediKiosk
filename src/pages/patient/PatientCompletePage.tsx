import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PATIENT_ROUTES, DOCTOR_ROUTES } from '../../constants/routes';
import { usePatientIntake } from '../../context/PatientIntakeContext';
import { CenteredTaskLayout } from '../../components/common/containers/LayoutContainers';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { CheckCircle2, Ticket, ShieldCheck, RefreshCw, Monitor, Check } from 'lucide-react';

export const PatientCompletePage: React.FC = () => {
  const navigate = useNavigate();
  const { identity, resetIntake, accessibility, speak, stopSpeaking, t } = usePatientIntake();

  React.useEffect(() => {
    if (accessibility.voiceGuidance || accessibility.easyMode) {
      const timer = setTimeout(() => {
        speak(`${t('complete.title', 'Your information has been submitted.')} ${t('complete.tokenTitle', 'OPD Consultation Token')} 102. ${t('complete.reassure', 'Please collect your printed token slip and take a seat in the General Medicine waiting area.')}`);
      }, 400);
      return () => {
        clearTimeout(timer);
        stopSpeaking();
      };
    }
  }, [accessibility.voiceGuidance, accessibility.easyMode, speak, stopSpeaking, t]);

  const handleDone = () => {
    stopSpeaking();
    resetIntake();
    navigate(PATIENT_ROUTES.WELCOME);
  };

  return (
    <CenteredTaskLayout maxWidth="md">
      <Card variant="kiosk" padding="lg" className="text-center flex flex-col items-center gap-6 bg-white border-emerald-300 shadow-kiosk">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-md">
          <CheckCircle2 className="w-12 h-12 stroke-[2.2]" />
        </div>

        {/* Headings */}
        <div className="space-y-2 max-w-lg">
          <h1 className="text-3xl font-extrabold text-clinical-navy">
            {t('complete.title', 'Your information has been submitted.')}
          </h1>
          <p className="text-sm sm:text-base text-clinical-slate font-medium">
            {t('complete.subtitle', 'Your pre-consultation summary has been sent to your doctor for clinical review.')}
          </p>
        </div>

        {/* Token Card */}
        <Card variant="default" padding="lg" className="w-full bg-slate-50 border-2 border-emerald-300 space-y-4">
          <div className="flex items-center justify-center gap-2 text-xs font-extrabold uppercase tracking-widest text-emerald-800">
            <Ticket className="w-4 h-4 text-emerald-600" />
            <span>{t('complete.tokenTitle', 'OPD Consultation Token')}</span>
          </div>

          <div className="text-5xl sm:text-6xl font-black text-clinical-navy tracking-tight">
            #102
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-clinical-slate pt-3 border-t border-slate-200">
            <div>
              <span className="text-clinical-muted block font-normal">{t('complete.patientName', 'Patient Name')}</span>
              <strong className="text-slate-900">{identity.name || 'Ramesh Kumar'}</strong>
            </div>
            <div>
              <span className="text-clinical-muted block font-normal">{t('complete.department', 'Department')}</span>
              <strong className="text-brand-800">{identity.department || 'General Medicine'}</strong>
            </div>
            <div>
              <span className="text-clinical-muted block font-normal">{t('complete.room', 'Assigned OPD Room')}</span>
              <strong className="text-slate-900">Room #04</strong>
            </div>
            <div>
              <span className="text-clinical-muted block font-normal">{t('complete.status', 'Status')}</span>
              <span className="text-emerald-700 font-extrabold">{t('complete.statusWaiting', 'Waiting for Consultation')}</span>
            </div>
          </div>
        </Card>

        {/* Reassuring Instruction */}
        <div className="text-xs text-clinical-muted font-medium bg-emerald-50/60 p-3 rounded-clinical border border-emerald-200 w-full flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{t('complete.reassure', 'Please collect your printed token slip and take a seat in the General Medicine waiting area.')}</span>
        </div>

        {/* Action Buttons: Primary Done vs Secondary Demo Doctor View */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full pt-2">
          <Button
            variant="primary"
            size="lg"
            leftIcon={Check}
            onClick={handleDone}
            className="w-full sm:w-auto min-w-[200px] shadow-md"
          >
            {t('complete.homeBtn', 'Done — Return to Home')}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            leftIcon={Monitor}
            onClick={() => navigate(DOCTOR_ROUTES.DASHBOARD)}
            className="w-full sm:w-auto text-slate-500 hover:text-slate-900 hover:bg-slate-100 text-xs border border-dashed border-slate-300"
          >
            {t('complete.doctorDemoBtn', 'Demo: Open Doctor View')}
          </Button>
        </div>
      </Card>
    </CenteredTaskLayout>
  );
};

export default PatientCompletePage;
