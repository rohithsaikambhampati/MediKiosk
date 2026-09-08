import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATIENT_ROUTES } from '../../constants/routes';
import { usePatientIntake } from '../../context/PatientIntakeContext';
import { PageContainer } from '../../components/common/containers/LayoutContainers';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Checkbox } from '../../components/common/Checkbox';
import { Modal } from '../../components/common/Modal';
import { Mic, FileText, Cpu, Building2, Link2, ShieldCheck, ArrowRight, ArrowLeft, Info, Lock, Volume2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export const PatientConsentPage: React.FC = () => {
  const navigate = useNavigate();
  const { consent, setConsent, accessibility, speak, t } = usePatientIntake();
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isDisagreeModalOpen, setIsDisagreeModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isMandatoryAgreed = consent.voice && consent.documents && consent.aiProcessing && consent.hospitalSharing;

  const handleListenConsent = () => {
    speak(
      "Before we begin: We will ask you questions about your symptoms and scan your medical documents. Your health information will only be shared with your attending doctor. Please tap I Agree to All to proceed.",
      true
    );
  };

  const handleToggleConsent = (key: keyof typeof consent) => {
    setConsent((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAgree = async () => {
    setIsSubmitting(true);
    try {
      const { ConsentApi } = await import('../../services/api/consentApi');
      const pid = 'patient-ramesh-01';
      await ConsentApi.createConsent({
        patient_id: pid,
        purpose: 'CLINICAL_INTAKE',
        scope: ['history', 'uploaded_documents', 'structured_facts', 'clinician_review'],
        language: 'en',
        consent_text_version: 'v1.0',
        consent_method: 'patient_ui',
        metadata: {
          voice_consent: consent.voice,
          document_consent: consent.documents,
          ai_processing_consent: consent.aiProcessing,
          hospital_sharing_consent: consent.hospitalSharing,
          abha_consent: consent.abhaLinking,
        },
      });
    } catch (err) {
      console.warn('Consent persistence notice:', err);
    } finally {
      setIsSubmitting(false);
      navigate(PATIENT_ROUTES.IDENTITY);
    }
  };

  return (
    <PageContainer
      title={t('consent.title')}
      subtitle={t('consent.subtitle')}
      maxWidth="md"
    >
      {/* Easy Mode Plain Language Voice Audio Banner */}
      {accessibility.easyMode && (
        <div className="p-4 rounded-2xl bg-amber-100 border-3 border-amber-600 mb-5 flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <Volume2 className="w-6 h-6 text-amber-900 shrink-0" />
            <div>
              <div className="font-black text-sm text-slate-950">Hear Plain-Language Consent</div>
              <div className="text-xs text-slate-800 font-medium">Listen to a 15-second simple explanation of how your data is used</div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleListenConsent}
            className="border-2 border-slate-900 bg-white hover:bg-slate-50 text-slate-950 font-black shrink-0"
          >
            Play Audio
          </Button>
        </div>
      )}

      {/* Plain Language Explanation Card */}
      <div className="p-4 rounded-clinical bg-slate-50 border border-slate-200 mb-5 space-y-2 text-xs text-slate-800">
        <h4 className="font-extrabold text-sm text-clinical-navy uppercase tracking-wider">
          How Your Health Data Is Handled
        </h4>
        <div className="space-y-1.5 leading-relaxed text-slate-700">
          <div className="flex items-start gap-2">
            <span className="font-bold text-brand-700">•</span>
            <span>We will collect the information you provide and organize it for your healthcare consultation.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-brand-700">•</span>
            <span>Uploaded documents may be processed to extract relevant medical information.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-brand-700">•</span>
            <span>The information will be shown to authorized healthcare staff.</span>
          </div>
        </div>
      </div>

      {/* Reassuring Clinical Decision Boundary Notice */}
      <div className="p-4 rounded-clinical bg-brand-50 border border-brand-200 mb-6 flex items-start gap-3">
        <ShieldCheck className="w-6 h-6 text-brand-700 shrink-0 mt-0.5" />
        <div className="text-xs text-brand-900 leading-relaxed">
          <strong className="font-extrabold block text-sm mb-0.5">{t('consent.doctorNoticeTitle')}</strong>
          {t('consent.doctorNoticeDesc')}
        </div>
      </div>

      {/* Permission Cards */}
      <div className="space-y-3 mb-6">
        {/* Voice Intake */}
        <Card
          variant="interactive"
          padding="md"
          onClick={() => handleToggleConsent('voice')}
          className={cn(
            'flex items-center justify-between gap-4 transition-all cursor-pointer select-none',
            consent.voice
              ? 'bg-emerald-50/70 border-2 border-emerald-600 shadow-xs'
              : 'bg-white border border-slate-300 hover:border-slate-400'
          )}
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'w-11 h-11 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                consent.voice ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-brand-700'
              )}
            >
              <Mic className="w-5.5 h-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg text-clinical-navy">{t('consent.voiceTitle')}</span>
                <span className="text-[10px] uppercase font-black text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                  {t('btn.required')}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-clinical-muted mt-0.5 font-medium">{t('consent.voiceDesc')}</p>
            </div>
          </div>
          <div className="shrink-0 pointer-events-none">
            <Checkbox
              checked={consent.voice}
              isKiosk={accessibility.easyMode}
              readOnly
            />
          </div>
        </Card>

        {/* Document Upload */}
        <Card
          variant="interactive"
          padding="md"
          onClick={() => handleToggleConsent('documents')}
          className={cn(
            'flex items-center justify-between gap-4 transition-all cursor-pointer select-none',
            consent.documents
              ? 'bg-emerald-50/70 border-2 border-emerald-600 shadow-xs'
              : 'bg-white border border-slate-300 hover:border-slate-400'
          )}
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'w-11 h-11 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                consent.documents ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-brand-700'
              )}
            >
              <FileText className="w-5.5 h-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg text-clinical-navy">{t('consent.docsTitle')}</span>
                <span className="text-[10px] uppercase font-black text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                  {t('btn.required')}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-clinical-muted mt-0.5 font-medium">{t('consent.docsDesc')}</p>
            </div>
          </div>
          <div className="shrink-0 pointer-events-none">
            <Checkbox
              checked={consent.documents}
              isKiosk={accessibility.easyMode}
              readOnly
            />
          </div>
        </Card>

        {/* AI Structuring */}
        <Card
          variant="interactive"
          padding="md"
          onClick={() => handleToggleConsent('aiProcessing')}
          className={cn(
            'flex items-center justify-between gap-4 transition-all cursor-pointer select-none',
            consent.aiProcessing
              ? 'bg-emerald-50/70 border-2 border-emerald-600 shadow-xs'
              : 'bg-white border border-slate-300 hover:border-slate-400'
          )}
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'w-11 h-11 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                consent.aiProcessing ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-brand-700'
              )}
            >
              <Cpu className="w-5.5 h-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg text-clinical-navy">{t('consent.aiTitle')}</span>
                <span className="text-[10px] uppercase font-black text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                  {t('btn.required')}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-clinical-muted mt-0.5 font-medium">{t('consent.aiDesc')}</p>
            </div>
          </div>
          <div className="shrink-0 pointer-events-none">
            <Checkbox
              checked={consent.aiProcessing}
              isKiosk={accessibility.easyMode}
              readOnly
            />
          </div>
        </Card>

        {/* Hospital Sharing */}
        <Card
          variant="interactive"
          padding="md"
          onClick={() => handleToggleConsent('hospitalSharing')}
          className={cn(
            'flex items-center justify-between gap-4 transition-all cursor-pointer select-none',
            consent.hospitalSharing
              ? 'bg-emerald-50/70 border-2 border-emerald-600 shadow-xs'
              : 'bg-white border border-slate-300 hover:border-slate-400'
          )}
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'w-11 h-11 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                consent.hospitalSharing ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-brand-700'
              )}
            >
              <Building2 className="w-5.5 h-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg text-clinical-navy">{t('consent.sharingTitle')}</span>
                <span className="text-[10px] uppercase font-black text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                  {t('btn.required')}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-clinical-muted mt-0.5 font-medium">{t('consent.sharingDesc')}</p>
            </div>
          </div>
          <div className="shrink-0 pointer-events-none">
            <Checkbox
              checked={consent.hospitalSharing}
              isKiosk={accessibility.easyMode}
              readOnly
            />
          </div>
        </Card>

        {/* ABHA Linking (Optional) */}
        <Card
          variant="interactive"
          padding="md"
          onClick={() => handleToggleConsent('abhaLinking')}
          className={cn(
            'flex items-center justify-between gap-4 transition-all cursor-pointer select-none',
            consent.abhaLinking
              ? 'bg-indigo-50/70 border-2 border-indigo-600 shadow-xs'
              : 'bg-white border border-slate-300 hover:border-slate-400'
          )}
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'w-11 h-11 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                consent.abhaLinking ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700'
              )}
            >
              <Link2 className="w-5.5 h-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg text-clinical-navy">{t('consent.abhaTitle')}</span>
                <span className="text-[10px] uppercase font-black text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                  {t('btn.optional')}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-clinical-muted mt-0.5 font-medium">{t('consent.abhaDesc')}</p>
            </div>
          </div>
          <div className="shrink-0 pointer-events-none">
            <Checkbox
              checked={consent.abhaLinking}
              isKiosk={accessibility.easyMode}
              readOnly
            />
          </div>
        </Card>
      </div>

      {/* Privacy Modal Trigger & Continue */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-clinical-border w-full">
        <Button
          variant="ghost"
          size="md"
          leftIcon={Info}
          onClick={() => setIsPrivacyModalOpen(true)}
          className="text-slate-600 font-semibold"
        >
          {t('consent.privacyBtn')}
        </Button>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap">
          <Button
            variant="outline"
            size="lg"
            leftIcon={ArrowLeft}
            onClick={() => navigate(PATIENT_ROUTES.ACCESSIBILITY)}
          >
            {t('btn.back', 'BACK')}
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => setIsDisagreeModalOpen(true)}
            className="text-red-700 hover:bg-red-50 hover:border-red-300"
          >
            I DO NOT AGREE
          </Button>

          {/* Easy Mode 1-Tap Agree Required Dominant Button */}
          {accessibility.easyMode && (
            <Button
              variant="primary"
              size="xl"
              fullWidth
              rightIcon={ArrowRight}
              onClick={() => {
                setConsent((prev) => ({
                  ...prev,
                  voice: true,
                  documents: true,
                  aiProcessing: true,
                  hospitalSharing: true,
                }));
                handleAgree();
              }}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-black text-lg sm:text-xl py-4 min-h-[64px] shadow-lg mb-2 order-first sm:order-none"
            >
              I AGREE & CONTINUE ➔
            </Button>
          )}

          <Button
            variant="kiosk"
            size="lg"
            disabled={!isMandatoryAgreed || isSubmitting}
            rightIcon={ArrowRight}
            onClick={handleAgree}
            className={cn(accessibility.easyMode && 'hidden')}
          >
            {isSubmitting ? 'Recording Consent...' : 'I AGREE'}
          </Button>
        </div>
      </div>

      {/* Disagree / In-Person Registration Fallback Modal */}
      <Modal
        isOpen={isDisagreeModalOpen}
        onClose={() => setIsDisagreeModalOpen(false)}
        title="Notice: In-Person Reception Desk Assistance"
        size="md"
      >
        <div className="space-y-4 text-xs text-clinical-slate leading-relaxed">
          <p>
            If you choose not to provide digital consent at this kiosk, your medical information will not be collected or processed by this terminal.
          </p>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded space-y-1 text-amber-950 font-medium">
            <div className="font-bold">Next Steps:</div>
            <div>• Please proceed to the Central Registration & Triage Desk (Counter #01).</div>
            <div>• Hospital intake staff will register your case manually using paper intake protocols.</div>
            <div>• No digital records or recordings will be retained from this kiosk session.</div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsDisagreeModalOpen(false)}>
              Return to Form
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(PATIENT_ROUTES.WELCOME)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Exit to Welcome Screen
            </Button>
          </div>
        </div>
      </Modal>

      {/* Privacy Details Modal */}
      <Modal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        title="MediKiosk Data Privacy & Safety Policy"
        size="md"
      >
        <div className="space-y-4 text-xs text-clinical-slate leading-relaxed">
          <p>
            MediKiosk processes patient data in compliance with hospital security standards and national health data policies (ABDM / DISHA).
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
            <div className="font-bold text-clinical-navy">Key Guarantees:</div>
            <div>• All audio recordings are processed solely for clinical transcript extraction.</div>
            <div>• Extracted facts are linked to source documents for doctor auditability.</div>
            <div>• Data is encrypted in transit and at rest.</div>
            <div>• Your attending doctor retains complete authority over medical decisions.</div>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default PatientConsentPage;
