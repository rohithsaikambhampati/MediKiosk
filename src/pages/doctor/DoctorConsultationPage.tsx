import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DOCTOR_ROUTES } from '../../constants/routes';
import { useDoctorWorkspace } from '../../context/DoctorWorkspaceContext';
import { PageContainer } from '../../components/common/containers/LayoutContainers';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Avatar } from '../../components/common/Avatar';
import { RiskBadge } from '../../features/risk/RiskBadge';
import {
  Stethoscope,
  CheckCircle2,
  ArrowLeft,
  Clock,
  Pill,
  ShieldAlert,
  Activity,
  FileCheck,
  Building2,
  Sparkles,
} from 'lucide-react';

export const DoctorConsultationPage: React.FC = () => {
  const navigate = useNavigate();
  const { activePatient, completeConsultation } = useDoctorWorkspace();
  const [isCompleted, setIsCompleted] = useState(false);

  const handleComplete = () => {
    completeConsultation(activePatient.id);
    setIsCompleted(true);
  };

  return (
    <PageContainer
      title={isCompleted ? 'Consultation Completed' : 'Active Clinical Consultation'}
      subtitle={
        isCompleted
          ? `Consultation for ${activePatient.name} has been completed and signed.`
          : `Live consultation session in progress for Token ${activePatient.token}.`
      }
      maxWidth="xl"
    >
      {!isCompleted ? (
        <div className="space-y-6">
          {/* Header Identity Card */}
          <Card variant="default" padding="lg" className="bg-white border-clinical-border shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl font-black font-mono text-clinical-navy px-4 py-2 bg-brand-50 rounded-clinical border border-brand-200">
                  {activePatient.token}
                </div>
                <Avatar name={activePatient.name} roleBadge="PAT" size="lg" />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-extrabold text-slate-900">{activePatient.name}</h2>
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded">
                      {activePatient.age}y • {activePatient.gender.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-clinical-muted font-medium mt-0.5">
                    Attending Physician: <strong className="text-brand-800">Dr. Ananya Sharma</strong> • Dept:{' '}
                    <strong className="text-slate-800">General Medicine</strong>
                  </div>
                </div>
              </div>

              <RiskBadge level={activePatient.riskLevel} size="md" />
            </div>

            {/* Quick Pre-Consultation Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200 text-xs">
              <div className="p-3 rounded-clinical bg-slate-50 border border-slate-200">
                <span className="text-clinical-muted font-bold block flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-brand-700" /> Chief Complaint
                </span>
                <p className="font-semibold text-slate-900 mt-1 line-clamp-2">
                  “{activePatient.chiefComplaint}”
                </p>
              </div>

              <div className="p-3 rounded-clinical bg-slate-50 border border-slate-200">
                <span className="text-clinical-muted font-bold block flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-brand-700" /> Verified Medicines
                </span>
                <p className="font-semibold text-slate-900 mt-1">
                  Metformin 500mg BD, Aspirin 75mg OD
                </p>
              </div>

              <div className="p-3 rounded-clinical bg-red-50 border border-red-200">
                <span className="text-red-800 font-bold block flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-600" /> Allergies
                </span>
                <p className="font-semibold text-red-950 mt-1">
                  ⚠ Penicillin (Severe Cutaneous Rash)
                </p>
              </div>
            </div>
          </Card>

          {/* Active Consultation Console Box */}
          <Card variant="default" padding="lg" className="bg-slate-900 text-white space-y-5 text-center shadow-xl">
            <div className="w-16 h-16 rounded-full bg-brand-700/40 text-brand-400 border border-brand-500/30 flex items-center justify-center mx-auto animate-pulse">
              <Stethoscope className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Consultation Session in Progress</h3>
              <p className="text-xs text-slate-300">
                Pre-consultation intake verified by Dr. Ananya Sharma. Update notes and complete session below.
              </p>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <Button
                variant="outline"
                size="md"
                leftIcon={ArrowLeft}
                onClick={() => navigate(DOCTOR_ROUTES.PATIENT_OVERVIEW.replace(':patientId', activePatient.id))}
                className="bg-transparent border-slate-700 text-slate-200 hover:bg-slate-800"
              >
                Back to Patient Story
              </Button>

              <Button
                variant="primary"
                size="lg"
                leftIcon={CheckCircle2}
                onClick={handleComplete}
                className="bg-emerald-600 hover:bg-emerald-500 text-white border-none shadow-lg"
              >
                Complete Consultation
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        /* Completion State Card */
        <Card variant="default" padding="lg" className="bg-white border-clinical-border shadow-xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Consultation Complete!</h2>
            <p className="text-sm text-clinical-muted max-w-md mx-auto">
              Clinical story for <strong className="text-slate-900">{activePatient.name} ({activePatient.token})</strong> has been signed off and recorded in MediKiosk.
            </p>
          </div>

          <div className="p-4 rounded-clinical bg-slate-50 border border-slate-200 max-w-md mx-auto text-xs text-left space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200 pb-2">
              <span>Clinical Record Audit Log</span>
              <span className="text-emerald-700">✓ Signed</span>
            </div>
            <div className="flex justify-between text-clinical-muted">
              <span>Patient Token:</span>
              <span className="font-mono text-slate-800">{activePatient.token}</span>
            </div>
            <div className="flex justify-between text-clinical-muted">
              <span>Attending Doctor:</span>
              <span className="text-slate-800">Dr. Ananya Sharma</span>
            </div>
            <div className="flex justify-between text-clinical-muted">
              <span>Integration Status:</span>
              <span className="text-brand-800 font-semibold">Demo Integration Ready</span>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-3">
            <Button
              variant="primary"
              size="md"
              leftIcon={ArrowLeft}
              onClick={() => navigate(DOCTOR_ROUTES.QUEUE)}
            >
              Back to Patient Queue
            </Button>
          </div>
        </Card>
      )}
    </PageContainer>
  );
};

export default DoctorConsultationPage;
