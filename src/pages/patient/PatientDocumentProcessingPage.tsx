import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATIENT_ROUTES } from '../../constants/routes';
import { usePatientIntake } from '../../context/PatientIntakeContext';
import { CenteredTaskLayout } from '../../components/common/containers/LayoutContainers';
import { Card } from '../../components/common/Card';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Button } from '../../components/common/Button';
import { CheckCircle2, Loader2, ArrowRight, FileCheck } from 'lucide-react';
import { cn } from '../../utils/cn';

export const PatientDocumentProcessingPage: React.FC = () => {
  const navigate = useNavigate();
  const { uploadedDocs, t, refreshPatientStory, accessibility, speak, stopSpeaking, language } = usePatientIntake();
  const hasDocs = uploadedDocs.length > 0;
  const [progress, setProgress] = useState(15);
  const [stage, setStage] = useState(1);

  React.useEffect(() => {
    if (accessibility.voiceGuidance || accessibility.easyMode) {
      const timer = setTimeout(() => {
        const processingPrompts: Record<string, string> = {
          en: hasDocs
            ? 'We are now analysing your documents and building your clinical story. Please wait a few moments.'
            : 'We are now synthesizing your interview responses and preparing your clinical story. Please wait a few moments.',
          hi: hasDocs
            ? 'हम आपके दस्तावेज़ों का विश्लेषण कर रहे हैं और आपकी मेडिकल कहानी तैयार कर रहे हैं। कृपया कुछ क्षण प्रतीक्षा करें।'
            : 'हम आपके साक्षात्कार के उत्तरों का विश्लेषण कर रहे हैं और आपकी मेडिकल कहानी तैयार कर रहे हैं।',
          te: hasDocs
            ? 'మేము మీ పత్రాలను విశ్లేషించి మీ మెడికల్ హిస్టరీని తయారు చేస్తున్నాము. దయచేసి కాసేపు వేచి ఉండండి.'
            : 'మేము మీ ఇంటర్వ్యూ సమాధానాలను విశ్లేషించి మీ మెడికల్ హిస్టరీని తయారు చేస్తున్నాము.',
          ta: hasDocs
            ? 'உங்கள் ஆவணங்களை ஆய்வு செய்து மருத்துவ அறிக்கையை தயாரிக்கிறோம்.'
            : 'உங்கள் பதில்களை ஆய்வு செய்து மருத்துவ அறிக்கையை தயாரிக்கிறோம்.',
          bn: hasDocs
            ? 'আমরা আপনার নথি বিশ্লেষণ করে চিকিৎসা বিবরণ তৈরি করছি।'
            : 'আমরা আপনার উত্তরের ভিত্তিতে চিকিৎসা বিবরণ তৈরি করছি।',
          mr: hasDocs
            ? 'आम्ही तुमचे दस्तऐवज विश्लेषित करत आहोत.'
            : 'आम्ही तुमच्या उत्तरांच्या आधारे वैद्यकीय सारांश तयार करत आहोत.',
          gu: hasDocs
            ? 'અમે તમારા દસ્તાવેજોનું વિશ્લેષણ કરી રહ્યા છીએ.'
            : 'અમે તમારા જવાબોના આધારે મેડિકલ સારાંશ તૈયાર કરી રહ્યા છીએ.',
          kn: hasDocs
            ? 'ನಾವು ನಿಮ್ಮ ದಾಖಲೆಗಳನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತಿದ್ದೇವೆ.'
            : 'ನಾವು ನಿಮ್ಮ ಉತ್ತರಗಳ ಆಧಾರದ ಮೇಲೆ ವೈದ್ಯಕೀಯ ಸಾರಾಂಶ ತಯಾರಿಸುತ್ತಿದ್ದೇವೆ.',
          ml: hasDocs
            ? 'നിങ്ങളുടെ രേഖകൾ പരിശോധിച്ചുകൊണ്ടിരിക്കുകയാണ്.'
            : 'നിങ്ങളുടെ മറുപടികൾ വിശകലനം ചെയ്തുകൊണ്ടിരിക്കുകയാണ്.',
        };
        speak(processingPrompts[language] || processingPrompts['en']);
      }, 300);
      return () => {
        clearTimeout(timer);
        stopSpeaking();
      };
    }
  }, [accessibility.voiceGuidance, accessibility.easyMode, speak, stopSpeaking, language]);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setProgress(40);
      setStage(2);
    }, 800);

    const timer2 = setTimeout(() => {
      setProgress(78);
      setStage(3);
    }, 1600);

    const timer3 = setTimeout(() => {
      setProgress(100);
      setStage(4);
      refreshPatientStory().catch(() => {});
    }, 2400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [refreshPatientStory]);

  const isComplete = progress === 100;

  const loadingTitle = hasDocs
    ? t('docProc.loadingTitle', 'Understanding your medical records...')
    : 'Preparing your clinical summary...';

  const loadingSubtitle = hasDocs
    ? t('docProc.loadingSubtitle', 'Extracting key clinical facts and cross-referencing timeline dates.')
    : 'Synthesizing your interview responses and structuring your story.';

  const readyTitle = hasDocs
    ? t('docProc.readyTitle', 'Clinical Story Ready!')
    : 'Clinical Summary Prepared!';

  const readySubtitle = hasDocs
    ? t('docProc.readySubtitle', 'Key clinical facts and timeline have been extracted and prepared for your attending doctor.')
    : 'Your interview responses have been synthesized into a clinical story for your doctor.';

  const stage1Text = hasDocs ? t('docProc.stage1', 'Reading documents') : 'Analyzing reported symptoms';
  const stage2Text = hasDocs ? t('docProc.stage2', 'Extracting medications & dosages') : 'Structuring clinical timeline';
  const stage3Text = hasDocs ? t('docProc.stage3', 'Cross-referencing timeline dates') : 'Synthesizing interview answers';
  const stage4Text = hasDocs ? t('docProc.stage4', 'Building evidence-linked story') : 'Building doctor intake summary';
  const progressLabel = hasDocs ? t('docProc.extraction', 'Clinical Extraction') : 'Synthesis Progress';

  return (
    <CenteredTaskLayout maxWidth="md">
      <Card variant="kiosk" padding="lg" className="text-center flex flex-col items-center gap-6 bg-white border-brand-200 shadow-kiosk">
        <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center border border-brand-200 shadow-sm">
          {isComplete ? (
            <FileCheck className="w-8 h-8 text-emerald-600 animate-bounce" />
          ) : (
            <Loader2 className="w-8 h-8 text-brand-700 animate-spin" />
          )}
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-clinical-navy">
            {isComplete ? readyTitle : loadingTitle}
          </h2>
          <p className="text-sm text-clinical-muted">
            {isComplete ? readySubtitle : loadingSubtitle}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-clinical-navy">
            <span>{progressLabel}</span>
            <span className="text-brand-800 font-mono">{progress}%</span>
          </div>
          <ProgressBar value={progress} size="md" variant={isComplete ? 'success' : 'brand'} showPercent={false} />
        </div>

        {/* Stage Checklist */}
        <div className="w-full max-w-sm space-y-2 text-xs text-left bg-slate-50 p-4 rounded-clinical border border-slate-200">
          <div className="flex items-center justify-between">
            <span className={stage >= 1 ? 'font-bold text-slate-800' : 'text-slate-400'}>
              {stage > 1 ? `✓ ${stage1Text}` : `● ${stage1Text}...`}
            </span>
            {stage > 1 && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
          </div>

          <div className="flex items-center justify-between">
            <span className={stage >= 2 ? 'font-bold text-slate-800' : 'text-slate-400'}>
              {stage > 2 ? `✓ ${stage2Text}` : stage === 2 ? `● ${stage2Text}...` : `○ ${stage2Text}`}
            </span>
            {stage > 2 && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
          </div>

          <div className="flex items-center justify-between">
            <span className={stage >= 3 ? 'font-bold text-slate-800' : 'text-slate-400'}>
              {stage > 3 ? `✓ ${stage3Text}` : stage === 3 ? `● ${stage3Text}...` : `○ ${stage3Text}`}
            </span>
            {stage > 3 && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
          </div>

          <div className="flex items-center justify-between">
            <span className={stage >= 4 ? 'font-bold text-emerald-800 font-black' : 'text-slate-400'}>
              {stage >= 4 ? `✓ ${stage4Text}` : `○ ${stage4Text}`}
            </span>
            {stage >= 4 && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
          </div>
        </div>

        {/* CTA */}
        {isComplete && (
          <>
            {accessibility.easyMode && (
              <div className="p-3 rounded-2xl bg-emerald-50 border-2 border-emerald-500 text-center">
                <div className="font-black text-sm text-emerald-900">✓ {t('docProc.analysisComplete', 'Analysis Complete')}</div>
                <div className="text-xs text-emerald-800 font-semibold mt-0.5">
                  {t('docProc.storyReadyDesc', 'Your clinical story is ready. Tap below to view it.')}
                </div>
              </div>
            )}
            <Button
              variant="kiosk"
              size="xl"
              fullWidth
              rightIcon={ArrowRight}
              onClick={() => {
                stopSpeaking();
                navigate(PATIENT_ROUTES.PATIENT_STORY);
              }}
              className={cn(
                'shadow-md',
                accessibility.easyMode &&
                  'bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg min-h-[64px] shadow-xl border-2 border-emerald-800'
              )}
            >
              {accessibility.easyMode ? t('docProc.viewStoryBtnEasy', 'VIEW YOUR CLINICAL STORY ➔') : t('docProc.viewStoryBtn')}
            </Button>
          </>
        )}
      </Card>
    </CenteredTaskLayout>
  );
};

export default PatientDocumentProcessingPage;
