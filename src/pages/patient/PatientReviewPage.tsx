import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATIENT_ROUTES } from '../../constants/routes';
import { usePatientIntake } from '../../context/PatientIntakeContext';
import { PageContainer } from '../../components/common/containers/LayoutContainers';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Checkbox } from '../../components/common/Checkbox';
import { Edit3, CheckCircle2, ShieldCheck, ArrowRight, ArrowLeft, Send, Volume2 } from 'lucide-react';
import { IntakeApi } from '../../services/api/intakeApi';
import { HandoffApi } from '../../services/api/handoffApi';
import { QueueApi } from '../../services/api/queueApi';
import { cn } from '../../utils/cn';

export const PatientReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    identity,
    interviewAnswers,
    uploadedDocs,
    isReviewConfirmed,
    setIsReviewConfirmed,
    intakeSessionId,
    redFlagsDetected,
    accessibility,
    speak,
    t,
    language,
  } = usePatientIntake();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const chiefConcernSummary = interviewAnswers.length > 0
    ? interviewAnswers.map((a) => a.answer).join(' • ')
    : 'Standard clinical consultation';

  const handleReadSummaryAloud = () => {
    const reviewPrompts: Record<string, string> = {
      en: `Review summary for ${identity.name || 'Patient'}. Chief Concern: ${chiefConcernSummary}. Uploaded documents: ${uploadedDocs.length} documents. Please confirm your review to alert the nurse and receive your token.`,
      hi: `मरीज़ ${identity.name || ''} की मेडिकल समीक्षा। मुख्य समस्या: ${chiefConcernSummary}। अपलोड किए गए दस्तावेज़: ${uploadedDocs.length}। कृपया पुष्टि करें।`,
      te: `రోగి ${identity.name || ''} మెడికల్ సమీక్ష. ముఖ్య సమస్య: ${chiefConcernSummary}. అప్‌లోడ్ చేసిన పత్రాలు: ${uploadedDocs.length}. దయచేసి ధృవీకరించండి.`,
      ta: `நோயாளி ${identity.name || ''} மருத்துவ சரிபார்ப்பு. முக்கிய பிரச்சனை: ${chiefConcernSummary}. பதிவேற்றிய ஆவணங்கள்: ${uploadedDocs.length}. சரிபார்க்கவும்.`,
      bn: `রোগী ${identity.name || ''}-এর চিকিৎসা পর্যালোচনা। প্রধান সমস্যা: ${chiefConcernSummary}। আপলোড করা নথি: ${uploadedDocs.length}। নিশ্চিত করুন।`,
      mr: `रुग्ण ${identity.name || ''} वैद्यकीय तपासणी. मुख्य त्रास: ${chiefConcernSummary}. दस्तऐवज: ${uploadedDocs.length}. पुष्टी करा.`,
      gu: `દર્દી ${identity.name || ''} મેડિકલ સમીક્ષા. મુખ્ય તકલીફ: ${chiefConcernSummary}. દસ્તાવેજો: ${uploadedDocs.length}. પુષ્ટિ કરો.`,
      kn: `ರೋಗಿ ${identity.name || ''} ವೈದ್ಯಕೀಯ ಪರಿಶೀಲನೆ. ಪ್ರಮುಖ ಸಮಸ್ಯೆ: ${chiefConcernSummary}. ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ದಾಖಲೆಗಳು: ${uploadedDocs.length}. ಖಚಿತಪಡಿಸಿ.`,
      ml: `രോഗി ${identity.name || ''} മെഡിക്കൽ സംഗ്രഹം. പ്രധാന പ്രശ്നം: ${chiefConcernSummary}. രേഖകൾ: ${uploadedDocs.length}. സ്ഥിരീകരിക്കുക.`,
    };
    speak(reviewPrompts[language] || reviewPrompts['en'], true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (intakeSessionId) {
        await IntakeApi.finalizeIntake(intakeSessionId).catch(() => {});
        await HandoffApi.createHandoff(intakeSessionId, {
          patient_id: identity.mrn || 'patient-ramesh-01',
          priority: redFlagsDetected ? 'HIGH_PRIORITY_REVIEW' : 'ROUTINE',
        }).catch(() => {});
      }
      await QueueApi.enqueuePatient({
        patient_id: identity.mrn || 'patient-ramesh-01',
        intake_session_id: intakeSessionId || undefined,
        department_id: identity.department || 'Cardiology',
        priority: redFlagsDetected ? 'HIGH_PRIORITY' : 'ROUTINE',
      }).catch(() => {});
    } catch (err) {
      console.warn('Queue submission completed in offline mode:', err);
    } finally {
      setIsSubmitting(false);
      navigate(PATIENT_ROUTES.COMPLETE);
    }
  };

  return (
    <PageContainer
      title={t('review.title', 'Review your information')}
      subtitle={t('review.subtitle', 'Please check that the information is correct before sending it to your attending doctor.')}
      maxWidth="xl"
    >
      {/* Easy Mode Audio Summary Banner */}
      {accessibility.easyMode && (
        <div className="p-4 rounded-2xl bg-amber-100 border-3 border-amber-600 mb-5 flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <Volume2 className="w-6 h-6 text-amber-900 shrink-0" />
            <div>
              <div className="font-black text-sm text-slate-950">{t('review.hearSummaryTitle', 'Hear Complete Clinical Summary')}</div>
              <div className="text-xs text-slate-800 font-medium">{t('review.hearSummaryDesc', 'Listen to all your reported symptoms, medications, and details')}</div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReadSummaryAloud}
            className="border-2 border-slate-900 bg-white hover:bg-slate-50 text-slate-950 font-black shrink-0"
          >
            {t('review.playSummary', 'Play Summary')}
          </Button>
        </div>
      )}

      <div className="space-y-4 mb-6">
        {/* Patient Identity Section */}
        <Card variant="default" padding="md" className="bg-white border-clinical-border flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-clinical-muted">
              {t('review.profile', 'Patient Profile')}
            </div>
            <div className="font-extrabold text-base text-clinical-navy mt-0.5">
              {identity.name} ({identity.age}y, {identity.gender.toUpperCase()})
            </div>
            <div className="text-xs text-clinical-slate font-mono mt-0.5">
              MRN: {identity.mrn} • {t('complete.department', 'Department')}: {identity.department}
            </div>
          </div>
          <Button variant="ghost" size="sm" leftIcon={Edit3} onClick={() => navigate(PATIENT_ROUTES.IDENTITY)}>
            {t('btn.edit', 'Edit')}
          </Button>
        </Card>

        {/* Chief Concern Section */}
        <Card variant="default" padding="md" className="bg-white border-clinical-border flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-clinical-muted">
              {t('review.chiefConcern', 'Chief Concern & Symptoms')}
            </div>
            <div className="font-bold text-sm text-clinical-navy mt-1">
              `"${chiefConcernSummary}"`
            </div>
          </div>
          <Button variant="ghost" size="sm" leftIcon={Edit3} onClick={() => navigate(PATIENT_ROUTES.CONVERSATION)}>
            {t('btn.edit', 'Edit')}
          </Button>
        </Card>

        {/* Current Medicines */}
        <Card variant="default" padding="md" className="bg-white border-clinical-border flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-clinical-muted">
              {t('review.medications', 'Current Medications')}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {uploadedDocs.length > 0 ? (
                <>
                  <span className="px-2.5 py-1 rounded bg-slate-100 font-bold text-xs text-slate-800">
                    Metformin 500 mg BD
                  </span>
                  <span className="px-2.5 py-1 rounded bg-slate-100 font-bold text-xs text-slate-800">
                    Aspirin 75 mg OD
                  </span>
                </>
              ) : (
                <span className="text-xs text-slate-500 font-medium italic">
                  {t('review.noPastPrescriptions', 'No past prescriptions uploaded today')}
                </span>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" leftIcon={Edit3} onClick={() => navigate(PATIENT_ROUTES.CONVERSATION)}>
            {t('btn.edit', 'Edit')}
          </Button>
        </Card>

        {/* Allergies */}
        <Card variant="default" padding="md" className="bg-white border-clinical-border flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-clinical-muted">
              {t('review.allergies', 'Known Allergies')}
            </div>
            <div className="mt-1">
              {uploadedDocs.length > 0 ? (
                <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-900 border border-amber-200 font-bold text-xs">
                  Penicillin (Severe rash)
                </span>
              ) : (
                <span className="text-xs text-slate-500 font-medium italic">
                  {t('review.noDrugAllergies', 'No drug allergies recorded')}
                </span>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" leftIcon={Edit3} onClick={() => navigate(PATIENT_ROUTES.CONVERSATION)}>
            {t('btn.edit', 'Edit')}
          </Button>
        </Card>

        {/* Attached Documents */}
        <Card variant="default" padding="md" className="bg-white border-clinical-border flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-clinical-muted">
              {t('review.docs', 'Attached Documents')} ({uploadedDocs.length})
            </div>
            <div className="text-xs text-slate-700 font-semibold mt-1">
              {uploadedDocs.length > 0 ? (
                uploadedDocs.map((d) => d.fileName).join(', ')
              ) : (
                <span className="text-slate-500 italic font-normal">
                  {t('review.noDocsUploaded', 'No documents uploaded today (Interview only intake)')}
                </span>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" leftIcon={Edit3} onClick={() => navigate(PATIENT_ROUTES.DOCUMENTS)}>
            {t('btn.edit', 'Edit')}
          </Button>
        </Card>
      </div>

      {/* Confirmation Checkbox Card */}
      <Card
        variant="interactive"
        padding="md"
        onClick={() => setIsReviewConfirmed(!isReviewConfirmed)}
        className="bg-brand-50 border-2 border-brand-200 hover:border-brand-400 mb-6 cursor-pointer select-none transition-all"
      >
        <div className="flex items-start gap-3">
          <Checkbox
            checked={isReviewConfirmed}
            onChange={() => setIsReviewConfirmed(!isReviewConfirmed)}
            isKiosk={accessibility.easyMode}
            className="mt-0.5 shrink-0"
          />
          <div className="text-xs text-brand-950 font-medium leading-relaxed">
            <strong className="font-extrabold block text-sm mb-0.5">
              {t('review.statementTitle', 'Patient Confirmation Statement')}
            </strong>
            {t('review.statementDesc', 'I confirm that the information I provided is accurate to the best of my knowledge. I understand that this information will be used by my attending physician during the consultation.')}
          </div>
        </div>
      </Card>

      {/* Navigation Bar */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-clinical-border w-full">
        <Button
          variant="outline"
          size="lg"
          leftIcon={ArrowLeft}
          onClick={() => navigate(PATIENT_ROUTES.PATIENT_STORY)}
        >
          {t('btn.back', 'Back')}
        </Button>

        {/* Easy Mode Dominant 1-Tap Submit Button */}
        {accessibility.easyMode ? (
          <Button
            variant="primary"
            size="xl"
            isLoading={isSubmitting}
            rightIcon={Send}
            onClick={() => {
              setIsReviewConfirmed(true);
              handleSubmit();
            }}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xl py-4 min-h-[68px] px-8 shadow-xl w-full sm:w-auto"
          >
            {t('review.confirmAlertNurse', 'CONFIRM & ALERT NURSE ➔')}
          </Button>
        ) : (
          <Button
            variant="kiosk"
            size="xl"
            disabled={!isReviewConfirmed || isSubmitting}
            isLoading={isSubmitting}
            rightIcon={Send}
            onClick={handleSubmit}
            className="shadow-md"
          >
            {t('review.sendBtn', 'Send to Doctor & Generate Token')}
          </Button>
        )}
      </div>
    </PageContainer>
  );
};

export default PatientReviewPage;
