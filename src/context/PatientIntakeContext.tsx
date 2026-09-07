import React, { createContext, useContext, useState, useCallback } from 'react';
import { MOCK_PATIENT, MOCK_PATIENT_STORY } from '../services/mock/mockData';
import { PatientStory } from '../types/story';
import {
  getTranslation,
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
  verifyIdentity: () => void;
  interviewAnswers: InterviewAnswer[];
  addInterviewAnswer: (answer: InterviewAnswer) => void;
  redFlagsDetected: boolean;
  setRedFlagsDetected: (detected: boolean) => void;
  uploadedDocs: UploadedDocItem[];
  addDocument: (doc: UploadedDocItem) => void;
  removeDocument: (id: string) => void;
  patientStory: PatientStory;
  updateStoryFactVerification: (factId: string) => void;
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
    saved?.interviewAnswers || [
    {
      questionId: 'q1',
      question: 'What main problem or symptom brought you to the hospital today?',
      answer: 'I have chest tightness and pressure since yesterday morning.',
      timestamp: '09:16 AM',
      confidence: 'high',
    },
    {
      questionId: 'q2',
      question: 'When did the pain or tightness begin?',
      answer: 'Started yesterday morning after walking up stairs.',
      timestamp: '09:17 AM',
      confidence: 'high',
    },
    {
      questionId: 'q3',
      question: 'Does the pain move to your arm, shoulder, jaw, or back?',
      answer: 'Yes, it spreads toward my left shoulder occasionally.',
      timestamp: '09:18 AM',
      confidence: 'high',
    },
    {
      questionId: 'q4',
      question: 'Are you experiencing sweating or difficulty breathing?',
      answer: 'Yes, sweating and shortness of breath when walking.',
      timestamp: '09:19 AM',
      confidence: 'high',
    },
  ]);

  const [redFlagsDetected, setRedFlagsDetected] = useState<boolean>(true);

  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocItem[]>([
    {
      id: 'doc-1',
      fileName: 'CityHospital_DischargeSummary_2024.pdf',
      fileType: 'application/pdf',
      documentType: 'Discharge Summary',
      uploadDate: '14 Oct 2024',
      status: 'ready',
      extractedFactsCount: 5,
    },
    {
      id: 'doc-2',
      fileName: 'Prescription_Feb2025.jpg',
      fileType: 'image/jpeg',
      documentType: 'Prescription',
      uploadDate: '03 Feb 2025',
      status: 'ready',
      extractedFactsCount: 3,
    },
  ]);

  const [patientStory, setPatientStory] = useState<PatientStory>(MOCK_PATIENT_STORY);
  const [isReviewConfirmed, setIsReviewConfirmed] = useState<boolean>(false);

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [currentSpeakingText, setCurrentSpeakingText] = useState<string>('');
  const [textScale, setTextScale] = useState<'normal' | 'large' | 'extra-large'>('normal');

  const questions = getClinicalQuestions(language);
  const voiceConfig = LANGUAGE_VOICE_MAP[language] || LANGUAGE_VOICE_MAP['en'];

  // Ref to always hold latest accessibility so speak() never reads stale closure values
  const accessibilityRef = React.useRef(accessibility);
  React.useEffect(() => {
    accessibilityRef.current = accessibility;
  }, [accessibility]);

  const speak = useCallback(
    (text: string, force = false) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      if (!force && !accessibilityRef.current.voiceGuidance && !accessibilityRef.current.easyMode) return;

      try {
        window.speechSynthesis.cancel();
        const cleanText = text.replace(/["“”«»]/g, '').trim();
        if (!cleanText) return;

        // Chromium speech engine timing fix
        setTimeout(() => {
          try {
            const utterance = new SpeechSynthesisUtterance(cleanText);
            const bcp47 = voiceConfig?.bcp47 || 'en-IN';
            utterance.lang = bcp47;
            utterance.rate = 0.88; // Slightly deliberate for elderly/accessible listening

            const voices = window.speechSynthesis.getVoices();
            if (voices && voices.length > 0) {
              const matchedVoice =
                voices.find((v) => v.lang === bcp47) ||
                voices.find((v) => v.lang.replace('_', '-').startsWith(bcp47.split('-')[0]));
              if (matchedVoice) {
                utterance.voice = matchedVoice;
              }
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
      } catch (err) {
        console.warn('Speech synthesis error:', err);
        setIsSpeaking(false);
      }
    },
    [voiceConfig]
  );

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentSpeakingText('');
    }
  }, []);

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

  const verifyIdentity = async () => {
    setIdentity((prev) => ({ ...prev, isVerified: true }));
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
    setInterviewAnswers((prev) => [...prev, answer]);
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

  const updateStoryFactVerification = (factId: string) => {
    setPatientStory((prev) => {
      const updatedSymptoms = prev.reportedSymptoms.map((fact) =>
        fact.id === factId ? { ...fact, verificationStatus: 'doctor-verified' as const } : fact
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
  };

  React.useEffect(() => {
    try {
      const dataToSave = {
        language,
        accessibility,
        consent,
        identity,
        interviewAnswers,
        redFlagsDetected,
        uploadedDocs,
        intakeSessionId,
        isReviewConfirmed,
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
    redFlagsDetected,
    uploadedDocs,
    intakeSessionId,
    isReviewConfirmed,
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
        redFlagsDetected,
        setRedFlagsDetected,
        uploadedDocs,
        addDocument,
        removeDocument,
        patientStory,
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
