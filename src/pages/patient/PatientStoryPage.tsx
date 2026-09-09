import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATIENT_ROUTES } from '../../constants/routes';
import { usePatientIntake } from '../../context/PatientIntakeContext';
import { PageContainer } from '../../components/common/containers/LayoutContainers';
import { PatientStory } from '../../features/patient-story/PatientStory';
import { EvidenceDrawer } from '../../features/evidence/EvidenceDrawer';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { MedicalFact } from '../../types/evidence';
import { AlertTriangle, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { cn } from '../../utils/cn';

export const PatientStoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { patientStory, factVerificationOverrides, uploadedDocs, updateStoryFactVerification, accessibility, speak, stopSpeaking, t, language } = usePatientIntake();
  const hasDocs = uploadedDocs.length > 0;
  const [selectedFact, setSelectedFact] = useState<MedicalFact | null>(null);
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);

  React.useEffect(() => {
    if (accessibility.voiceGuidance || accessibility.easyMode) {
      const timer = setTimeout(() => {
        const storyPrompts: Record<string, string> = {
          en: 'Here is your structured clinical timeline and summary. You can review what has been recorded, or continue to final review.',
          hi: 'यहाँ आपका मेडिकल टाइमलाइन और सारांश है। आप दर्ज की गई जानकारी की समीक्षा कर सकते हैं या अंतिम समीक्षा पर जा सकते हैं।',
          te: 'ఇది మీ మెడికల్ టైమ్‌లైన్ మరియు సారాంశం. మీరు నమోదైన వివరాలను సమీక్షించవచ్చు లేదా చివరి సమీక్షకు వెళ్లవచ్చు.',
          ta: 'இது உங்கள் மருத்துவக் காலக்கோடு மற்றும் சுருக்கம். பதிவான விவரங்களை நீங்கள் சரிபார்க்கலாம்.',
          bn: 'এখানে আপনার মেডিকেল টাইমলাইন ও সারসংক্ষেপ রয়েছে। আপনি রেকর্ডকৃত তথ্য পর্যালোচনা করতে পারেন।',
          mr: 'येथे तुमची वैद्यकीय टाइमलाइन आणि सारांश आहे. तुम्ही नोंदवलेली माहिती तपासू शकता.',
          gu: 'અહીં તમારી મેડિકલ ટાઇમલાઇન અને સારાંશ છે. તમે નોંધાયેલી વિગતો ચકાસી શકો છો.',
          kn: 'ಇಲ್ಲಿ ನಿಮ್ಮ ವೈದ್ಯಕೀಯ ವೇಳಾಪಟ್ಟಿ ಮತ್ತು ಸಾರಾಂಶವಿದೆ. ನೀವು ದಾಖಲಾದ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಬಹುದು.',
          ml: 'ഇവിടെ നിങ്ങളുടെ മെഡിക്കൽ ടൈംലൈനും സംഗ്രഹവും കാണാം. വിവരങ്ങൾ പരിശോധിക്കാവുന്നതാണ്.',
        };
        speak(storyPrompts[language] || storyPrompts['en']);
      }, 400);
      return () => {
        clearTimeout(timer);
        stopSpeaking();
      };
    }
  }, [accessibility.voiceGuidance, accessibility.easyMode, speak, stopSpeaking, language]);

  const handleOpenEvidence = (fact: MedicalFact) => {
    const fromStory = patientStory.reportedSymptoms.find((f) => f.id === fact.id);
    const effectiveStatus = factVerificationOverrides[fact.id] || fromStory?.verificationStatus || fact.verificationStatus;
    const latestFact: MedicalFact = {
      ...(fromStory || fact),
      verificationStatus: effectiveStatus,
    };
    setSelectedFact(latestFact);
    setIsEvidenceOpen(true);
  };

  const handleVerifyFact = (factId: string) => {
    updateStoryFactVerification(factId, 'doctor-verified');
    setSelectedFact((prev) => (prev && prev.id === factId ? { ...prev, verificationStatus: 'doctor-verified' } : prev));
  };

  const handleRejectFact = (factId: string) => {
    updateStoryFactVerification(factId, 'rejected');
    setSelectedFact((prev) => (prev && prev.id === factId ? { ...prev, verificationStatus: 'rejected' } : prev));
  };

  return (
    <PageContainer
      title={t('story.title')}
      subtitle={t('story.subtitle')}
      maxWidth="2xl"
    >
      {/* Reassuring Banner */}
      <div className="p-4 rounded-clinical bg-brand-50 border border-brand-200 mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-brand-700 shrink-0" />
          <div className="text-xs text-brand-900">
            <strong className="font-extrabold text-sm block">
              {hasDocs ? t('story.evidenceBannerTitle', 'Evidence-Linked Patient Record') : t('story.interviewBannerTitle', 'Interview-Verified Patient Intake')}
            </strong>
            {hasDocs
              ? t('story.evidenceBannerDesc', 'Every extracted medicine, symptom, and diagnosis is linked directly to source documents or your voice response.')
              : t('story.interviewBannerDesc', 'Every reported symptom, duration, and clinical detail is linked directly to your interview response.')}
          </div>
        </div>
      </div>

      {/* Easy Mode Audio Story Banner */}
      {accessibility.easyMode && (
        <div className="p-4 rounded-clinical bg-amber-100/90 border-2 border-amber-500 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔊</span>
            <div>
              <div className="font-extrabold text-sm text-slate-950">
                {t('story.audioOverviewTitle', 'Audio Overview of Your Records')}
              </div>
              <div className="text-xs text-slate-700">
                {t('story.audioOverviewDesc', 'Tap the button to listen to all identified symptoms, medications, and conditions read aloud.')}
              </div>
            </div>
          </div>
          <Button
            variant="kiosk"
            size="md"
            onClick={() => {
              const summary = language === 'te'
                ? `క్లినికల్ సారాంశం. ప్రధాన సమస్య: ${patientStory.chiefComplaint}. ప్రారంభ సమయం: ${patientStory.onsetAndDuration}. పూర్తి వివరాలు: ${patientStory.summaryParagraph}`
                : language === 'hi'
                ? `क्लिनिकल सारांश। मुख्य समस्या: ${patientStory.chiefComplaint}। अवधि: ${patientStory.onsetAndDuration}। विवरण: ${patientStory.summaryParagraph}`
                : `Clinical Story Overview. Chief complaint: ${patientStory.chiefComplaint}. Onset: ${patientStory.onsetAndDuration}. Summary: ${patientStory.summaryParagraph}`;
              speak(summary, true);
            }}
            className="shrink-0 bg-slate-950 hover:bg-slate-900 text-white font-black"
          >
            {t('story.playSummaryAudio', 'Play Summary Audio')}
          </Button>
        </div>
      )}

      {/* Main Structured Patient Story Display Component */}
      <PatientStory story={patientStory} onOpenEvidence={handleOpenEvidence} />

      {/* Navigation Actions */}
      <div className="flex items-center justify-between gap-4 pt-6 border-t border-clinical-border w-full mt-6">
        <Button
          variant="outline"
          size="lg"
          leftIcon={ArrowLeft}
          onClick={() => navigate(PATIENT_ROUTES.DOCUMENTS)}
        >
          {t('btn.back')}
        </Button>

        <Button
          variant="kiosk"
          size="lg"
          rightIcon={ArrowRight}
          onClick={() => navigate(PATIENT_ROUTES.REVIEW)}
          className={cn(
            accessibility.easyMode &&
              'bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg px-8 py-5 min-h-[60px] shadow-lg border-2 border-emerald-800'
          )}
        >
          {accessibility.easyMode ? t('story.continueFinalConfirm', 'CONTINUE TO FINAL CONFIRMATION ➔') : t('story.proceedReview')}
        </Button>
      </div>

      {/* Evidence Drawer Modal */}
      <EvidenceDrawer
        isOpen={isEvidenceOpen}
        onClose={() => setIsEvidenceOpen(false)}
        fact={selectedFact}
        onVerifyFact={handleVerifyFact}
        onRejectFact={handleRejectFact}
        isDoctorView={false}
      />
    </PageContainer>
  );
};

export default PatientStoryPage;
