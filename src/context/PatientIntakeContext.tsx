import React, { createContext, useContext, useState, useCallback } from 'react';
import { MOCK_PATIENT, MOCK_PATIENT_STORY, getLocalizedMockStory } from '../services/mock/mockData';
import { PatientStory } from '../types/story';
import { MedicalFact } from '../types/evidence';
import { VerificationStatus } from '../types/clinical';
import { TimelineEvent } from '../types/timeline';
import {
  getTranslation,
  SymptomCategory,
  getClinicalQuestions,
  ClinicalQuestionItem,
  LANGUAGE_VOICE_MAP,
  LanguageVoiceConfig,
} from '../constants/translations';

export interface AccessibilitySettings {
  easyMode: boolean;
  largeText: boolean;
  highContrast: boolean;
  voiceGuidance: boolean;
  audioInstructions: boolean;
  textScale?: 'normal' | 'large' | 'extra-large';
}

export interface ConsentSettings {
  voice: boolean;
  documents: boolean;
  aiProcessing: boolean;
  hospitalSharing: boolean;
  abhaLinking: boolean;
}

export interface PatientIdentity {
  mrn: string;
  phone: string;
  abhaId: string;
  isVerified: boolean;
  name: string;
  age: number;
  gender: string;
  department: string;
}

export interface InterviewAnswer {
  questionId: string;
  question: string;
  answer: string;
  timestamp: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface UploadedDocItem {
  id: string;
  fileName: string;
  fileType: string;
  documentType: string;
  uploadDate: string;
  status: 'uploading' | 'extracted' | 'ready';
  extractedFactsCount: number;
}

import { INITIAL_TRIAGE_ALERTS } from './NurseTriageContext';
import { TriageAlert } from '../types/triage';

export interface PatientIntakeContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, fallback?: string, params?: Record<string, string | number>) => string;
  questions: ClinicalQuestionItem[];
  voiceConfig: LanguageVoiceConfig;
  accessibility: AccessibilitySettings;
  setAccessibility: React.Dispatch<React.SetStateAction<AccessibilitySettings>>;
  toggleAccessibilitySetting: (key: keyof AccessibilitySettings) => void;
  setEasyMode: (enabled: boolean) => void;
  speak: (text: string, force?: boolean) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
  currentSpeakingText: string;
  textScale: 'normal' | 'large' | 'extra-large';
  setTextScale: (scale: 'normal' | 'large' | 'extra-large') => void;
  assistanceAlertBanner: boolean;
  setAssistanceAlertBanner: React.Dispatch<React.SetStateAction<boolean>>;
  requestStaffAssistance: (reason?: string) => void;
  dismissAssistanceAlert: () => void;
  consent: ConsentSettings;
  setConsent: React.Dispatch<React.SetStateAction<ConsentSettings>>;
  identity: PatientIdentity;
  setIdentity: React.Dispatch<React.SetStateAction<PatientIdentity>>;
  verifyIdentity: (customData?: Partial<PatientIdentity>) => void;
  interviewAnswers: InterviewAnswer[];
  addInterviewAnswer: (answer: InterviewAnswer) => void;
  symptomCategory: SymptomCategory;
  setSymptomCategory: (category: SymptomCategory) => void;
  redFlagsDetected: boolean;
  setRedFlagsDetected: (detected: boolean) => void;
  uploadedDocs: UploadedDocItem[];
  addDocument: (doc: UploadedDocItem) => void;
  removeDocument: (id: string) => void;
  patientStory: PatientStory;
  factVerificationOverrides: Record<string, VerificationStatus>;
  updateStoryFactVerification: (factId: string, status?: VerificationStatus) => void;
  isReviewConfirmed: boolean;
  setIsReviewConfirmed: (confirmed: boolean) => void;
  intakeSessionId: string | null;
  setIntakeSessionId: React.Dispatch<React.SetStateAction<string | null>>;
  refreshPatientStory: () => Promise<void>;
  resetIntake: () => void;
}

const PatientIntakeContext = createContext<PatientIntakeContextType | undefined>(undefined);

const STORAGE_KEY = 'medikiosk_patient_intake_session';

const getSavedSession = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const PatientIntakeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const saved = getSavedSession();

  const [language, setLanguage] = useState<string>(saved?.language || 'en');

  const [accessibility, setAccessibility] = useState<AccessibilitySettings>(
    saved?.accessibility || {
      easyMode: false,
      largeText: false,
      highContrast: false,
      voiceGuidance: true,
      audioInstructions: true,
    }
  );

  const [consent, setConsent] = useState<ConsentSettings>(
    saved?.consent || {
      voice: true,
      documents: true,
      aiProcessing: true,
      hospitalSharing: true,
      abhaLinking: false,
    }
  );

  const [identity, setIdentity] = useState<PatientIdentity>(
    saved?.identity || {
      mrn: MOCK_PATIENT.mrn,
      phone: '9876543210',
      abhaId: '91-8841-2026-90',
      isVerified: true,
      name: MOCK_PATIENT.name,
      age: MOCK_PATIENT.age,
      gender: MOCK_PATIENT.gender,
      department: MOCK_PATIENT.assignedDepartment,
    }
  );

  const [interviewAnswers, setInterviewAnswers] = useState<InterviewAnswer[]>(
    saved?.interviewAnswers || []
  );

  const [symptomCategory, setSymptomCategory] = useState<SymptomCategory>(
    saved?.symptomCategory || 'fever'
  );

  const [redFlagsDetected, setRedFlagsDetected] = useState<boolean>(false);

  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocItem[]>([]);

  const [patientStory, setPatientStory] = useState<PatientStory>(MOCK_PATIENT_STORY);

  const [factVerificationOverrides, setFactVerificationOverrides] = useState<Record<string, VerificationStatus>>(
    saved?.factVerificationOverrides || {}
  );

  const effectivePatientStory = React.useMemo<PatientStory>(() => {
    const baseStory = getLocalizedMockStory(language, identity, symptomCategory);

    if (interviewAnswers.length > 0) {
      const formattedAnswers = interviewAnswers.map((a) => a.answer).join('. ');
      const complaint = interviewAnswers[0]?.answer || baseStory.chiefComplaint;
      const duration = interviewAnswers[1]?.answer || baseStory.onsetAndDuration;

      const reportedFacts: MedicalFact[] = interviewAnswers.map((ans, idx) => {
        const factId = `fact-interview-${idx}`;
        return {
          id: factId,
          patientId: identity.mrn || 'patient-ramesh-01',
          category: 'symptom',
          title: ans.question,
          detail: ans.answer,
          extractedDate: ans.timestamp || (language === 'te' ? 'ఈరోజు' : 'Today'),
          verificationStatus: factVerificationOverrides[factId] || 'needs-verification',
          confidence: 'high',
          sources: [
            {
              id: `src-voice-${idx}`,
              type: 'conversation-transcript',
              title: language === 'te' ? 'రోగి వాయిస్ ఇంటర్వ్యూ' : language === 'hi' ? 'मरीज़ वॉयस इंटरव्यू' : 'Patient Voice Intake',
              date: ans.timestamp || (language === 'te' ? 'ఈరోజు' : 'Today'),
              snippetText: `${ans.question}: "${ans.answer}"`,
              confidence: 'high',
            },
          ],
        };
      });

      const summaryText = language === 'te'
        ? `${identity.name || 'రోగి'}, ${identity.age || 65} సంవత్సరాల ${identity.gender === 'female' ? 'మహిళ' : 'పురుషుడు'}, సంప్రదింపుల కోసం వచ్చారు. కియోస్క్ ఇంటర్వ్యూలో తెలిపిన వివరాలు: "${formattedAnswers}".`
        : language === 'hi'
        ? `मरीज़ ${identity.name || 'मरीज़'}, उम्र ${identity.age || 65}, परामर्श हेतु उपस्थित हुए हैं। साक्षात्कार में दर्ज लक्षण: "${formattedAnswers}"।`
        : `${identity.name || 'Patient'}, a ${identity.age || 65}-year-old ${identity.gender || 'patient'}, presents for consultation. Reported symptoms during kiosk interview: "${formattedAnswers}"`;

      const rawSymptoms = uploadedDocs.length > 0 ? [...reportedFacts, ...baseStory.reportedSymptoms.slice(1)] : reportedFacts;
      const finalSymptoms = rawSymptoms.map((f) => ({
        ...f,
        verificationStatus: factVerificationOverrides[f.id] || f.verificationStatus,
      }));
      const verifiedCount = finalSymptoms.filter((f) => f.verificationStatus === 'doctor-verified').length;

      return {
        ...baseStory,
        summaryParagraph: summaryText,
        chiefComplaint: complaint,
        onsetAndDuration: duration,
        reportedSymptoms: finalSymptoms,
        currentMedications: uploadedDocs.length > 0 ? baseStory.currentMedications : [],
        allergies: uploadedDocs.length > 0 ? baseStory.allergies : [],
        abnormalLabs: uploadedDocs.length > 0 ? baseStory.abnormalLabs : [],
        detectedConflicts: uploadedDocs.length > 0 ? baseStory.detectedConflicts : [],
        medicalTimeline: uploadedDocs.length > 0 ? baseStory.medicalTimeline : [
          {
            id: 'time-01',
            patientId: identity.mrn || 'patient-ramesh-01',
            date: language === 'te' ? 'ఈరోజు' : 'Today',
            year: '2026',
            title: language === 'te' ? 'కియోస్క్ ఇంటర్వ్యూ పూర్తయింది' : 'Kiosk Intake Completed',
            type: 'symptom-onset',
            description: language === 'te' ? `${complaint} కోసం రోగి గైడెడ్ ఇంటర్వ్యూ పూర్తి చేశారు.` : `Patient completed guided interview for ${complaint}.`,
            source: {
              id: 'src-time-01',
              type: 'patient-self-report',
              title: language === 'te' ? 'కియోస్క్ వాయిస్ ఇన్‌టేక్' : 'Kiosk Voice Intake',
              date: language === 'te' ? 'ఈరోజు' : 'Today',
              snippetText: `Interview: ${complaint}`,
              confidence: 'high',
            },
            confidence: 'high',
            tags: ['Interview', 'Intake'],
          },
        ],
        verificationProgress: {
          totalFacts: finalSymptoms.length + (uploadedDocs.length > 0 ? baseStory.currentMedications.length : 0),
          verifiedFacts: verifiedCount + (uploadedDocs.length > 0 ? 1 : 0),
          unverifiedFacts: finalSymptoms.length - verifiedCount,
        },
      };
    }

    const rawSymptoms = baseStory.reportedSymptoms.map((f) => ({
      ...f,
      verificationStatus: factVerificationOverrides[f.id] || f.verificationStatus,
    }));
    const verifiedCount = rawSymptoms.filter((f) => f.verificationStatus === 'doctor-verified').length;

    return {
      ...baseStory,
      reportedSymptoms: rawSymptoms,
      verificationProgress: {
        totalFacts: rawSymptoms.length,
        verifiedFacts: verifiedCount,
        unverifiedFacts: rawSymptoms.length - verifiedCount,
      },
    };
  }, [uploadedDocs, interviewAnswers, identity, language, symptomCategory, factVerificationOverrides]);

  const [isReviewConfirmed, setIsReviewConfirmed] = useState<boolean>(false);

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [currentSpeakingText, setCurrentSpeakingText] = useState<string>('');
  const [textScale, setTextScale] = useState<'normal' | 'large' | 'extra-large'>('normal');

  const questions = getClinicalQuestions(language);
  const voiceConfig = LANGUAGE_VOICE_MAP[language] || LANGUAGE_VOICE_MAP['en'];

  // Refs to hold latest settings so speak() never reads stale closure values
  const accessibilityRef = React.useRef(accessibility);
  const languageRef = React.useRef(language);
  const activeAudioRef = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    accessibilityRef.current = accessibility;
  }, [accessibility]);

  React.useEffect(() => {
    languageRef.current = language;
  }, [language]);

  const stopSpeaking = useCallback(() => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setCurrentSpeakingText('');
  }, []);

  const speak = useCallback(
    (text: string, force = false) => {
      if (typeof window === 'undefined') return;
      if (!force && !accessibilityRef.current.voiceGuidance && !accessibilityRef.current.easyMode) return;

      stopSpeaking();

      const cleanText = text.replace(/["“”«»]/g, '').trim();
      if (!cleanText) return;

      const currentLang = languageRef.current || 'en';
      const voiceCfg = LANGUAGE_VOICE_MAP[currentLang] || LANGUAGE_VOICE_MAP['en'];
      const bcp47 = voiceCfg?.bcp47 || 'en-IN';
      const targetLangCode = currentLang;
      const targetLangPrefix = bcp47.split('-')[0].toLowerCase();

      // For non-English languages (e.g. Telugu, Hindi), use our backend TTS proxy
      if (targetLangCode !== 'en') {
        try {
          const backendTtsUrl = `http://127.0.0.1:8000/api/v1/tts?text=${encodeURIComponent(cleanText)}&lang=${targetLangCode}`;
          const audio = new Audio(backendTtsUrl);
          activeAudioRef.current = audio;

          audio.onplay = () => {
            setIsSpeaking(true);
            setCurrentSpeakingText(cleanText);
          };
          audio.onended = () => {
            setIsSpeaking(false);
            setCurrentSpeakingText('');
            activeAudioRef.current = null;
          };
          audio.onerror = (err) => {
            console.warn('Backend TTS audio error, falling back to WebSpeech:', err);
            if ('speechSynthesis' in window) {
              const utt = new SpeechSynthesisUtterance(cleanText);
              utt.lang = bcp47;
              window.speechSynthesis.speak(utt);
            } else {
              setIsSpeaking(false);
            }
          };

          audio.play().catch((playErr) => {
            console.warn('Audio play autoplay blocked:', playErr);
            if ('speechSynthesis' in window) {
              const utt = new SpeechSynthesisUtterance(cleanText);
              utt.lang = bcp47;
              window.speechSynthesis.speak(utt);
            }
          });
          return;
        } catch (err) {
          console.warn('Failed to initialize backend TTS audio:', err);
        }
      }

      // Check if browser Web Speech API has a voice matching the target language
      const voices = 'speechSynthesis' in window ? window.speechSynthesis.getVoices() : [];
      const matchedVoice = voices.find((v) => {
        const vLang = (v.lang || '').toLowerCase().replace('_', '-');
        const vName = (v.name || '').toLowerCase();
        return (
          vLang === bcp47.toLowerCase() ||
          vLang.startsWith(targetLangPrefix) ||
          vName.includes(targetLangCode) ||
          vName.includes(targetLangPrefix)
        );
      });

      // Try browser WebSpeech first if matching voice is available or language is English
      if ('speechSynthesis' in window) {
        setTimeout(() => {
          try {
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.lang = bcp47;
            utterance.rate = 0.88;

            if (matchedVoice) {
              utterance.voice = matchedVoice;
            }

            utterance.onstart = () => {
              setIsSpeaking(true);
              setCurrentSpeakingText(cleanText);
            };
            utterance.onend = () => {
              setIsSpeaking(false);
              setCurrentSpeakingText('');
            };
            utterance.onerror = () => {
              setIsSpeaking(false);
              setCurrentSpeakingText('');
            };

            window.speechSynthesis.speak(utterance);
          } catch (speakErr) {
            console.warn('SpeechSynthesis speak error:', speakErr);
            setIsSpeaking(false);
          }
        }, 50);
      }
    },
    [stopSpeaking]
  );

  const setEasyMode = (enabled: boolean) => {
    setAccessibility((prev) => ({
      ...prev,
      easyMode: enabled,
      largeText: enabled,
      highContrast: enabled,
      voiceGuidance: enabled,
      audioInstructions: enabled,
      textScale: enabled ? 'large' : 'normal',
    }));
    setTextScale(enabled ? 'large' : 'normal');

    if (enabled) {
      const announcements: Record<string, string> = {
        en: 'Easy mode is now active. Large text, high contrast, and voice assistance are enabled. Tap any question or the speaker icon to hear it read aloud.',
        hi: 'ईज़ी मोड चालू है। बड़े अक्षर, उच्च कंट्रास्ट और वॉयस सहायता सक्रिय हैं।',
        te: 'ఈజీ మోడ్ ఆన్ చేయబడింది. పెద్ద అక్షరాలు, హై కాంట్రాస్ట్ మరియు వాయిస్ సహాయం ప్రారంభించబడ్డాయి.',
        ta: 'எளிதான முறை செயல்படுத்தப்பட்டது. பெரிய எழுத்துக்கள் மற்றும் குரல் வழிகாட்டல் இயங்குகின்றன.',
        bn: 'ইজি মোড চালু করা হয়েছে। বড় লেখা এবং ভয়েস সহায়তা সক্রিয় রয়েছে।',
        mr: 'इझी मोड सुरू झाला आहे. मोठे अक्षर आणि आवाज मार्गदर्शन सक्रिय आहे.',
        gu: 'ઇઝી મોડ શરૂ થઈ ગયો છે. મોટા અક્ષરો અને અવાજ માર્ગદર્શન સક્રિય છે.',
        kn: 'ಈಜಿ ಮೋಡ್ ಸಕ್ರಿಯಗೊಂಡಿದೆ. ದೊಡ್ಡ ಅಕ್ಷರಗಳು ಮತ್ತು ಧ್ವನಿ ಮಾರ್ಗದರ್ಶನ ಸಕ್ರಿಯವಾಗಿದೆ.',
        ml: 'ഈസി മോഡ് സജീവമാക്കി. വലിയ അക്ഷരങ്ങളും ശബ്ദ നിർദ്ദേശങ്ങളും ലഭ്യമാണ്.',
      };
      speak(announcements[language] || announcements['en'], true);
    } else {
      stopSpeaking();
    }
  };

  const toggleAccessibilitySetting = (key: keyof AccessibilitySettings) => {
    setAccessibility((prev) => {
      const nextVal = !prev[key];
      const updated = { ...prev, [key]: nextVal };
      // If toggling easyMode, sync all accessibility options
      if (key === 'easyMode') {
        updated.easyMode = nextVal;
        updated.largeText = nextVal;
        updated.highContrast = nextVal;
        updated.voiceGuidance = nextVal;
        updated.audioInstructions = nextVal;
        updated.textScale = nextVal ? 'large' : 'normal';
      }
      return updated;
    });

    if (key === 'easyMode') {
      const nextVal = !accessibility.easyMode;
      setTextScale(nextVal ? 'large' : 'normal');
      if (nextVal) {
        const announcements: Record<string, string> = {
          en: 'Easy mode is now active. Large text, high contrast, and voice assistance are enabled. Tap any question to hear it read aloud.',
          hi: 'ईज़ी मोड चालू है। बड़े अक्षर, उच्च कंट्रास्ट और वॉयस सहायता सक्रिय हैं।',
          te: 'ఈజీ మోడ్ ఆన్ చేయబడింది. పెద్ద అక్షరాలు, హై కాంట్రాస్ట్ మరియు వాయిస్ సహాయం ప్రారంభించబడ్డాయి.',
        };
        speak(announcements[language] || announcements['en'], true);
      } else {
        stopSpeaking();
      }
    }
  };

  const [intakeSessionId, setIntakeSessionId] = useState<string | null>(null);

  const verifyIdentity = async (customData?: Partial<PatientIdentity>) => {
    setIdentity((prev) => ({ ...prev, ...customData, isVerified: true }));
    try {
      const { IntakeApi } = await import('../services/api/intakeApi');
      const res = await IntakeApi.startIntake({
        patient_id: identity.mrn || 'patient-ramesh-01',
        mode: accessibility.easyMode ? 'EASY' : 'STANDARD',
        language: language,
      });
      if (res.success && res.data) {
        setIntakeSessionId(res.data.id);
      }
    } catch (err) {
      console.error('Failed to start intake session on backend', err);
    }
  };

  const addInterviewAnswer = async (answer: InterviewAnswer) => {
    setInterviewAnswers((prev) => {
      const idx = prev.findIndex((a) => a.questionId === answer.questionId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = answer;
        return copy;
      }
      return [...prev, answer];
    });
    if (intakeSessionId) {
      try {
        const { IntakeApi } = await import('../services/api/intakeApi');
        await IntakeApi.sendMessage(intakeSessionId, answer.answer, language);
      } catch (err) {
        console.error('Failed to send message to backend', err);
      }
    }
  };

  const addDocument = (doc: UploadedDocItem) => {
    setUploadedDocs((prev) => [...prev, doc]);
  };

  const removeDocument = (id: string) => {
    setUploadedDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const updateStoryFactVerification = (factId: string, newStatus: VerificationStatus = 'doctor-verified') => {
    setFactVerificationOverrides((prev) => ({ ...prev, [factId]: newStatus }));
    setPatientStory((prev) => {
      const updatedSymptoms = prev.reportedSymptoms.map((fact) =>
        fact.id === factId ? { ...fact, verificationStatus: newStatus } : fact
      );
      const verifiedCount = updatedSymptoms.filter((f) => f.verificationStatus === 'doctor-verified').length;
      return {
        ...prev,
        reportedSymptoms: updatedSymptoms,
        verificationProgress: {
          ...prev.verificationProgress,
          verifiedFacts: verifiedCount,
          unverifiedFacts: prev.verificationProgress.totalFacts - verifiedCount,
        },
      };
    });
  };

  const t = useCallback(
    (key: string, fallback?: string, params?: Record<string, string | number>) => {
      return getTranslation(language, key, fallback, params);
    },
    [language]
  );


  const [assistanceAlertBanner, setAssistanceAlertBanner] = useState<boolean>(false);

  const requestStaffAssistance = useCallback(
    (reason?: string) => {
      const alertReason = reason || 'Patient tapped Need Help';
      const newAlert: TriageAlert = {
        id: `alert-kiosk-${Date.now()}`,
        patientId: 'patient-ramesh-01',
        token: '#102',
        patientName: identity.name ? `${identity.name} (Kiosk #04)` : 'Kiosk #04 Patient',
        severity: 'immediate',
        triggerTitle: 'Staff Assistance Requested at Kiosk Terminal #04',
        signals: [alertReason, 'Location: Lobby Kiosk #04', 'In-Person Help Needed'],
        receivedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'new',
      };

      if (typeof window !== 'undefined') {
        let existing: TriageAlert[] = INITIAL_TRIAGE_ALERTS;
        const saved = localStorage.getItem('medikiosk_triage_alerts');
        if (saved) {
          try {
            existing = JSON.parse(saved);
          } catch (e) {
            existing = INITIAL_TRIAGE_ALERTS;
          }
        }

        const isDuplicate = existing.some(
          (a) =>
            a.triggerTitle === newAlert.triggerTitle &&
            a.status === 'new' &&
            Date.now() - parseInt(a.id.replace('alert-kiosk-', '') || '0') < 5000
        );

        if (!isDuplicate) {
          const updated = [newAlert, ...existing];
          localStorage.setItem('medikiosk_triage_alerts', JSON.stringify(updated));
          window.dispatchEvent(new CustomEvent('medikiosk_new_alert', { detail: newAlert }));
        }
      }

      setAssistanceAlertBanner(true);
      speak(t('header.nurseAlert'), true);
    },
    [identity.name, speak, t]
  );

  const dismissAssistanceAlert = useCallback(() => {
    setAssistanceAlertBanner(false);
  }, []);

  const refreshPatientStory = async () => {
    try {
      const { httpClient } = await import('../services/api/httpClient');
      const targetId = identity.mrn || 'patient-ramesh-01';
      const res = await httpClient.get<any>(`/patients/${targetId}/story`);
      if (res.success && res.data) {
        setPatientStory(res.data);
      }
    } catch (err) {
      console.warn('Could not refresh live story from backend, retaining current state:', err);
    }
  };

  const resetIntake = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Could not clear sessionStorage:', e);
    }
    setIdentity({
      mrn: MOCK_PATIENT.mrn,
      phone: '9876543210',
      abhaId: '91-8841-2026-90',
      isVerified: true,
      name: MOCK_PATIENT.name,
      age: MOCK_PATIENT.age,
      gender: MOCK_PATIENT.gender,
      department: MOCK_PATIENT.assignedDepartment,
    });
    setInterviewAnswers([]);
    setUploadedDocs([]);
    setIntakeSessionId(null);
    setIsReviewConfirmed(false);
    setRedFlagsDetected(false);
    setSymptomCategory('fever');
    setFactVerificationOverrides({});
  };

  React.useEffect(() => {
    try {
      const dataToSave = {
        language,
        accessibility,
        consent,
        identity,
        interviewAnswers,
        symptomCategory,
        redFlagsDetected,
        uploadedDocs,
        intakeSessionId,
        isReviewConfirmed,
        factVerificationOverrides,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      // Ignore sessionStorage full / unavailable
    }
  }, [
    language,
    accessibility,
    consent,
    identity,
    interviewAnswers,
    symptomCategory,
    redFlagsDetected,
    uploadedDocs,
    intakeSessionId,
    isReviewConfirmed,
    factVerificationOverrides,
  ]);

  return (
    <PatientIntakeContext.Provider
      value={{
        language,
        setLanguage,
        t,
        questions,
        voiceConfig,
        accessibility,
        setAccessibility,
        toggleAccessibilitySetting,
        setEasyMode,
        speak,
        stopSpeaking,
        isSpeaking,
        currentSpeakingText,
        textScale,
        setTextScale,
        assistanceAlertBanner,
        setAssistanceAlertBanner,
        requestStaffAssistance,
        dismissAssistanceAlert,
        consent,
        setConsent,
        identity,
        setIdentity,
        verifyIdentity,
        interviewAnswers,
        addInterviewAnswer,
        symptomCategory,
        setSymptomCategory,
        redFlagsDetected,
        setRedFlagsDetected,
        uploadedDocs,
        addDocument,
        removeDocument,
        patientStory: effectivePatientStory,
        factVerificationOverrides,
        updateStoryFactVerification,
        isReviewConfirmed,
        setIsReviewConfirmed,
        intakeSessionId,
        setIntakeSessionId,
        refreshPatientStory,
        resetIntake,
      }}
    >
      {children}
    </PatientIntakeContext.Provider>
  );
};

export const usePatientIntake = () => {
  const context = useContext(PatientIntakeContext);
  if (!context) {
    throw new Error('usePatientIntake must be used within a PatientIntakeProvider');
  }
  return context;
};
