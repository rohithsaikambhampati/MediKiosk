export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  voiceSupported: boolean;
  sampleGreeting: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', voiceSupported: true, sampleGreeting: 'Welcome to MediKiosk' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', voiceSupported: true, sampleGreeting: 'मेडीकियोस्क में आपका स्वागत है' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', voiceSupported: true, sampleGreeting: 'మెడికియోస్క్ కు స్వాగతం' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', voiceSupported: true, sampleGreeting: 'மெடிகியோஸ்கிற்கு வரவேற்கிறோம்' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳', voiceSupported: true, sampleGreeting: 'মেডিকিয়োস্কে স্বাগতম' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', voiceSupported: true, sampleGreeting: 'मेडीकियोस्कमध्ये आपले स्वागत आहे' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳', voiceSupported: true, sampleGreeting: 'મેડિકિયોસ્કમાં આપનું સ્વાગત છે' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳', voiceSupported: true, sampleGreeting: 'ಮೆಡಿಕಿಯೋಸ್ಕ್‌ಗೆ ಸ್ವಾಗತ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳', voiceSupported: true, sampleGreeting: 'മെഡികിയോസ്കിലേക്ക് സ്വാഗതം' },
];
