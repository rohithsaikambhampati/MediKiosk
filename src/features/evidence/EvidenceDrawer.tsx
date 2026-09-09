import React, { useState } from 'react';
import { Drawer } from '../../components/common/Drawer';
import { MedicalFact } from '../../types/evidence';
import { ConfidenceBadge } from '../confidence/ConfidenceBadge';
import { Button } from '../../components/common/Button';
import { Textarea } from '../../components/common/Textarea';
import { ProvenanceBadge } from '../../components/doctor/ProvenanceBadge';
import { CheckCircle2, XCircle, FileText, MessageSquare, ArrowRight, ShieldCheck, UserCheck, CornerDownRight, Sparkles, Lock } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  fact: MedicalFact | null;
  onVerifyFact?: (factId: string, doctorNotes: string) => void;
  onRejectFact?: (factId: string, doctorNotes: string) => void;
  isDoctorView?: boolean;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  isOpen,
  onClose,
  fact,
  onVerifyFact,
  onRejectFact,
  isDoctorView = false,
}) => {
  const [doctorNotes, setDoctorNotes] = useState('');

  if (!fact) return null;

  const handleVerify = () => {
    if (onVerifyFact) {
      onVerifyFact(fact.id, doctorNotes);
    }
    onClose();
  };

  const handleReject = () => {
    if (onRejectFact) {
      onRejectFact(fact.id, doctorNotes);
    }
    onClose();
  };

  const isDoctorVerified = fact.verificationStatus === 'doctor-verified';
  const isConfirmed = fact.verificationStatus === 'doctor-verified';
  const isRejected = fact.verificationStatus === 'rejected' || fact.verificationStatus === 'disputed';
  const isDecided = isConfirmed || isRejected;

  const hasDocSource = fact.sources.some((s) => s.type === 'uploaded-document');
  const hasVoiceSource = fact.sources.some((s) => s.type === 'conversation-transcript' || s.type === 'patient-self-report');

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Evidence Traceability & Provenance"
      subtitle={`Source verification for: ${fact.title}`}
      width="lg"
      footer={
        isDoctorView ? (
          <div className="w-full flex items-center justify-between gap-3">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={XCircle}
                onClick={handleReject}
                className="text-red-700 hover:bg-red-50 hover:border-red-200"
              >
                Reject Fact
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={CheckCircle2}
                onClick={handleVerify}
                className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
              >
                Verify & Approve
              </Button>
            </div>
          </div>
        ) : isDecided ? (
          <div className="w-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {isConfirmed ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Response Recorded: Confirmed</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300 shadow-xs">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Response Recorded: Incorrect / Disputed</span>
                </span>
              )}
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={onClose}
              className="px-6 font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
            >
              Close
            </Button>
          </div>
        ) : (
          <div className="w-full flex items-center justify-between gap-3">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={XCircle}
                onClick={handleReject}
                className="text-rose-700 border-rose-300 hover:bg-rose-50 font-bold"
              >
                Reject / Incorrect
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={CheckCircle2}
                onClick={handleVerify}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
              >
                Accept & Confirm
              </Button>
            </div>
          </div>
        )
      }
    >
      <div className="flex flex-col gap-6 text-xs">
        {/* If patient already decided, show prominent locked banner */}
        {!isDoctorView && isDecided && (
          <div
            className={cn(
              'p-3.5 rounded-clinical border flex items-center justify-between gap-3 shadow-xs',
              isConfirmed ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'
            )}
          >
            <div className="flex items-center gap-2.5">
              {isConfirmed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <div>
                <div className="font-extrabold text-xs">
                  {isConfirmed ? 'You Accepted & Confirmed This Information' : 'You Flagged This Information as Incorrect'}
                </div>
                <div className="text-[11px] opacity-90 mt-0.5">
                  {isConfirmed
                    ? 'Your confirmation is permanently recorded for the doctor. This is a one-time decision and cannot be modified.'
                    : 'Your dispute is permanently recorded for the doctor. This is a one-time decision and cannot be modified.'}
                </div>
              </div>
            </div>
            <span
              className={cn(
                'text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider shrink-0 border flex items-center gap-1',
                isConfirmed
                  ? 'bg-emerald-200 text-emerald-900 border-emerald-300'
                  : 'bg-rose-200 text-rose-900 border-rose-300'
              )}
            >
              <Lock className="w-3 h-3" />
              <span>Final</span>
            </span>
          </div>
        )}

        {/* Fact Header Block */}
        <div className="p-4 rounded-clinical bg-slate-50 border border-clinical-border flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
              Fact Under Review
            </span>
            {isDoctorView ? (
              <ProvenanceBadge type={isDoctorVerified ? 'doctor-verified' : 'ai-extracted'} />
            ) : isConfirmed ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Confirmed by You</span>
              </span>
            ) : isRejected ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
                <XCircle className="w-3.5 h-3.5 text-rose-700" />
                <span>Disputed by You</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>Needs Review</span>
              </span>
            )}
          </div>
          <h3 className="text-base font-extrabold text-clinical-navy">{fact.title}</h3>
          <p className="text-xs text-clinical-slate font-medium">{fact.detail}</p>
        </div>

        {/* 1. HOW THIS INFORMATION WAS FOUND */}
        <div className="space-y-2">
          <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand-700" />
            <span>1. How This Information Was Found</span>
          </h4>

          <div className="p-3 rounded-clinical bg-brand-50/60 border border-brand-200 flex items-center justify-between gap-2 text-slate-800 font-semibold">
            {hasDocSource && hasVoiceSource ? (
              <>
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Patient Voice Intake</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>AI Entity Extraction</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-brand-700" />
                  <span>Document OCR Evidence</span>
                </div>
              </>
            ) : hasDocSource ? (
              <>
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Uploaded Document</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-700" />
                  <span>OCR & Clinical Entity Extraction</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Evidence Linked</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Patient Voice Intake</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Speech Recognition & Entity Extraction</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Voice-Verified Fact</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 2. SOURCE DOCUMENT & SNIPPETS */}
        <div className="space-y-2">
          <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-700 flex items-center gap-1.5">
            {hasDocSource ? (
              <FileText className="w-4 h-4 text-brand-700" />
            ) : (
              <MessageSquare className="w-4 h-4 text-emerald-700" />
            )}
            <span>2. {hasDocSource ? 'Source Documents & Transcripts' : 'Source Voice Transcripts'} ({fact.sources.length})</span>
          </h4>

          <div className="space-y-3">
            {fact.sources.map((src) => (
              <div
                key={src.id}
                className="p-3.5 rounded-clinical border border-clinical-border bg-white space-y-2 shadow-subtle"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    {src.type === 'uploaded-document' ? (
                      <FileText className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                    )}
                    <span className="font-extrabold text-slate-900">{src.title}</span>
                    {src.documentPage && (
                      <span className="text-[10px] font-bold text-indigo-800 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                        Page {src.documentPage}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">{src.date}</span>
                </div>

                <div className="p-3 rounded bg-amber-50/70 border border-amber-200 text-amber-950 font-mono flex items-start gap-2">
                  <CornerDownRight className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-900 text-[10px] block uppercase mb-0.5">
                      Extracted Snippet:
                    </span>
                    "{src.snippetText}"
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. AI CONFIDENCE & 4. VERIFICATION STATUS */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-clinical bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 block">3. AI Confidence</span>
            <ConfidenceBadge level={fact.confidence} showScore score={0.94} size="md" />
          </div>

          <div className="p-3 rounded-clinical bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 block">4. Verification Status</span>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold border',
                isConfirmed
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : isRejected
                  ? 'bg-rose-100 text-rose-900 border-rose-300'
                  : 'bg-amber-100 text-amber-900 border-amber-300'
              )}
            >
              {isConfirmed ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              ) : isRejected ? (
                <XCircle className="w-3.5 h-3.5 text-rose-700" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              )}
              <span className="capitalize">
                {isConfirmed
                  ? (!isDoctorView ? 'Confirmed / Accepted (Final)' : 'Doctor Verified')
                  : isRejected
                  ? (!isDoctorView ? 'Rejected / Disputed (Final)' : 'Rejected')
                  : 'Needs Verification'}
              </span>
            </span>
          </div>
        </div>

        {/* Doctor Verification Notes Input (Doctor Workspace only) */}
        {isDoctorView && (
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <label className="font-extrabold text-slate-800 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-brand-700" />
              <span>Doctor Observations / Audit Notes</span>
            </label>
            <Textarea
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="Add clinical notes or verify rationale..."
              rows={3}
            />
          </div>
        )}
      </div>
    </Drawer>
  );
};
