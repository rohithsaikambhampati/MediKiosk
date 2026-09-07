import React from 'react';
import { Outlet } from 'react-router-dom';
import { PatientHeader } from '../components/patient/PatientHeader';
import { PatientIntakeProvider, usePatientIntake } from '../context/PatientIntakeContext';
import { cn } from '../utils/cn';
import { ShieldCheck, Bell, X, UserCheck } from 'lucide-react';

const PatientLayoutInner: React.FC = () => {
  const { accessibility, textScale, assistanceAlertBanner, dismissAssistanceAlert, t } = usePatientIntake();

  React.useEffect(() => {
    if (assistanceAlertBanner) {
      const timer = setTimeout(() => {
        dismissAssistanceAlert();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [assistanceAlertBanner, dismissAssistanceAlert]);

  return (
    <div
      className={cn(
        'min-h-screen flex flex-col bg-clinical-bg text-clinical-navy font-sans transition-all selection:bg-brand-500 selection:text-white',
        accessibility.easyMode && 'kiosk-mode-elderly',
        accessibility.highContrast && 'high-contrast-mode',
        textScale === 'large' && 'text-scale-large',
        textScale === 'extra-large' && 'text-scale-xlarge'
      )}
    >
      {/* Quiet Kiosk Top Bar */}
      <PatientHeader />

      {/* Staff Assistance Dispatched Kiosk Toast Overlay */}
      {assistanceAlertBanner && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 animate-in slide-in-from-top duration-300">
          <div className="p-4 rounded-2xl bg-emerald-800 text-white shadow-2xl border-2 border-emerald-400 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-900 text-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-5 h-5 animate-bounce text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-white">
                    {t('header.nurseAlertTitle', 'Clinical Staff Notified')}
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-700 text-emerald-100 border border-emerald-500 uppercase">
                    Kiosk #04
                  </span>
                </div>
                <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
                  {t('header.nurseAlert', 'Nurse notified. A clinical assistant will arrive at Kiosk Terminal #04 to assist you.')}
                </p>
              </div>
            </div>
            <button
              onClick={dismissAssistanceAlert}
              className="text-emerald-200 hover:text-white p-1 rounded-full hover:bg-emerald-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Kiosk Content Canvas */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-6 sm:py-10 max-w-5xl w-full mx-auto">
        <Outlet />
      </main>

      {/* Reassuring Clinical Privacy Footer */}
      <footer className="py-4 border-t border-clinical-border bg-white text-center text-xs text-clinical-muted">
        <div className="flex items-center justify-center gap-2 max-w-lg mx-auto px-4">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            {t('footer.safety', 'MediKiosk Clinical Safety System • AI prepares your medical story. Your attending doctor decides.')}
          </span>
        </div>
      </footer>
    </div>
  );
};

export const PatientLayout: React.FC = () => {
  return (
    <PatientIntakeProvider>
      <PatientLayoutInner />
    </PatientIntakeProvider>
  );
};

export default PatientLayout;
