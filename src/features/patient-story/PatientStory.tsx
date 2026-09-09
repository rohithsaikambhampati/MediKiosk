import { usePatientIntake } from '../../context/PatientIntakeContext';
import React, { useState } from 'react';
import { PatientStory as PatientStoryType } from '../../types/story';
import { MedicalFact } from '../../types/evidence';
import { Card } from '../../components/common/Card';
import { RiskBadge } from '../risk/RiskBadge';
import { ConfidenceBadge } from '../confidence/ConfidenceBadge';
import { EvidenceCard } from '../evidence/EvidenceCard';
import { Timeline } from '../timeline/Timeline';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { CheckCircle2, FileText, AlertTriangle, Pill, Activity, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface PatientStoryProps {
  story: PatientStoryType;
  onOpenEvidence?: (fact: MedicalFact) => void;
  onVerifyAll?: () => void;
  className?: string;
}

export const PatientStory: React.FC<PatientStoryProps> = ({
  story,
  onOpenEvidence,
  onVerifyAll,
  className,
}) => {
  const { t } = usePatientIntake();
  const [activeTab, setActiveTab] = useState<'summary' | 'meds' | 'timeline' | 'conflicts'>('summary');

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Patient Story Header & AI Synthesis Summary */}
      <Card variant="default" padding="lg" className="border-brand-200 bg-gradient-to-br from-white to-brand-50/20 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-clinical-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-700" />
            <h2 className="text-xl font-bold text-clinical-navy">{t('story.title', 'Evidence-Linked Patient Story')}</h2>
          </div>

          <div className="flex items-center gap-3">
            <ConfidenceBadge level={story.overallAiConfidence} showScore score={0.94} />
            <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-100 text-brand-900 border border-brand-200">
              {story.verificationProgress.verifiedFacts} / {story.verificationProgress.totalFacts} {t('story.verified', 'Verified')}
            </div>
          </div>
        </div>

        {/* Narrative Paragraph */}
        <p className="text-sm sm:text-base leading-relaxed text-clinical-slate mt-4 italic bg-white p-4 rounded-clinical border border-clinical-border shadow-subtle">
          "{story.summaryParagraph}"
        </p>

        {/* Chief Complaint Highlight Bar */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3 rounded-clinical bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-clinical-muted block">{t('convo.mainComplaint', 'Chief Complaint')}</span>
            <span className="text-sm font-bold text-clinical-navy">{story.chiefComplaint}</span>
          </div>
          <div className="p-3 rounded-clinical bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-clinical-muted block">{t('convo.durationOnset', 'Onset & Duration')}</span>
            <span className="text-sm font-semibold text-clinical-navy">{story.onsetAndDuration}</span>
          </div>
          <div className="p-3 rounded-clinical bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-clinical-muted block">{t('story.painSeverity', 'Pain / Severity')}</span>
            <span className="text-sm font-semibold text-red-700">{story.severityScore}</span>
          </div>
        </div>
      </Card>

      {/* Structured Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Reported Symptoms & Clinical Facts (Left Column) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-clinical-slate flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-700" />
              <span>{t('story.extractedSymptoms', 'Extracted Symptoms & Clinical Facts')}</span>
            </h3>
            {story.verificationProgress.unverifiedFacts > 0 && (
              <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {story.verificationProgress.unverifiedFacts} {t('story.needsReview', 'Needs Review')}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {story.reportedSymptoms.map((fact) => (
              <EvidenceCard
                key={fact.id}
                fact={fact}
                onOpenEvidenceDrawer={onOpenEvidence}
              />
            ))}
          </div>
        </div>

        {/* Medications, Allergies & Conflicts (Right Column) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Detected Conflicts Alert */}
          {story.detectedConflicts.length > 0 && (
            <Card variant="urgent" padding="md" className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <h4 className="font-bold text-sm">{t('story.conflictsDetected', `Clinical Conflicts Detected (${story.detectedConflicts.length})`, { count: story.detectedConflicts.length })}</h4>
              </div>

              {story.detectedConflicts.map((c) => (
                <div key={c.id} className="p-3 rounded bg-white border border-red-200 text-xs flex flex-col gap-1.5 shadow-subtle">
                  <span className="font-bold text-red-900">{c.title}</span>
                  <p className="text-slate-700">{c.description}</p>
                  <div className="flex items-center gap-2 mt-1 font-mono text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded">
                    <span>A: {c.itemA}</span>
                    <span>vs</span>
                    <span>B: {c.itemB}</span>
                  </div>
                </div>
              ))}
            </Card>
          )}

          {/* Current Medications */}
          <Card variant="default" padding="md" className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-clinical-slate flex items-center gap-2">
              <Pill className="w-4 h-4 text-brand-700" />
              <span>{t('story.currentMedications', `Current Medications (${story.currentMedications.length})`, { count: story.currentMedications.length })}</span>
            </h4>

            <div className="divide-y divide-clinical-border">
              {story.currentMedications.map((med) => (
                <div key={med.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-clinical-navy">{med.name} {med.dosage}</div>
                    <div className="text-clinical-muted">{med.frequency}</div>
                  </div>
                  <StatusBadge status={med.verificationStatus === 'doctor-verified' ? 'verified' : 'needs-verification'} size="sm" />
                </div>
              ))}
            </div>
          </Card>

          {/* Allergies */}
          <Card variant="default" padding="md" className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-clinical-slate flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>{t('story.allergies', `Allergies (${story.allergies.length})`, { count: story.allergies.length })}</span>
            </h4>

            <div className="flex flex-col gap-2">
              {story.allergies.map((alg) => (
                <div key={alg.id} className="p-2.5 rounded bg-red-50/50 border border-red-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-red-950">{alg.allergen}</span>
                    <span className="text-red-800 ml-2">• {t('story.reaction', 'Reaction:')} {alg.reaction}</span>
                  </div>
                  <RiskBadge level={alg.severity} size="sm" />
                </div>
              ))}
            </div>
          </Card>

          {/* Document-Extracted Lab Findings */}
          {story.abnormalLabs && story.abnormalLabs.length > 0 && (
            <Card variant="default" padding="md" className="flex flex-col gap-3 border-amber-200 bg-amber-50/20">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-700" />
                  <span>{t('story.documentLabValues', `Document Lab Values (${story.abnormalLabs.length})`, { count: story.abnormalLabs.length })}</span>
                </h4>
                <span className="text-[10px] font-bold uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                  {t('story.advisoryNotice', 'Advisory Notice')}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {story.abnormalLabs.map((lab) => (
                  <div key={lab.id} className="p-2.5 rounded bg-white border border-amber-200 flex flex-col gap-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{lab.testName}</span>
                      <span className="font-bold text-amber-900 font-mono">
                        {lab.resultValue} {lab.unit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-clinical-muted">
                      <span>{t('story.ref', 'Ref:')} {lab.referenceRange || t('story.refNotAvailable', 'Reference range not available')}</span>
                      <span>{lab.date}</span>
                    </div>
                    <p className="text-[10px] text-amber-800 italic mt-0.5">
                      {t('story.labNotice', 'Lab value outside displayed reference range — clinician review recommended.')}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Timeline Section */}
      <Card variant="default" padding="lg">
        <h3 className="text-sm font-bold uppercase tracking-wider text-clinical-slate mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand-700" />
          <span>{t('story.timelineEvents', `Longitudinal Medical Timeline (${story.medicalTimeline.length} events)`, { count: story.medicalTimeline.length })}</span>
        </h3>
        <Timeline events={story.medicalTimeline} />
      </Card>
    </div>
  );
};
