import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { DOCTOR_ROUTES } from '../../constants/routes';
import { useDoctorWorkspace } from '../../context/DoctorWorkspaceContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Avatar } from '../../components/common/Avatar';
import { RiskBadge } from '../../features/risk/RiskBadge';
import { ConfidenceBadge } from '../../features/confidence/ConfidenceBadge';
import { VerificationControl } from '../../components/doctor/VerificationControl';
import { ConflictCenter } from '../../components/doctor/ConflictCenter';
import { ProvenanceBadge } from '../../components/doctor/ProvenanceBadge';
import { EvidenceDrawer } from '../../features/evidence/EvidenceDrawer';
import { Modal } from '../../components/common/Modal';
import { MedicalFact } from '../../types/evidence';
import {
  ArrowLeft,
  Stethoscope,
  AlertTriangle,
  FileText,
  Clock,
  Pill,
  ShieldAlert,
  Activity,
  Sparkles,
  Eye,
  FileCheck,
  Building2,
  CheckCircle2,
  Download,
  Send,
  RefreshCw,
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const DoctorPatientWorkspacePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { patientId } = useParams<{ patientId: string }>();
  const { activePatient, verifiedFactsState, verifyFact, rejectFact, startConsultation } = useDoctorWorkspace();

  const getCurrentTabFromPath = () => {
    const path = location.pathname;
    if (path.endsWith('/timeline')) return 'timeline';
    if (path.endsWith('/medications')) return 'medications';
    if (path.endsWith('/allergies')) return 'allergies';
    if (path.endsWith('/reports')) return 'reports';
    if (path.endsWith('/evidence')) return 'evidence';
    if (path.endsWith('/ai-review')) return 'ai-review';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState<string>(getCurrentTabFromPath());
  const [selectedFact, setSelectedFact] = useState<MedicalFact | null>(null);
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);
  const [realDocs, setRealDocs] = useState<any[]>([]);
  const [realTimeline, setRealTimeline] = useState<any[]>([]);

  // Demo Interoperability & FHIR Export State
  const [isFhirModalOpen, setIsFhirModalOpen] = useState(false);
  const [fhirBundle, setFhirBundle] = useState<any | null>(null);
  const [isGeneratingFhir, setIsGeneratingFhir] = useState(false);
  const [demoSubmitResult, setDemoSubmitResult] = useState<any | null>(null);
  const [isSubmittingDemo, setIsSubmittingDemo] = useState(false);

  const handleGenerateFhir = async () => {
    setIsGeneratingFhir(true);
    setDemoSubmitResult(null);
    try {
      const { InteroperabilityApi } = await import('../../services/api/interoperabilityApi');
      const pid = activePatient?.id || patientId || 'patient-ramesh-01';
      const bundle = await InteroperabilityApi.getPatientFHIRBundle(pid);
      setFhirBundle(bundle);
    } catch (err: any) {
      alert(err.message || 'Failed to generate FHIR Bundle');
    } finally {
      setIsGeneratingFhir(false);
    }
  };

  const handleDownloadFhirJson = () => {
    if (!fhirBundle) return;
    const blob = new Blob([JSON.stringify(fhirBundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fhir_bundle_${activePatient.id || 'patient'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSimulateDemoSubmission = async () => {
    if (!fhirBundle) return;
    setIsSubmittingDemo(true);
    try {
      const { InteroperabilityApi } = await import('../../services/api/interoperabilityApi');
      const pid = activePatient?.id || patientId || 'patient-ramesh-01';
      const result = await InteroperabilityApi.submitDemoInteroperability(pid, fhirBundle);
      setDemoSubmitResult(result);
    } catch (err: any) {
      alert(err.message || 'Failed to submit demo transaction');
    } finally {
      setIsSubmittingDemo(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    import('../../services/api/documentApi').then(({ DocumentApi }) => {
      const pid = activePatient?.id || patientId || 'patient-ramesh-01';
      DocumentApi.getPatientDocuments(pid).then((docs) => {
        if (isMounted && docs && docs.length > 0) setRealDocs(docs);
      }).catch(() => {});

      DocumentApi.getPatientTimeline(pid).then((tl) => {
        if (isMounted && tl && tl.length > 0) setRealTimeline(tl);
      }).catch(() => {});
    });
    return () => {
      isMounted = false;
    };
  }, [activePatient?.id, patientId]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleOpenEvidence = (fact: MedicalFact) => {
    setSelectedFact(fact);
    setIsEvidenceOpen(true);
  };

  const handleStartConsultationClick = () => {
    startConsultation(activePatient.id);
    navigate(DOCTOR_ROUTES.CONSULTATION);
  };

  const mockMetforminFact: MedicalFact = {
    id: 'fact-metformin',
    patientId: activePatient.id,
    category: 'medication',
    title: 'Metformin Dosage Discrepancy',
    detail: 'Metformin 500 mg BD reported in voice interview vs 850 mg BD in prescription.',
    extractedDate: 'Today',
    verificationStatus: verifiedFactsState['fact-metformin'] || 'needs-verification',
    confidence: 'medium',
    sources: [
      {
        id: 'src-1',
        type: 'uploaded-document',
        title: 'Prescription_Feb2025.jpg',
        date: '03 Feb 2025',
        snippetText: 'Rx: Tab Metformin 850mg BD after food.',
        confidence: 'high',
      },
      {
        id: 'src-2',
        type: 'conversation-transcript',
        title: 'Voice Interview - Q: Current Medicines',
        date: '10:12 AM Today',
        snippetText: 'I take Metformin 500 mg twice daily for my blood sugar.',
        confidence: 'medium',
      },
    ],
  };

  const mockPenicillinFact: MedicalFact = {
    id: 'fact-penicillin',
    patientId: activePatient.id,
    category: 'allergy',
    title: 'Penicillin Allergy',
    detail: 'Severe skin rash and itching reported after taking penicillin in 2021.',
    extractedDate: '2021',
    verificationStatus: verifiedFactsState['fact-penicillin'] || 'needs-verification',
    confidence: 'medium',
    sources: [
      {
        id: 'src-3',
        type: 'conversation-transcript',
        title: 'Voice Interview - Q: Allergies',
        date: '10:14 AM Today',
        snippetText: 'I am allergic to penicillin, it caused severe rashes 3 years ago.',
        confidence: 'high',
      },
    ],
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* 4. DOCTOR HERO AREA — Visually Dominant Header */}
      <div className="flex flex-col gap-4 bg-white p-5 rounded-clinical border-2 border-brand-200 shadow-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              leftIcon={ArrowLeft}
              onClick={() => navigate(DOCTOR_ROUTES.QUEUE)}
              className="text-xs"
            >
              Back to Queue
            </Button>

            <div className="text-3xl font-black font-mono text-clinical-navy px-4 py-1.5 bg-brand-50 rounded-clinical border border-brand-300">
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
                  <Building2 className="w-3.5 h-3.5 text-brand-600" /> General Medicine
                </span>
                <span>•</span>
                <span className="text-emerald-800 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  READY FOR DOCTOR REVIEW
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap">
            <Button
              variant="outline"
              size="lg"
              leftIcon={Sparkles}
              onClick={() => {
                setIsFhirModalOpen(true);
                if (!fhirBundle) handleGenerateFhir();
              }}
              className="border-indigo-300 text-indigo-900 hover:bg-indigo-50 font-bold text-xs"
            >
              ⚡ FHIR Export (Demo)
            </Button>
            <Button
              variant="primary"
              size="lg"
              leftIcon={Stethoscope}
              onClick={handleStartConsultationClick}
              className="shadow-md bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs"
            >
              Start Consultation
            </Button>
          </div>
        </div>

        {/* 5. VISUALLY DISTINCT CLINICAL RISK BLOCK (Strictly Urgency, NOT Diagnosis) */}
        {activePatient.riskLevel === 'immediate' && (
          <Card variant="urgent" padding="md" className="border-l-4 border-l-red-600 bg-red-50/95 shadow-sm space-y-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-red-100 text-red-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-red-950 uppercase tracking-wide">
                      🔴 IMMEDIATE REVIEW REQUIRED
                    </h3>
                    <RiskBadge level="immediate" size="sm" />
                  </div>
                  <p className="text-xs text-red-900 mt-0.5 font-medium leading-relaxed">
                    Potential clinical red flags detected during intake.
                    <span className="font-bold"> Signals: Chest pain • Arm radiation • Sweating • Breathlessness.</span>
                  </p>
                  <p className="text-[11px] text-red-800 italic mt-0.5">
                    MediKiosk highlights potential risk signals — attending doctor makes final clinical diagnosis.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleTabChange('overview')}
                >
                  Review Intake Flags
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* 14. STICKY 7-TAB NAVIGATION */}
        <div className="flex items-center gap-1 border-t border-slate-200 pt-3 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'timeline', label: 'Timeline', icon: Clock },
            { id: 'medications', label: 'Medications', icon: Pill },
            { id: 'allergies', label: 'Allergies', icon: ShieldAlert },
            { id: 'reports', label: 'Reports', icon: FileText },
            { id: 'evidence', label: 'Evidence', icon: FileCheck },
            { id: 'ai-review', label: 'AI Review', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-clinical text-xs font-bold transition-all whitespace-nowrap select-none',
                  isActive
                    ? 'bg-brand-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left & Center Main Content Area (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* OVERVIEW TAB — Structured Information Hierarchy */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Conflict Center Discrepancy Card */}
              <ConflictCenter
                onOpenSources={() => handleOpenEvidence(mockMetforminFact)}
                onMarkResolved={() => verifyFact('fact-metformin')}
              />

              {/* 13. DOCTOR HIERARCHY: Chief Complaint */}
              <Card variant="default" padding="lg" className="bg-white border-clinical-border shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-brand-700" />
                    <h3 className="font-extrabold text-base text-clinical-navy">Chief Complaint</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <ProvenanceBadge type="patient-reported" />
                    <ConfidenceBadge level="high" size="sm" />
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={Eye}
                      onClick={() =>
                        handleOpenEvidence({
                          id: 'fact-cc',
                          patientId: activePatient.id,
                          category: 'chief-complaint',
                          title: 'Chief Complaint',
                          detail: activePatient.chiefComplaint,
                          extractedDate: 'Today',
                          verificationStatus: 'patient-reported',
                          confidence: 'high',
                          sources: [
                            {
                              id: 's-cc',
                              type: 'conversation-transcript',
                              title: 'Patient Voice Interview',
                              date: '10:12 AM Today',
                              snippetText: activePatient.chiefComplaint,
                              confidence: 'high',
                            },
                          ],
                        })
                      }
                    >
                      View Evidence
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-clinical bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 leading-relaxed">
                  “{activePatient.chiefComplaint}”
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-medium text-clinical-slate pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-clinical-muted block">Onset</span>
                    <strong className="text-slate-900">Yesterday ~10 AM</strong>
                  </div>
                  <div>
                    <span className="text-clinical-muted block">Severity</span>
                    <strong className="text-amber-800 font-bold">Moderate to Severe</strong>
                  </div>
                  <div>
                    <span className="text-clinical-muted block">Radiation</span>
                    <strong className="text-red-700 font-bold">Left Arm & Shoulder</strong>
                  </div>
                  <div>
                    <span className="text-clinical-muted block">Associated</span>
                    <strong className="text-slate-900">Sweating, Dyspnea</strong>
                  </div>
                </div>
              </Card>

              {/* History of Present Illness & Current Medicines */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Current Medications with Provenance */}
                <Card variant="default" padding="md" className="bg-white border-clinical-border shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-clinical-navy flex items-center gap-2">
                      <Pill className="w-4 h-4 text-brand-700" /> Current Medications
                    </h4>
                    <span className="text-xs font-bold text-slate-500">2 Reported</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-clinical bg-slate-50 border border-slate-200 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="font-extrabold text-slate-900">Metformin 500 mg</div>
                        <ProvenanceBadge type="patient-reported" />
                      </div>
                      <div className="text-[11px] text-clinical-muted flex items-center justify-between">
                        <span>Twice daily • Prescription Feb 2025</span>
                        <VerificationControl
                          factId="fact-metformin"
                          status={verifiedFactsState['fact-metformin'] || 'needs-verification'}
                          onVerify={verifyFact}
                          compact
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-clinical bg-slate-50 border border-slate-200 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="font-extrabold text-slate-900">Aspirin 75 mg</div>
                        <ProvenanceBadge type="doctor-verified" />
                      </div>
                      <div className="text-[11px] text-clinical-muted flex items-center justify-between">
                        <span>Once daily • EMR Record</span>
                        <VerificationControl
                          factId="fact-aspirin"
                          status={verifiedFactsState['fact-aspirin'] || 'doctor-verified'}
                          onVerify={verifyFact}
                          compact
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Critical Allergies */}
                <Card variant="default" padding="md" className="bg-white border-clinical-border shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-clinical-navy flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-600" /> Critical Allergies
                    </h4>
                    <ProvenanceBadge type="patient-reported" />
                  </div>

                  <div className="p-3 rounded-clinical bg-red-50/60 border border-red-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <strong className="text-red-950 font-extrabold text-sm">⚠ Penicillin Allergy</strong>
                      <VerificationControl
                        factId="fact-penicillin"
                        status={verifiedFactsState['fact-penicillin'] || 'needs-verification'}
                        onVerify={verifyFact}
                        compact
                      />
                    </div>
                    <p className="text-red-900 text-[11px]">
                      Patient reports severe cutaneous reaction (urticaria) in 2021.
                    </p>
                  </div>
                </Card>
              </div>

              {/* Lab Reports & Documents Preview */}
              <Card variant="default" padding="md" className="bg-white border-clinical-border shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-clinical-navy flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-700" /> Processed Records & Lab Values
                  </h4>
                  <Button variant="ghost" size="sm" onClick={() => handleTabChange('reports')}>
                    View All Records
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-clinical bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-extrabold text-slate-900">HbA1c Lab Report</div>
                      <div className="text-[11px] text-amber-800 font-bold">8.2% (Above reference 5.7%)</div>
                    </div>
                    <ProvenanceBadge type="document-derived" />
                  </div>

                  <div className="p-3 rounded-clinical bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-extrabold text-slate-900">Prescription_Feb2025.jpg</div>
                      <div className="text-[11px] text-emerald-800 font-bold">✓ OCR Extracted: Metformin 850mg</div>
                    </div>
                    <ProvenanceBadge type="ai-extracted" />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* TIMELINE TAB */}
          {activeTab === 'timeline' && (
            <Card variant="default" padding="lg" className="bg-white border-clinical-border shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-clinical-navy flex items-center gap-2">
                  <Clock className="w-5 h-5 text-brand-700" /> Medical History Timeline
                </h3>
                <span className="text-xs text-clinical-muted">
                  {realTimeline.length > 0 ? `${realTimeline.length} events logged` : 'Chronological record from intake & files'}
                </span>
              </div>

              <div className="relative border-l-2 border-brand-200 ml-4 pl-6 space-y-6 py-2 text-xs">
                {realTimeline.length > 0 ? (
                  realTimeline.map((tl, idx) => (
                    <div key={tl.id || idx} className="relative group">
                      <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-brand-700 ring-4 ring-white" />
                      <div className="font-extrabold text-sm text-slate-900">{tl.event_date || 'Past'}</div>
                      <div className="text-slate-800 font-bold mt-0.5">{tl.title}</div>
                      {tl.description && <div className="text-slate-600 mt-0.5">{tl.description}</div>}
                      <ProvenanceBadge
                        type={tl.source_type === 'DOCUMENT' ? 'document-derived' : 'patient-reported'}
                        className="mt-1"
                      />
                    </div>
                  ))
                ) : (
                  <>
                    <div className="relative group">
                      <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-brand-700 ring-4 ring-white" />
                      <div className="font-extrabold text-sm text-slate-900">Today, 2026</div>
                      <div className="text-slate-700 font-semibold mt-0.5">
                        OPD Visit — Acute Chest Pain Intake
                      </div>
                      <ProvenanceBadge type="patient-reported" className="mt-1" />
                    </div>

                    <div className="relative group">
                      <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-amber-500 ring-4 ring-white" />
                      <div className="font-extrabold text-sm text-slate-900">Feb 2025</div>
                      <div className="text-slate-700 font-semibold mt-0.5">
                        Prescription Update — Metformin 850 mg BD
                      </div>
                      <ProvenanceBadge type="document-derived" className="mt-1" />
                    </div>
                  </>
                )}
              </div>
            </Card>
          )}

          {/* MEDICATIONS TAB */}
          {activeTab === 'medications' && (
            <Card variant="default" padding="lg" className="bg-white border-clinical-border shadow-sm space-y-4">
              <h3 className="font-extrabold text-base text-clinical-navy flex items-center gap-2">
                <Pill className="w-5 h-5 text-brand-700" /> Structured Medication History
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100 font-bold uppercase text-clinical-muted border-b border-slate-200">
                      <th className="py-2.5 px-3">Medicine</th>
                      <th className="py-2.5 px-3">Dose</th>
                      <th className="py-2.5 px-3">Frequency</th>
                      <th className="py-2.5 px-3">Provenance</th>
                      <th className="py-2.5 px-3">Confidence</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    <tr>
                      <td className="py-3 px-3 font-extrabold text-slate-900">Metformin</td>
                      <td className="py-3 px-3 font-mono">500 mg / 850 mg</td>
                      <td className="py-3 px-3">Twice daily</td>
                      <td className="py-3 px-3">
                        <ProvenanceBadge type="ai-extracted" />
                      </td>
                      <td className="py-3 px-3">
                        <ConfidenceBadge level="medium" size="sm" />
                      </td>
                      <td className="py-3 px-3">
                        <VerificationControl
                          factId="fact-metformin"
                          status={verifiedFactsState['fact-metformin'] || 'needs-verification'}
                          onVerify={verifyFact}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* ALLERGIES TAB */}
          {activeTab === 'allergies' && (
            <Card variant="default" padding="lg" className="bg-white border-clinical-border shadow-sm space-y-4">
              <h3 className="font-extrabold text-base text-clinical-navy flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" /> Allergies & Adverse Reactions
              </h3>

              <div className="p-4 rounded-clinical bg-red-50/60 border border-red-200 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-600" />
                    <h4 className="font-extrabold text-sm text-red-950">Penicillin (Severe Rash)</h4>
                  </div>
                  <VerificationControl
                    factId="fact-penicillin"
                    status={verifiedFactsState['fact-penicillin'] || 'needs-verification'}
                    onVerify={verifyFact}
                  />
                </div>
                <ProvenanceBadge type="patient-reported" />
              </div>
            </Card>
          )}

          {/* REPORTS TAB */}
          {activeTab === 'reports' && (
            <Card variant="default" padding="lg" className="bg-white border-clinical-border shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-clinical-navy flex items-center gap-2">
                  <FileText className="w-5 h-5 text-brand-700" /> Uploaded Medical Records & Reports
                </h3>
                <span className="text-xs font-semibold text-clinical-muted">
                  {realDocs.length > 0 ? `${realDocs.length} Documents Processed` : '1 Document Sample'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {realDocs.length > 0 ? (
                  realDocs.map((doc) => (
                    <div key={doc.id} className="p-4 rounded-clinical bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-extrabold text-slate-900">{doc.file_name}</div>
                        <ProvenanceBadge type="document-derived" />
                      </div>
                      <div className="text-emerald-700 font-bold">
                        ✓ OCR Processed ({doc.extracted_facts_count || 0} facts extracted)
                      </div>
                      <div className="text-[11px] text-clinical-muted flex items-center gap-2">
                        <span>Type: {doc.document_type}</span>
                        <span>•</span>
                        <span>Status: {doc.processing_status}</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={`http://localhost:8000/api/v1/documents/${doc.id}/file`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 text-[11px] font-semibold rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                        >
                          View Document
                        </a>
                        <Button variant="outline" size="sm" onClick={() => handleOpenEvidence(mockMetforminFact)}>
                          Inspect Evidence
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-clinical bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-extrabold text-slate-900">Prescription_Feb2025.jpg</div>
                      <ProvenanceBadge type="document-derived" />
                    </div>
                    <div className="text-emerald-700 font-bold">✓ OCR Extracted: Metformin 850mg</div>
                    <Button variant="outline" size="sm" onClick={() => handleOpenEvidence(mockMetforminFact)}>
                      Inspect Document
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* EVIDENCE TAB */}
          {activeTab === 'evidence' && (
            <Card variant="default" padding="lg" className="bg-white border-clinical-border shadow-sm space-y-4">
              <h3 className="font-extrabold text-base text-clinical-navy flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-brand-700" /> Evidence Explorer
              </h3>

              <div className="space-y-3 text-xs">
                <div
                  onClick={() => handleOpenEvidence(mockMetforminFact)}
                  className="p-3.5 rounded-clinical bg-slate-50 border border-slate-200 hover:border-brand-500 cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="font-extrabold text-slate-900">Metformin 500 mg / 850 mg</div>
                    <div className="text-slate-500 mt-0.5">2 Evidence Sources (Voice + Prescription)</div>
                  </div>
                  <Button variant="ghost" size="sm" rightIcon={Eye}>
                    View Sources
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* AI REVIEW TAB */}
          {activeTab === 'ai-review' && (
            <Card variant="default" padding="lg" className="bg-white border-clinical-border shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-clinical-navy flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-700" /> AI-Assisted Fact Review & Verification
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-clinical bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-extrabold text-slate-900 text-sm">Metformin 500 mg BD</div>
                    <div className="text-slate-500 mt-0.5">Source: Patient Voice Interview</div>
                  </div>
                  <VerificationControl
                    factId="fact-metformin"
                    status={verifiedFactsState['fact-metformin'] || 'needs-verification'}
                    onVerify={verifyFact}
                    onReject={rejectFact}
                  />
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Secondary Context Column */}
        <div className="space-y-4">
          <Card variant="default" padding="md" className="bg-white border-clinical-border shadow-sm space-y-3">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-clinical-navy flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-brand-700" /> Clinical Visit Summary
            </h4>

            <div className="space-y-2 text-xs font-medium text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-clinical-muted">OPD Token</span>
                <strong className="font-mono text-slate-900">{activePatient.token}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-clinical-muted">Arrival Time</span>
                <strong>{activePatient.arrivalTime}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-clinical-muted">Wait Duration</span>
                <strong className="font-mono">{activePatient.waitTime}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-clinical-muted">Assigned Doctor</span>
                <strong className="text-brand-800">Dr. Ananya Sharma</strong>
              </div>
            </div>
          </Card>

          <Card variant="default" padding="md" className="bg-white border-clinical-border shadow-sm space-y-3">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-clinical-navy">Doctor Actions</h4>

            <div className="space-y-2">
              <Button
                variant="primary"
                size="md"
                fullWidth
                leftIcon={Stethoscope}
                onClick={handleStartConsultationClick}
                className="bg-brand-700 hover:bg-brand-800 text-white font-bold"
              >
                Start Consultation
              </Button>

              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={() => navigate(DOCTOR_ROUTES.QUEUE)}
              >
                Back to Queue
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Evidence Drawer Modal */}
      <EvidenceDrawer
        isOpen={isEvidenceOpen}
        onClose={() => setIsEvidenceOpen(false)}
        fact={selectedFact}
        onVerifyFact={(factId) => verifyFact(factId)}
      />

      {/* FHIR Export & Demo Interoperability Modal */}
      <Modal
        isOpen={isFhirModalOpen}
        onClose={() => setIsFhirModalOpen(false)}
        title="ABDM / HL7 FHIR Interoperability Hub (Demo Mode)"
        description="FHIR-compatible demo export & simulated health exchange submission"
        size="xl"
      >
        <div className="space-y-4 text-xs">
          {/* Prototype disclaimer */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-950 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block">Prototype Environment Notice</strong>
              This tool outputs a FHIR R4-compatible collection Bundle based on internally structured medical facts, OCR records, and patient stories. It is designed for prototype evaluation and does not claim certified government ABDM submission.
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={RefreshCw}
                onClick={handleGenerateFhir}
                disabled={isGeneratingFhir}
              >
                {isGeneratingFhir ? 'Generating Bundle...' : 'Regenerate FHIR Bundle'}
              </Button>
              {fhirBundle && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={Download}
                  onClick={handleDownloadFhirJson}
                >
                  Download JSON
                </Button>
              )}
            </div>

            <Button
              variant="primary"
              size="sm"
              leftIcon={Send}
              onClick={handleSimulateDemoSubmission}
              disabled={!fhirBundle || isSubmittingDemo}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              {isSubmittingDemo ? 'Submitting...' : 'Simulate Interoperability Submission'}
            </Button>
          </div>

          {/* Submission Result Notice */}
          {demoSubmitResult && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-emerald-950 space-y-1">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Simulated Interoperability Submission Accepted</span>
              </div>
              <div className="text-[11px] font-mono text-emerald-800">
                Reference ID: <strong>{demoSubmitResult.reference_id}</strong> • Mode: {demoSubmitResult.mode} • Status: {demoSubmitResult.status}
              </div>
              <p className="text-[10px] text-emerald-700 italic">
                {demoSubmitResult.message}
              </p>
            </div>
          )}

          {/* Validation & Resource Summary */}
          {fhirBundle && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Bundle Summary: {fhirBundle.entry?.length || 0} Resources</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200 text-[11px]">
                  ✓ Structural Validation Passed
                </span>
              </div>

              {/* JSON Viewer */}
              <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded max-h-[340px] overflow-y-auto leading-tight">
                {JSON.stringify(fhirBundle, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default DoctorPatientWorkspacePage;
