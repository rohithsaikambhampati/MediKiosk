import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATIENT_ROUTES } from '../../constants/routes';
import { usePatientIntake, InterviewAnswer } from '../../context/PatientIntakeContext';
import { PageContainer } from '../../components/common/containers/LayoutContainers';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { RiskBadge } from '../../features/risk/RiskBadge';
import {
  Mic,
  MicOff,
  CheckCircle2,
  RotateCcw,
  Edit3,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
  Keyboard,
  Volume2,
} from 'lucide-react';
import { cn } from '../../utils/cn';

const QUESTIONS_STREAM = [
  {
    id: 'q1',
    question: 'What brings you to the hospital today?',
    sampleAnswer: 'I have chest tightness and pressure since yesterday morning.',
    completenessKey: 'complaint',
  },
  {
    id: 'q2',
    question: 'When did the pain or tightness begin?',
    sampleAnswer: 'It started yesterday around 10 AM after walking upstairs.',
    completenessKey: 'duration',
  },
  {
    id: 'q3',
    question: 'Does the pain move to your arm, shoulder, jaw, or back?',
    sampleAnswer: 'Yes, it radiates toward my left shoulder and arm.',
    completenessKey: 'radiation',
  },
  {
    id: 'q4',
    question: 'Are you experiencing sweating or difficulty breathing?',
    sampleAnswer: 'Yes, I had heavy sweating and breathlessness while sitting.',
    completenessKey: 'associated',
  },
];

import { ConversationApi } from '../../services/api/conversationApi';
import { getClinicalQuestions, getDynamicEasyModeOptions, SymptomCategory } from '../../constants/translations';

const EASY_MODE_OPTIONS: Record<number, { text: string; icon: string }[]> = {
  0: [
    { text: 'Chest tightness, pain, or heavy pressure', icon: '🫀' },
    { text: 'High fever, chills, and weakness', icon: '🌡️' },
    { text: 'Difficulty breathing / shortness of breath', icon: '💨' },
    { text: 'Severe stomach pain or nausea', icon: '🤢' },
    { text: 'Headache, dizziness, or confusion', icon: '🤕' },
  ],
  1: [
    { text: 'Just started today (< 24 hours)', icon: '⏱️' },
    { text: 'Started 1 to 2 days ago', icon: '📅' },
    { text: 'Started about 1 week ago', icon: '🗓️' },
    { text: 'Ongoing for more than a month', icon: '⏳' },
  ],
  2: [
    { text: 'Spreads to left shoulder, neck, or arm', icon: '➡️' },
    { text: 'Spreads to back or upper abdomen', icon: '⬆️' },
    { text: 'Stays localized in chest only (no spread)', icon: '⭕' },
  ],
  3: [
    { text: 'Heavy sweating & breathlessness present', icon: '😓' },
    { text: 'Nausea or cold clammy skin', icon: '🤢' },
    { text: 'No sweating or breathlessness', icon: '❌' },
  ],
};


export const detectCategory = (text: string, currentCategory: SymptomCategory = 'leg_pain'): SymptomCategory => {
  if (!text) return currentCategory;
  const lower = text.toLowerCase();

  // 1. Leg, knee, joint, foot, body ache, back pain, walking difficulty
  if (
    lower.includes('leg') || lower.includes('legs') || lower.includes('knee') || lower.includes('knees') ||
    lower.includes('joint') || lower.includes('joints') || lower.includes('bone') || lower.includes('muscle') ||
    lower.includes('foot') || lower.includes('feet') || lower.includes('ankle') || lower.includes('calf') ||
    lower.includes('thigh') || lower.includes('back pain') || lower.includes('body pain') || lower.includes('body ache') ||
    lower.includes('bodyache') || lower.includes('walk') || lower.includes('limp') || lower.includes('sprain') ||
    lower.includes('cramp') || lower.includes('legs pain') || lower.includes('leg pain') ||
    // Telugu terms
    lower.includes('కాలు') || lower.includes('కాళ్ళు') || lower.includes('కాళ్ళ') || lower.includes('కాళ్ళనొప్పి') ||
    lower.includes('కాళ్ల') || lower.includes('మోకాలు') || lower.includes('మోకాళ్ళు') || lower.includes('మోకాళ్ళ') ||
    lower.includes('కీళ్ళు') || lower.includes('కీళ్ళ') || lower.includes('నడుము') || lower.includes('వెన్ను') ||
    lower.includes('ఒళ్ళు నొప్పులు') || lower.includes('ఒళ్ళునొప్పి') || lower.includes('నడవలేక') ||
    lower.includes('నడవడంలో') || lower.includes('నడవటం') || lower.includes('తిమ్మిరి') || lower.includes('పాదం') ||
    // Hindi terms
    lower.includes('पैर') || lower.includes('पैरों') || lower.includes('घुटना') || lower.includes('घुटने') ||
    lower.includes('घुटनों') || lower.includes('जोड़') || lower.includes('जोड़ों') || lower.includes('कमर') ||
    lower.includes('पीठ दर्द') || lower.includes('बदन दर्द') || lower.includes('चलने में') || lower.includes('हड्डी') ||
    // Other language roots
    lower.includes('கால்கள்') || lower.includes('முழங்கால்') || lower.includes('পা') || lower.includes('కాలు')
  ) {
    return 'leg_pain';
  }

  // 2. Chest pain / Cardiac
  if (
    lower.includes('chest') || lower.includes('heart') || lower.includes('tightness') || lower.includes('cardiac') || lower.includes('angina') ||
    lower.includes('छाती') || lower.includes('सीना') || lower.includes('सीने') || lower.includes('दिल') ||
    lower.includes('ఛాతీ') || lower.includes('గుండె') || lower.includes('ఛాతి') ||
    lower.includes('நெஞ்சு') || lower.includes('బుకర్') || lower.includes('বুক')
  ) {
    return 'chest_pain';
  }

  // 3. Breathlessness / Respiratory
  if (
    lower.includes('breath') || lower.includes('asthma') || lower.includes('suffocat') || lower.includes('wheez') || lower.includes('shortness') || lower.includes('dyspnea') ||
    lower.includes('सांस') || lower.includes('दम') || lower.includes('हांफना') ||
    lower.includes('శ్వాస') || lower.includes('ఆయాసం') || lower.includes('దమ్ము') || lower.includes('ఉబ్బసం') ||
    lower.includes('మూச்சு') || lower.includes('শ্বাস') || lower.includes('શ્વાસ') || lower.includes('ಉಸಿರಾಟ') || lower.includes('ശ്വാസം')
  ) {
    return 'breathlessness';
  }

  // 4. Headache / Migraine
  if (
    lower.includes('headache') || lower.includes('head') || lower.includes('migraine') || lower.includes('dizz') || lower.includes('gidd') ||
    lower.includes('सिर') || lower.includes('सर दर्द') || lower.includes('सिरदर्द') || lower.includes('चक्कर') ||
    lower.includes('తల') || lower.includes('తలనొప్పి') || lower.includes('తల నొప్పి') || lower.includes('తలతిరగడం') || lower.includes('మైకం') ||
    lower.includes('தலை') || lower.includes('தலைவலி') || lower.includes('মাথা') || lower.includes('માથું') || lower.includes('ತಲೆ') || lower.includes('തല')
  ) {
    return 'headache';
  }

  // 5. Stomach / Abdominal
  if (
    lower.includes('stomach') || lower.includes('abdomen') || lower.includes('belly') || lower.includes('nausea') || lower.includes('vomit') || lower.includes('acid') || lower.includes('gastric') ||
    lower.includes('पेट') || lower.includes('मळमळ') || lower.includes('उल्टी') || lower.includes('एसिडिटी') ||
    lower.includes('కడుపు') || lower.includes('పొట్ట') || lower.includes('వికారం') || lower.includes('వాంతి') || lower.includes('ఎసిడిటీ') || lower.includes('కడుపునొప్పి') ||
    lower.includes('வயிறு') || lower.includes('পেট') || lower.includes('પેટ') || lower.includes('ಹೊಟ್ಟೆ') || lower.includes('വയറ്')
  ) {
    return 'stomach_pain';
  }

  // 6. Cough / Cold / Throat
  if (
    lower.includes('cough') || lower.includes('cold') || lower.includes('sneeze') || lower.includes('phlegm') || lower.includes('mucus') || lower.includes('sore throat') || lower.includes('throat') || lower.includes('runny') ||
    lower.includes('खांसी') || lower.includes('जुकाम') || lower.includes('खराश') || lower.includes('बलगम') ||
    lower.includes('దగ్గు') || lower.includes('జలుబు') || lower.includes('గొంతు') || lower.includes('కఫం') || lower.includes('తుమ్ములు')
  ) {
    return 'cough_cold';
  }

  // 7. Fever / High temperature / Chills
  if (
    lower.includes('fever') || lower.includes('temp') || lower.includes('chill') || lower.includes('warm') || lower.includes('shiver') ||
    lower.includes('बुखार') || lower.includes('ताप') || lower.includes('ठंड') ||
    lower.includes('జ్వరం') || lower.includes('జ్వర') || lower.includes('కాక') || lower.includes('చలి') || lower.includes('వేడి') ||
    lower.includes('காய்ச்சல்') || lower.includes('জ্বর') || lower.includes('તાવ') || lower.includes('ಜ್ವರ') || lower.includes('പനി')
  ) {
    return 'fever';
  }

  // 8. General pain / fatigue
  if (
    lower.includes('pain') || lower.includes('ache') || lower.includes('tired') || lower.includes('fatigue') || lower.includes('weak') ||
    lower.includes('నొప్పి') || lower.includes('నీరసం') || lower.includes('అలసట') ||
    lower.includes('दर्द') || lower.includes('कमजोरी') || lower.includes('थकान')
  ) {
    return 'general_pain';
  }

  return currentCategory;
};

export const PatientConversationPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    symptomCategory,
    setSymptomCategory,
    interviewAnswers,
    addInterviewAnswer,
    redFlagsDetected,
    setRedFlagsDetected,
    questions,
    voiceConfig,
    accessibility,
    speak,
    stopSpeaking,
    requestStaffAssistance,
    t,
    language,
    intakeSessionId,
    refreshPatientStory,
  } = usePatientIntake();

  const [questionIndex, setQuestionIndex] = useState(0);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [dynamicQuestion, setDynamicQuestion] = useState<string | null>(null);
  const [redFlagAlertMessage, setRedFlagAlertMessage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [typeInputValue, setTypeInputValue] = useState('');
  const [showTypeMode, setShowTypeMode] = useState(false);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);
  const recognitionRef = React.useRef<any>(null);

  React.useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  const activeQuestions = getClinicalQuestions(language, symptomCategory);
  const currentQ = activeQuestions[Math.min(questionIndex, activeQuestions.length - 1)];
  const isFinishedAll = questionIndex >= activeQuestions.length;
  const activeQuestionText = dynamicQuestion || currentQ?.question || '';

  // Initialize live conversation with backend if intake session exists
  React.useEffect(() => {
    let isMounted = true;
    const initConvo = async () => {
      if (intakeSessionId) {
        try {
          const res = await ConversationApi.startConversation({
            intake_id: intakeSessionId,
            language: language,
            accessibility_mode: accessibility.easyMode ? 'EASY' : 'STANDARD',
          });
          if (isMounted && res.success && res.data) {
            setConversationId(res.data.conversation_id);
            if (res.data.current_question) {
              setDynamicQuestion(res.data.current_question);
            }
          }
        } catch (err) {
          console.warn('Could not connect to conversation engine backend, using local mode:', err);
        }
      }
    };
    initConvo();
    return () => {
      isMounted = false;
    };
  }, [intakeSessionId, language, accessibility.easyMode]);

  // Automatically read questions aloud in Easy Mode or when Voice Guidance is active
  React.useEffect(() => {
    if (!isFinishedAll && activeQuestionText) {
      const timer = setTimeout(() => {
        if (accessibility.voiceGuidance || accessibility.easyMode) {
          speak(activeQuestionText);
        }
      }, 350);
      return () => {
        clearTimeout(timer);
        stopSpeaking();
      };
    }
  }, [questionIndex, isFinishedAll, activeQuestionText, accessibility.voiceGuidance, accessibility.easyMode, speak, stopSpeaking]);

  const handleStartRecording = () => {
    stopSpeaking();
    setSpeechNotice(null);
    setTranscript(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechNotice(t('convo.noMicSupport'));
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      const langCode = voiceConfig?.bcp47 || (language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-IN');
      recognition.lang = langCode;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      let capturedText = '';

      recognition.onstart = () => {
        setIsRecording(true);
        setIsTranscribing(false);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            capturedText += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        const text = (capturedText || interim).trim();
        if (text) {
          setTranscript(text);
          if (questionIndex === 0) {
            const detected = detectCategory(text, symptomCategory);
            setSymptomCategory(detected);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
        setIsTranscribing(false);

        if (event.error === 'no-speech') {
          setSpeechNotice(t('convo.noSpeechError'));
        } else if (event.error === 'not-allowed') {
          setSpeechNotice(t('convo.micBlocked'));
        } else {
          setSpeechNotice(t('convo.noSpeechError'));
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        setIsTranscribing(false);
        if (capturedText) {
          const trimmed = capturedText.trim();
          setTranscript(trimmed);
          if (questionIndex === 0) {
            const detected = detectCategory(trimmed, symptomCategory);
            setSymptomCategory(detected);
          }
        }
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsRecording(false);
      setIsTranscribing(false);
      setSpeechNotice(t('convo.noMicSupport'));
    }
  };

  const handleStopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsRecording(false);
  };

  const handleConfirmTranscript = async () => {
    const textToSave = (typeInputValue || transcript || '').trim();
    if (!textToSave) return;

    if (questionIndex === 0) {
      const detectedCat = detectCategory(textToSave, symptomCategory);
      setSymptomCategory(detectedCat);
    }
    setDynamicQuestion(null);

    addInterviewAnswer({
      questionId: currentQ?.id || `q_${questionIndex}`,
      question: activeQuestionText,
      answer: textToSave,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      confidence: 'high',
    });

    setTranscript(null);
    setTypeInputValue('');
    setIsEditing(false);

    // Call live Conversation Engine backend
    if (conversationId) {
      try {
        const res = await ConversationApi.processTurn(conversationId, textToSave, language, 'TEXT');
        if (res.success && res.data) {
          if (res.data.next_question) {
            setDynamicQuestion(res.data.next_question);
          }
          if (res.data.red_flags && res.data.red_flags.length > 0) {
            setRedFlagsDetected(true);
            setRedFlagAlertMessage(res.data.red_flags[0].message);
          }
          if (res.data.is_completed) {
            setQuestionIndex(activeQuestions.length);
            await refreshPatientStory();
            return;
          }
        }
      } catch (err) {
        console.error('Error processing turn in conversation engine:', err);
      }
    }

    if (questionIndex < activeQuestions.length - 1) {
      setQuestionIndex((prev) => prev + 1);
    } else {
      setQuestionIndex(activeQuestions.length);
      await refreshPatientStory();
    }
  };

  const handleQuickAnswer = (answerText: string) => {
    setTypeInputValue(answerText);
    setShowTypeMode(true);
  };

  const handleReadAloud = () => {
    if (activeQuestionText) {
      speak(activeQuestionText, true);
    }
  };

  return (
    <PageContainer
      title={t('convo.title')}
      subtitle={t('convo.subtitle')}
      maxWidth="2xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Guided Interview Center Stage (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Safety Alert for Acute Red-Flags */}
          {redFlagsDetected && symptomCategory === 'chest_pain' && (
            <Card variant="urgent" padding="md" className="border-l-4 border-l-red-600 bg-red-50/90 shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-red-100 text-red-700 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-red-950">{t('convo.redFlagTitle')}</h4>
                      <RiskBadge level="immediate" size="sm" />
                    </div>
                    <p className="text-xs text-red-900 mt-1 leading-relaxed">
                      {redFlagAlertMessage || t('convo.redFlagDesc')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={HelpCircle}
                  onClick={() => requestStaffAssistance('Potential Clinical Red Flag Detected in Intake')}
                  className="shrink-0 font-bold"
                >
                  {t('convo.requestStaff')}
                </Button>
              </div>
            </Card>
          )}

          {/* Contextual Dynamic Progression Notice */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-900 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-brand-700" />
            <span>AI Clinical Conversation Engine Active</span>
          </div>

          {!isFinishedAll ? (
            <Card
              variant="kiosk"
              padding="lg"
              className={cn(
                'flex flex-col items-center text-center gap-6 bg-white relative transition-all',
                accessibility.easyMode
                  ? 'border-4 border-slate-950 shadow-2xl rounded-3xl p-6 sm:p-8'
                  : 'border-brand-200 shadow-kiosk'
              )}
            >
              {/* Question Number Badge */}
              <span className={cn(
                'uppercase tracking-wider',
                accessibility.easyMode ? 'text-sm font-black text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300' : 'text-xs font-bold text-slate-400'
              )}>
                {t('convo.questionCount', `Question ${questionIndex + 1} of ${activeQuestions.length}`, {
                  current: questionIndex + 1,
                  total: activeQuestions.length,
                })}
              </span>

              {/* Central Question Display */}
              <div className="space-y-2 max-w-xl">
                <h2 className={cn(
                  'font-extrabold text-clinical-navy leading-snug',
                  accessibility.easyMode
                    ? 'text-3xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight'
                    : 'text-2xl sm:text-3xl'
                )}>
                  “{activeQuestionText}”
                </h2>
              </div>

              {/* Audio Pronunciation Button */}
              <button
                type="button"
                onClick={handleReadAloud}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full font-bold transition-all select-none',
                  accessibility.easyMode
                    ? 'px-4 py-2 bg-amber-200 hover:bg-amber-300 text-amber-950 text-sm border-2 border-amber-800 shadow-xs'
                    : 'px-3 py-1 bg-slate-100 text-slate-700 text-xs hover:bg-slate-200'
                )}
              >
                <Volume2 className="w-4 h-4 text-brand-800 stroke-[2.5]" />
                <span>{t('convo.readAloud', 'Read Question Aloud')}</span>
              </button>

              {/* 1-Tap Easy Response Options in Easy Mode */}
              {accessibility.easyMode && (
                <div className="w-full space-y-2.5 pt-2 border-t-2 border-slate-200">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t('convo.tapYourAnswer')}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                    {getDynamicEasyModeOptions(questionIndex, symptomCategory, language).map((opt, optIdx) => {
                      const isSelected = transcript === opt.text;
                      return (
                        <button
                          key={opt.text}
                          type="button"
                          onClick={() => {
                            setSpeechNotice(null);
                            setTranscript(opt.text);
                            if (questionIndex === 0) {
                              const categoryByIndex: SymptomCategory[] = [
                                'chest_pain',
                                'fever',
                                'breathlessness',
                                'stomach_pain',
                                'headache',
                                'leg_pain',
                                'cough_cold',
                              ];
                              const chosenCat = categoryByIndex[optIdx] || detectCategory(opt.text, symptomCategory);
                              setSymptomCategory(chosenCat);
                            }
                            speak(`${opt.text}. Tap confirm to proceed.`, true);
                          }}
                          className={cn(
                            'flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left font-bold text-base transition-all select-none cursor-pointer',
                            isSelected
                              ? 'border-emerald-700 bg-emerald-100 text-emerald-950 ring-4 ring-emerald-300 font-black shadow-md'
                              : 'border-slate-800 bg-white hover:bg-slate-50 text-slate-900 shadow-xs'
                          )}
                        >
                          <span className="text-2xl shrink-0">{opt.icon}</span>
                          <span className="leading-snug">{opt.text}</span>
                          {isSelected && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-700 ml-auto shrink-0 stroke-[3]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Microphone & Voice Interaction Zone */}
              {!showTypeMode ? (
                <div className="w-full flex flex-col items-center gap-4 py-2">
                  {/* Big Microphone Circle */}
                  <button
                    type="button"
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                    disabled={isTranscribing}
                    className={cn(
                      'rounded-full flex flex-col items-center justify-center gap-1 transition-all shadow-lg select-none relative',
                      accessibility.easyMode ? 'w-28 h-28 border-4 border-slate-900' : 'w-24 h-24',
                      isRecording
                        ? 'bg-red-600 text-white ring-8 ring-red-200 animate-pulse scale-110'
                        : isTranscribing
                        ? 'bg-amber-500 text-white animate-bounce'
                        : 'bg-brand-700 text-white hover:bg-brand-800 hover:scale-105 active:scale-95'
                    )}
                  >
                    {isRecording ? (
                      <MicOff className={cn('stroke-[2.5]', accessibility.easyMode ? 'w-12 h-12' : 'w-10 h-10')} />
                    ) : (
                      <Mic className={cn('stroke-[2.5]', accessibility.easyMode ? 'w-12 h-12' : 'w-10 h-10')} />
                    )}
                  </button>

                  <span className={cn(
                    'font-bold text-center px-4',
                    accessibility.easyMode ? 'text-sm sm:text-base text-slate-950 font-black' : 'text-xs text-clinical-muted'
                  )}>
                    {isRecording
                      ? t('convo.micListen', 'Listening... speak clearly now')
                      : isTranscribing
                      ? t('convo.micStructuring', 'Transcribing your words...')
                      : accessibility.easyMode
                      ? t('convo.orTapMic', 'Or tap microphone to speak your own words')
                      : t('convo.micIdle', 'Tap to speak')}
                  </span>

                  {/* Real-time Speech Guidance & Error Notification */}
                  {speechNotice && (
                    <div className="p-3 rounded-xl bg-amber-50 border-2 border-amber-400 text-amber-950 text-xs font-bold max-w-md mx-auto text-center flex items-center justify-center gap-2 shadow-xs">
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>{speechNotice}</span>
                    </div>
                  )}

                  {/* Waveform Pulse Animation mockup during recording */}
                  {isRecording && (
                    <div className="flex items-center gap-1.5 h-6">
                      <span className="w-1.5 bg-red-500 h-3 animate-pulse rounded" />
                      <span className="w-1.5 bg-red-600 h-6 animate-pulse rounded" />
                      <span className="w-1.5 bg-red-500 h-4 animate-pulse rounded" />
                      <span className="w-1.5 bg-red-700 h-5 animate-pulse rounded" />
                      <span className="w-1.5 bg-red-500 h-2 animate-pulse rounded" />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowTypeMode(true)}
                    className="text-xs font-bold text-brand-800 hover:underline flex items-center gap-1 mt-2"
                  >
                    <Keyboard className="w-3.5 h-3.5" /> {t('convo.typeInstead')}
                  </button>
                </div>
              ) : (
                /* Type Input Alternative Mode */
                <div className="w-full space-y-3">
                  <Input
                    label={t('convo.typeLabel')}
                    value={typeInputValue}
                    onChange={(e) => setTypeInputValue(e.target.value)}
                    placeholder={t('identity.placeholder')}
                    isKiosk
                  />
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowTypeMode(false)}
                      className="text-xs font-bold text-slate-500 hover:underline"
                    >
                      {t('convo.backToVoice')}
                    </button>
                    <Button variant="primary" size="md" onClick={handleConfirmTranscript}>
                      {t('convo.submitResponse')}
                    </Button>
                  </div>
                </div>
              )}

              {/* Standard Quick-Response Chips (only in standard mode) */}
              {!accessibility.easyMode && (
                <div className="w-full flex flex-wrap items-center justify-center gap-2 pt-1 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-400">Quick reply:</span>
                  {["Yes", "No", "I don't know / Not sure", "None / Never"].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleQuickAnswer(chip)}
                      className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 hover:bg-brand-50 hover:text-brand-800 text-slate-700 border border-slate-200 transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}

              {/* Voice Transcript Confirmation Feedback */}
              {transcript && (
                <div className={cn(
                  'w-full text-left space-y-3 transition-all',
                  accessibility.easyMode
                    ? 'p-5 rounded-2xl bg-emerald-50 border-3 border-emerald-700 shadow-lg'
                    : 'p-4 rounded-clinical bg-slate-50 border border-slate-200'
                )}>
                  <div className={cn(
                    'uppercase tracking-wider flex items-center gap-1.5',
                    accessibility.easyMode ? 'text-xs font-black text-emerald-950' : 'text-xs font-semibold text-clinical-muted'
                  )}>
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>{t('convo.iHeard', 'Recorded Answer')}</span>
                  </div>
                  <div className={cn(
                    'italic',
                    accessibility.easyMode ? 'font-black text-xl text-slate-950' : 'font-bold text-sm text-clinical-navy'
                  )}>
                    "{transcript}"
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t border-slate-200 flex-wrap">
                    <Button
                      variant="primary"
                      size={accessibility.easyMode ? 'xl' : 'sm'}
                      leftIcon={CheckCircle2}
                      onClick={handleConfirmTranscript}
                      className={cn(
                        accessibility.easyMode && 'bg-emerald-700 hover:bg-emerald-800 text-white font-black text-lg min-h-[58px] px-6 shadow-md'
                      )}
                    >
                      {t('convo.confirmYes', 'Confirm & Next ➔')}
                    </Button>

                    <Button
                      variant="ghost"
                      size={accessibility.easyMode ? 'lg' : 'sm'}
                      leftIcon={RotateCcw}
                      onClick={() => {
                        setTranscript(null);
                        handleStartRecording();
                      }}
                      className={cn(accessibility.easyMode && 'border-2 border-slate-700 text-slate-900 font-bold min-h-[58px]')}
                    >
                      {t('convo.tryAgain', 'Speak Again')}
                    </Button>

                    {!accessibility.easyMode && (
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={Edit3}
                        onClick={() => {
                          setTypeInputValue(transcript);
                          setShowTypeMode(true);
                        }}
                      >
                        {t('convo.editTranscript')}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ) : (
            /* Intake Interview Complete State */
            <Card variant="default" padding="lg" className={cn(
              'text-center space-y-4 bg-white border-emerald-300',
              accessibility.easyMode && 'border-4 border-emerald-600 shadow-xl p-8'
            )}>
              <div className={cn(
                'rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto',
                accessibility.easyMode ? 'w-20 h-20' : 'w-14 h-14'
              )}>
                <CheckCircle2 className={cn(accessibility.easyMode ? 'w-12 h-12' : 'w-8 h-8')} />
              </div>
              <h3 className={cn(
                'font-extrabold text-clinical-navy',
                accessibility.easyMode ? 'text-3xl font-black' : 'text-2xl'
              )}>{t('convo.completeTitle')}</h3>
              <p className={cn(
                'text-clinical-muted max-w-md mx-auto',
                accessibility.easyMode ? 'text-base font-semibold' : 'text-sm'
              )}>
                {t('convo.completeDesc')}
              </p>
              <Button
                variant="kiosk"
                size="lg"
                rightIcon={ArrowRight}
                onClick={() => navigate(PATIENT_ROUTES.DOCUMENTS)}
                className={cn(
                  accessibility.easyMode &&
                    'bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg px-8 py-5 min-h-[64px] shadow-lg border-2 border-emerald-800 w-full'
                )}
              >
                {accessibility.easyMode ? t('convo.continueDocsBtn') : t('convo.proceedDocs')}
              </Button>
            </Card>
          )}

          {/* Navigation Bar */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <Button
              variant="outline"
              size="md"
              leftIcon={ArrowLeft}
              onClick={() => navigate(PATIENT_ROUTES.INTAKE)}
            >
              {t('btn.back')}
            </Button>

            <Button
              variant="kiosk"
              size="md"
              rightIcon={ArrowRight}
              onClick={() => navigate(PATIENT_ROUTES.DOCUMENTS)}
            >
              {t('convo.nextDocs')}
            </Button>
          </div>
        </div>

        {/* Secondary Right Column: Clinical Completeness Progress Panel */}
        <div className="space-y-4">
          <Card variant="default" padding="md" className="bg-white border-clinical-border shadow-subtle">
            <h3 className="font-extrabold text-sm text-clinical-navy uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-700" /> {t('convo.completeness')}
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                <span className="font-medium text-slate-700">{t('convo.mainComplaint')}</span>
                <span className={interviewAnswers.length > 0 ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                  {interviewAnswers.length > 0 ? t('convo.captured') : t('convo.pending')}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                <span className="font-medium text-slate-700">{t('convo.durationOnset')}</span>
                <span className={interviewAnswers.length > 1 ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                  {interviewAnswers.length > 1 ? t('convo.captured') : t('convo.pending')}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                <span className="font-medium text-slate-700">{t('convo.radiation')}</span>
                <span className={interviewAnswers.length > 2 ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                  {interviewAnswers.length > 2 ? t('convo.captured') : t('convo.pending')}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                <span className="font-medium text-slate-700">{t('convo.associated')}</span>
                <span className={interviewAnswers.length > 3 ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                  {interviewAnswers.length > 3 ? t('convo.captured') : t('convo.pending')}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                <span className="font-medium text-slate-700">{t('convo.currentMeds')}</span>
                <span className="text-emerald-700 font-bold">✓ Metformin, Aspirin</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                <span className="font-medium text-slate-700">{t('convo.allergies')}</span>
                <span className="text-amber-800 font-bold">✓ Penicillin</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default PatientConversationPage;
