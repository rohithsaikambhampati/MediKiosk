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
  const { patientStory, updateStoryFactVerification, accessibility, speak, stopSpeaking, t, language } = usePatientIntake();
  const [selectedFact, setSelectedFact] = useState<MedicalFact | null>(null);
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);

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
    setSelectedFact(fact);
    setIsEvidenceOpen(true);
  };

  const handleVerifyFact = (factId: string) => {
    updateStoryFactVerification(factId);
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
            <strong className="font-extrabold text-sm block">{t('story.evidenceBannerTitle')}</strong>
            {t('story.evidenceBannerDesc')}
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowConflictModal((prev) => !prev)}
        >
          {showConflictModal ? 'Hide Conflict Banner' : 'Simulate Dosage Conflict'}
        </Button>
      </div>

      {/* Mock Conflict Alert Card (Interactive Scenario) */}
      {showConflictModal && (
        <Card variant="urgent" padding="md" className="border-l-4 border-l-amber-500 bg-amber-50/90 mb-6 shadow-md">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-sm text-amber-950">⚠ Information Conflict Detected</h4>
                <div className="text-xs text-amber-900 mt-1 space-y-1">
                  <p>
                    <strong>Patient reported:</strong> Metformin 500 mg (Voice Interview)
                  </p>
                  <p>
                    <strong>Latest prescription:</strong> Metformin 850 mg (Prescription_Feb2025.jpg)
                  </p>
                  <p className="text-[11px] text-amber-800 italic mt-1">
                    Sources contain different dosage values. Please review during doctor consultation.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedFact({
                    id: 'fact-metformin',
                    patientId: 'P-10042',
                    category: 'medication',
                    title: 'Metformin Dosage Discrepancy',
                    detail: 'Metformin 500 mg / 850 mg dosage discrepancy between voice report and prescription.',
                    extractedDate: 'Today',
                    verificationStatus: 'needs-verification',
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
                  });
                  setIsEvidenceOpen(true);
                }}
              >
                View Sources
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Easy Mode Audio Story Banner */}
      {accessibility.easyMode && (
        <div className="p-4 rounded-clinical bg-amber-100/90 border-2 border-amber-500 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔊</span>
            <div>
              <div className="font-extrabold text-sm text-slate-950">
                Audio Overview of Your Records
              </div>
              <div className="text-xs text-slate-700">
                Tap the button to listen to all identified symptoms, medications, and conditions read aloud.
              </div>
            </div>
          </div>
          <Button
            variant="kiosk"
            size="md"
            onClick={() => {
              const summary = `Clinical Story Overview. Chief complaint: ${patientStory.chiefComplaint}. Onset: ${patientStory.onsetAndDuration}. Summary: ${patientStory.summaryParagraph}`;
              speak(summary, true);
            }}
            className="shrink-0 bg-slate-950 hover:bg-slate-900 text-white font-black"
          >
            Play Summary Audio
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
          {accessibility.easyMode ? 'CONTINUE TO FINAL CONFIRMATION ➔' : t('story.proceedReview')}
        </Button>
      </div>

      {/* Evidence Drawer Modal */}
      <EvidenceDrawer
        isOpen={isEvidenceOpen}
        onClose={() => setIsEvidenceOpen(false)}
        fact={selectedFact}
        onVerifyFact={handleVerifyFact}
      />
    </PageContainer>
  );
};

export default PatientStoryPage;
