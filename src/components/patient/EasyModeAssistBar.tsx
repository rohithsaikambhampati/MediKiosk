import React from 'react';
import { usePatientIntake } from '../../context/PatientIntakeContext';
import { Volume2, VolumeX, Bell, Eye, ZoomIn, ZoomOut, Check, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export const EasyModeAssistBar: React.FC = () => {
  const {
    accessibility,
    setEasyMode,
    isSpeaking,
    currentSpeakingText,
    speak,
    stopSpeaking,
    textScale,
    setTextScale,
    requestStaffAssistance,
    t,
  } = usePatientIntake();

  if (!accessibility.easyMode) return null;

  const handleReadCurrentPage = () => {
    // Extract main heading and text content from main container to read aloud
    const mainEl = document.querySelector('main');
    if (!mainEl) return;
    const headings = Array.from(mainEl.querySelectorAll('h1, h2, h3'))
      .map((h) => h.textContent?.trim())
      .filter(Boolean);
    const textBlocks = Array.from(mainEl.querySelectorAll('p, label, div.text-xs, div.text-sm, span.font-bold, span.font-extrabold, span.font-black'))
      .map((el) => el.textContent?.trim())
      .filter((text) => text && text.length > 8 && !text.startsWith('©') && !text.startsWith('MediKiosk'));

    const fullNarrative = [...headings, ...textBlocks.slice(0, 6)].join('. ');
    if (fullNarrative && fullNarrative.length > 10) {
      speak(fullNarrative, true);
    } else {
      speak('This page is ready. Tap a button to continue, or use the microphone to speak.', true);
    }
  };

  const cycleTextScale = () => {
    if (textScale === 'normal') setTextScale('large');
    else if (textScale === 'large') setTextScale('extra-large');
    else setTextScale('normal');
  };

  return (
    <div
      role="region"
      aria-label="Easy Mode Accessibility Assistant"
      className="bg-amber-400 border-b-4 border-amber-600 text-slate-950 px-4 py-2.5 sticky top-[57px] z-30 shadow-lg flex flex-wrap items-center justify-between gap-3 select-none animate-in slide-in-from-top-2 duration-200"
    >
      {/* Left: Mode Badge & Live Voice Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-amber-950 text-amber-300 px-3 py-1 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider shadow-xs">
          <Eye className="w-4 h-4 stroke-[2.5]" />
          <span>EASY MODE ACTIVE</span>
        </div>

        {/* Live Audio Status */}
        {isSpeaking ? (
          <div className="flex items-center gap-2 bg-white/90 px-3 py-1 rounded-full text-xs sm:text-sm font-bold border-2 border-amber-950 text-slate-900 shadow-xs">
            <div className="flex items-end gap-0.5 h-4">
              <span className="w-1 bg-emerald-600 rounded animate-audio-bar-1" />
              <span className="w-1 bg-emerald-700 rounded animate-audio-bar-2" />
              <span className="w-1 bg-emerald-600 rounded animate-audio-bar-3" />
            </div>
            <span className="truncate max-w-[200px] sm:max-w-xs">
              {currentSpeakingText ? `“${currentSpeakingText.slice(0, 35)}...”` : 'Reading aloud...'}
            </span>
            <button
              type="button"
              onClick={stopSpeaking}
              className="ml-1 text-red-700 hover:text-red-900 font-extrabold flex items-center gap-1 p-0.5"
              title="Stop audio"
            >
              <VolumeX className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleReadCurrentPage}
            className="flex items-center gap-1.5 bg-white text-slate-900 hover:bg-slate-100 px-3 py-1 rounded-full text-xs sm:text-sm font-extrabold border-2 border-slate-900 transition-transform active:scale-95 shadow-xs"
          >
            <Volume2 className="w-4 h-4 text-brand-800 stroke-[2.5]" />
            <span>Read Page Aloud</span>
          </button>
        )}
      </div>

      {/* Right: Text Scaler, Call Nurse, and Exit */}
      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        {/* Font Scaler Pill */}
        <button
          type="button"
          onClick={cycleTextScale}
          className="flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-950 font-black px-3 py-1 rounded-full text-xs sm:text-sm border-2 border-slate-900 transition-colors shadow-xs"
          title="Adjust Text Size"
        >
          <span className="text-xs font-medium">Size:</span>
          <span className="text-sm font-black uppercase text-brand-900">
            {textScale === 'extra-large' ? 'XL' : textScale === 'large' ? 'Large' : 'Normal'}
          </span>
        </button>

        {/* Big High-Visibility Nurse Alert */}
        <button
          type="button"
          onClick={() => requestStaffAssistance('Easy Mode 1-Tap Nurse Request at Kiosk #04')}
          className="flex items-center gap-1.5 bg-red-700 hover:bg-red-800 text-white font-black px-3.5 py-1 rounded-full text-xs sm:text-sm border-2 border-red-950 transition-all shadow-md active:scale-95"
        >
          <Bell className="w-4 h-4 animate-bounce text-amber-300" />
          <span>Call Nurse</span>
        </button>

        {/* Dismiss Easy Mode */}
        <button
          type="button"
          onClick={() => setEasyMode(false)}
          className="p-1 text-slate-800 hover:text-slate-950 hover:bg-amber-500 rounded-full transition-colors"
          title="Turn off Easy Mode"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
