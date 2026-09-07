import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NURSE_ROUTES } from '../../constants/routes';
import { useNurseTriage } from '../../context/NurseTriageContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Avatar } from '../../components/common/Avatar';
import { RiskBadge } from '../../features/risk/RiskBadge';
import { TriageStatusBadge } from '../../components/nurse/TriageStatusBadge';
import { TriageReasonPanel } from '../../components/nurse/TriageReasonPanel';
import { EscalationModal, SendToDoctorModal } from '../../components/nurse/TriageModals';
import { Drawer } from '../../components/common/Drawer';
import {
  ArrowLeft,
  Activity,
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Pill,
  ShieldAlert,
  Building2,
  Eye,
  UserCheck,
} from 'lucide-react';
import { cn } from '../../utils/cn';

import { HandoffApi, HandoffRecordDto } from '../../services/api/handoffApi';

export const NurseTriagePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    activePatient,
    alerts,
    acknowledgeAlert,
    escalatePatient,
    sendToDoctor,
    markReviewed,
  } = useNurseTriage();

  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [isSendDoctorModalOpen, setIsSendDoctorModalOpen] = useState(false);
  const [isPatientStoryOpen, setIsPatientStoryOpen] = useState(false);
  const [handoffRecord, setHandoffRecord] = useState<HandoffRecordDto | null>(null);

  const patientAlert = alerts.find((a) => a.patientId === activePatient.id);
  const isAcknowledged = patientAlert?.status === 'acknowledged';

  React.useEffect(() => {
    let isMounted = true;
    HandoffApi.getHandoff(`intake-${activePatient.id}`)
      .then((record) => {
        if (isMounted && record) setHandoffRecord(record);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [activePatient.id]);

  const handleAcknowledge = async () => {
    if (patientAlert) {
      acknowledgeAlert(patientAlert.id);
    }
    markReviewed(activePatient.id);
    try {
      const rec = await HandoffApi.createHandoff(`intake-${activePatient.id}`, {
        patient_id: activePatient.id,
        status: 'IN_REVIEW',
        review_notes: 'Alert acknowledged by Nurse Priya.',
      });
      setHandoffRecord(rec);
    } catch (err) {
      console.warn('Handoff acknowledge API notice:', err);
    }
  };

  const handleConfirmEscalate = async () => {
    escalatePatient(activePatient.id);
    try {
      const rec = await HandoffApi.createHandoff(`intake-${activePatient.id}`, {
        patient_id: activePatient.id,
        priority: 'HIGH_PRIORITY_REVIEW',
        status: 'TRIAGE_REQUIRED',
        review_notes: `Urgent escalation requested by triage nurse: ${activePatient.whyFlagged?.join(', ') || 'Red flag indicators present'}`,
      });
      setHandoffRecord(rec);
    } catch (err) {
      console.warn('Handoff escalate API notice:', err);
    }
  };

  const handleConfirmSendToDoctor = async () => {
    sendToDoctor(activePatient.id);
    try {
      const priority =
        activePatient.priority === 'immediate'
          ? 'HIGH_PRIORITY_REVIEW'
          : activePatient.priority === 'high-priority'
          ? 'REVIEW_REQUIRED'
          : 'ROUTINE';
      const rec = await HandoffApi.createHandoff(`intake-${activePatient.id}`, {
        patient_id: activePatient.id,
        priority,
        status: 'ASSIGNED',
        assigned_to: 'Dr. Anita Sharma',
        review_notes: 'Triage complete. Dispatched to General Medicine consultation queue.',
      });
      setHandoffRecord(rec);
    } catch (err) {
      console.warn('Handoff send to doctor API notice:', err);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* 16. TRIAGE WORKSPACE HERO HEADER */}
      <div className="flex flex-col gap-4 bg-white p-5 rounded-clinical border-2 border-sky-300 shadow-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              leftIcon={ArrowLeft}
              onClick={() => navigate(NURSE_ROUTES.QUEUE)}
              className="text-xs"
            >
              Back to Queue
            </Button>

            <div className="text-3xl font-black font-mono text-clinical-navy px-4 py-1.5 bg-sky-50 rounded-clinical border border-sky-300">
              {activePatient.token}
            </div>

            <Avatar name={activePatient.name} roleBadge="PAT" size="lg" />

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">{activePatient.name}</h1>
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                  {activePatient.age} years • {activePatient.gender.toUpperCase()}
                </span>
              </div>
              <div className="text-xs text-clinical-muted font-medium mt-1 flex items-center gap-2 flex-wrap">
                <span>MRN: <strong className="font-mono text-slate-800">MK-2026-8841</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1 text-brand-800 font-bold">
                  <Building2 className="w-3.5 h-3.5 text-brand-600" /> {activePatient.department}
                </span>
                <span>•</span>
                <TriageStatusBadge status={activePatient.status} size="sm" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <RiskBadge level={activePatient.riskLevel} size="md" />
          </div>
        </div>
      </div>

      {/* Main Workspace 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left & Center Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* 18. TRIAGE REASON PANEL */}
          <TriageReasonPanel
            whyFlagged={activePatient.whyFlagged}
            priority={activePatient.priority}
          />

          {/* Chief Complaint & Key Intake Information */}
          <Card variant="default" padding="lg" className="bg-white border-clinical-border shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-clinical-navy flex items-center gap-2">
                <Activity className="w-5 h-5 text-sky-700" /> Chief Complaint & Intake Summary
              </h3>
              <Button
                variant="outline"
                size="sm"
                leftIcon={FileText}
                onClick={() => setIsPatientStoryOpen(true)}
                className="text-xs border-slate-300 hover:bg-slate-50 text-slate-700 font-bold"
              >
                View Full Patient Story
              </Button>
            </div>

            <div className="p-4 rounded-clinical bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 leading-relaxed">
              “{activePatient.chiefComplaint}”
            </div>
          </Card>

          {/* Patient History, Current Medicines & Allergies */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* History Highlights */}
            <Card variant="default" padding="md" className="bg-white border-clinical-border shadow-sm space-y-2">
              <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                <FileText className="w-4 h-4 text-sky-700" /> Relevant History
              </h4>
              <ul className="space-y-1 font-medium text-slate-700">
                {activePatient.historyHighlights.map((h, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-600 shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Current Medicines */}
            <Card variant="default" padding="md" className="bg-white border-clinical-border shadow-sm space-y-2">
              <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                <Pill className="w-4 h-4 text-brand-700" /> Current Medicines
              </h4>
              <ul className="space-y-1.5 font-semibold text-slate-900">
                {activePatient.medications.map((m, i) => (
                  <li key={i} className="flex justify-between bg-slate-50 p-1.5 rounded border border-slate-200">
                    <span>{m.name}</span>
                    <span className="font-mono text-[11px] text-slate-600">{m.dose}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Critical Allergies */}
            <Card variant="default" padding="md" className="bg-white border-clinical-border shadow-sm space-y-2">
              <h4 className="font-extrabold text-red-950 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                <ShieldAlert className="w-4 h-4 text-red-600" /> Critical Allergies
              </h4>
              <div className="space-y-1">
                {activePatient.allergies.map((a, i) => (
                  <div key={i} className="p-1.5 rounded bg-red-50 text-red-950 border border-red-200 font-bold text-[11px]">
                    {a}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* 17. COMPACT WORKFLOW TIMELINE */}
          <Card variant="default" padding="md" className="bg-white border-clinical-border shadow-sm space-y-3">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-clinical-navy flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-700" /> Triage Workflow Timeline
            </h4>

            <div className="relative border-l-2 border-sky-200 ml-3 pl-5 space-y-3 text-xs">
              <div className="relative">
                <div className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-sky-700 ring-2 ring-white" />
                <div className="font-mono font-bold text-slate-500">10:31 AM</div>
                <div className="font-extrabold text-slate-900">Patient Arrived at MediKiosk Intake</div>
              </div>

              <div className="relative">
                <div className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-sky-700 ring-2 ring-white" />
                <div className="font-mono font-bold text-slate-500">10:33 AM</div>
                <div className="font-extrabold text-slate-900">Identity & Demographic Verified</div>
              </div>

              <div className="relative">
                <div className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-sky-700 ring-2 ring-white" />
                <div className="font-mono font-bold text-slate-500">10:34 AM</div>
                <div className="font-extrabold text-slate-900">Guided Voice Clinical Intake Completed</div>
              </div>

              <div className="relative">
                <div className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-red-600 ring-2 ring-white" />
                <div className="font-mono font-bold text-red-700">10:37 AM</div>
                <div className="font-extrabold text-red-950">Potential Red Flag Signals Identified</div>
              </div>

              <div className="relative">
                <div className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-amber-500 ring-2 ring-white" />
                <div className="font-mono font-bold text-amber-800">10:38 AM</div>
                <div className="font-extrabold text-amber-950">Triage Priority Alert Generated</div>
              </div>

              {isAcknowledged && (
                <div className="relative">
                  <div className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-600 ring-2 ring-white" />
                  <div className="font-mono font-bold text-emerald-800">10:44 AM</div>
                  <div className="font-extrabold text-emerald-950">
                    Acknowledged by Nurse Priya, RN
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* 20. NURSE ACTION PANEL (Right Column) */}
        <div className="space-y-4">
          <Card variant="default" padding="md" className="bg-white border-2 border-sky-300 shadow-md space-y-4 sticky top-20">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-sm text-clinical-navy uppercase tracking-wide">
                Nurse Action Controls
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Review alert & route patient for clinical consultation.
              </p>
            </div>

            {/* Clinical Handoff State Indicator */}
            {handoffRecord && (
              <div className="p-2.5 rounded-clinical bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Handoff Priority:</span>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-[10px] font-black',
                      handoffRecord.priority === 'HIGH_PRIORITY_REVIEW'
                        ? 'bg-red-100 text-red-900 border border-red-200'
                        : handoffRecord.priority === 'REVIEW_REQUIRED'
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : 'bg-slate-100 text-slate-800 border border-slate-200'
                    )}
                  >
                    {handoffRecord.priority}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Handoff Status:</span>
                  <span className="font-mono text-[10px] font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {handoffRecord.status}
                  </span>
                </div>
                {handoffRecord.assigned_to && (
                  <div className="text-[11px] text-slate-600">
                    Assigned: <strong className="text-slate-800">{handoffRecord.assigned_to}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Alert Acknowledgement Status Indicator */}
            {isAcknowledged ? (
              <div className="p-3 rounded-clinical bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                <div className="font-extrabold flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Alert Acknowledged</span>
                </div>
                <div className="text-[11px] font-medium text-emerald-900">
                  Acknowledged by Nurse Priya • Today 10:44 AM
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="md"
                fullWidth
                leftIcon={UserCheck}
                onClick={handleAcknowledge}
                className="border-sky-300 hover:bg-sky-50 text-sky-900 font-bold"
              >
                Acknowledge Alert
              </Button>
            )}

            {/* Escalation Action */}
            <Button
              variant="danger"
              size="md"
              fullWidth
              leftIcon={AlertOctagon}
              onClick={() => setIsEscalateModalOpen(true)}
              className="font-bold shadow-sm"
            >
              Escalate to Clinical Staff
            </Button>

            {/* Send to Doctor Handoff Action */}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              leftIcon={ArrowRight}
              onClick={() => setIsSendDoctorModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-md"
            >
              Send to Doctor Queue
            </Button>

            <div className="pt-2 border-t border-slate-100">
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                onClick={() => navigate(NURSE_ROUTES.QUEUE)}
                className="text-slate-600"
              >
                Return to Triage Queue
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* 19. READ-ORIENTED PATIENT STORY DRAWER */}
      <Drawer
        isOpen={isPatientStoryOpen}
        onClose={() => setIsPatientStoryOpen(false)}
        title={`Patient Intake Story — ${activePatient.name}`}
        subtitle={`Read-only triage view • Token ${activePatient.token}`}
        width="lg"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-clinical bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="font-extrabold text-sm text-slate-900">Patient Reported Summary</h4>
            <p className="text-slate-700 leading-relaxed font-medium">
              “{activePatient.chiefComplaint}”
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900">Recorded Intake Answers</h4>
            <div className="space-y-2">
              <div className="p-3 rounded bg-white border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Q: Chief Complaint</span>
                <span className="font-semibold text-slate-900">{activePatient.chiefComplaint}</span>
              </div>
              <div className="p-3 rounded bg-white border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Q: Current Medicines</span>
                <span className="font-semibold text-slate-900">
                  {activePatient.medications.map((m) => `${m.name} ${m.dose}`).join(', ')}
                </span>
              </div>
              <div className="p-3 rounded bg-white border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Q: Allergies</span>
                <span className="font-semibold text-red-700">{activePatient.allergies.join(', ')}</span>
              </div>
            </div>
          </div>
        </div>
      </Drawer>

      {/* Confirmation Modals */}
      <EscalationModal
        isOpen={isEscalateModalOpen}
        onClose={() => setIsEscalateModalOpen(false)}
        onConfirm={handleConfirmEscalate}
        patient={activePatient}
      />

      <SendToDoctorModal
        isOpen={isSendDoctorModalOpen}
        onClose={() => setIsSendDoctorModalOpen(false)}
        onConfirm={handleConfirmSendToDoctor}
        patient={activePatient}
      />
    </div>
  );
};

export default NurseTriagePage;
