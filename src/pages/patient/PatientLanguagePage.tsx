import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PATIENT_ROUTES } from '../../constants/routes';
import { SUPPORTED_LANGUAGES } from '../../constants/languages';
import { usePatientIntake } from '../../context/PatientIntakeContext';
import { PageContainer } from '../../components/common/containers/LayoutContainers';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '../../utils/cn';

export const PatientLanguagePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, t } = usePatientIntake();

  const returnTo = (location.state as { returnTo?: string })?.returnTo;

  const handleContinue = () => {
    if (returnTo) {
      navigate(returnTo);
    } else {
      navigate(PATIENT_ROUTES.ACCESSIBILITY);
    }
  };

  const handleBack = () => {
    if (returnTo) {
      navigate(returnTo);
    } else {
      navigate(PATIENT_ROUTES.WELCOME);
    }
  };

  return (
    <PageContainer
      title={t('language.title')}
      subtitle={t('language.subtitle')}
      maxWidth="lg"
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4 my-6">
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = language === lang.code;
          return (
            <Card
              key={lang.code}
              variant="interactive"
              padding="lg"
              onClick={() => setLanguage(lang.code)}
              className={cn(
                'flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer min-h-[130px] relative border-2',
                isSelected
                  ? 'border-brand-700 bg-brand-50/70 ring-2 ring-brand-700 shadow-md scale-[1.02]'
                  : 'border-clinical-border bg-white hover:border-brand-300 hover:bg-slate-50/50'
              )}
            >
              {isSelected && (
                <CheckCircle2 className="w-5 h-5 text-brand-700 absolute top-3 right-3 shrink-0" />
              )}
              <span className="text-2xl">{lang.flag}</span>
              <span className="text-2xl font-black text-clinical-navy">{lang.nativeName}</span>
              <span className="text-xs font-semibold text-clinical-muted">{lang.name}</span>
            </Card>
          );
        })}
      </div>

      {/* Navigation Actions */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-clinical-border w-full">
        <Button
          variant="outline"
          size="lg"
          leftIcon={ArrowLeft}
          onClick={handleBack}
        >
          {t('btn.back')}
        </Button>

        <Button
          variant="kiosk"
          size="lg"
          rightIcon={ArrowRight}
          onClick={handleContinue}
        >
          {returnTo ? t('btn.saveAndReturn') : t('btn.continue')}
        </Button>
      </div>
    </PageContainer>
  );
};

export default PatientLanguagePage;
