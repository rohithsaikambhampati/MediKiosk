import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PATIENT_ROUTES } from '../../constants/routes';
import { IntakeProgress } from '../../components/patient/IntakeProgress';
import { PatientStory } from '../../features/patient-story/PatientStory';
import { MOCK_PATIENT_STORY } from '../../services/mock/mockData';
import { Button } from '../../components/common/Button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export const PatientStoryPreviewPage: React.FC = () => {
  const navigate = useNavigate();

  const steps = [
    { id: 'lang', label: 'Language' },
    { id: 'consent', label: 'Consent' },
    { id: 'identity', label: 'Identity' },
    { id: 'intake', label: 'Intake' },
    { id: 'review', label: 'Review' },
  ];

  return (
    <div className="w-full flex flex-col gap-6 max-w-5xl mx-auto py-4">
      <IntakeProgress steps={steps} currentStepIndex={4} />

      <PatientStory story={MOCK_PATIENT_STORY} />

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-clinical-border">
        <Button
          variant="primary"
          size="kiosk"
          leftIcon={CheckCircle2}
          rightIcon={ArrowRight}
          onClick={() => navigate(PATIENT_ROUTES.COMPLETE)}
        >
          Confirm Summary & Submit to Doctor Queue
        </Button>
      </div>
    </div>
  );
};
