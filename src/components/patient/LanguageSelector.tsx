import React from 'react';
import { SUPPORTED_LANGUAGES, Language } from '../../constants/languages';
import { Check, Globe, Mic } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface LanguageSelectorProps {
  selectedLanguage: string;
  onSelectLanguage: (code: string) => void;
  isKiosk?: boolean;
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onSelectLanguage,
  isKiosk = true,
  className,
}) => {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full', className)}>
      {SUPPORTED_LANGUAGES.map((lang) => {
        const isSelected = selectedLanguage === lang.code;
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => onSelectLanguage(lang.code)}
            className={cn(
              'flex items-center justify-between p-4 sm:p-5 border text-left transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
              isKiosk ? 'rounded-kiosk' : 'rounded-clinical',
              isSelected
                ? 'bg-brand-700 text-white border-brand-700 shadow-md scale-[1.02]'
                : 'bg-white text-clinical-navy border-clinical-border hover:border-brand-500 hover:bg-brand-50/20'
            )}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{lang.flag}</span>
              <div>
                <div className="font-bold text-base sm:text-lg">{lang.nativeName}</div>
                <div className={cn('text-xs font-medium', isSelected ? 'text-brand-100' : 'text-clinical-muted')}>
                  {lang.name}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {lang.voiceSupported && (
                <Mic className={cn('w-4 h-4', isSelected ? 'text-brand-200' : 'text-clinical-muted')} />
              )}
              {isSelected && <Check className="w-6 h-6 text-white stroke-[3]" />}
            </div>
          </button>
        );
      })}
    </div>
  );
};
