import React, { useState } from 'react';
import { Mic, MicOff, Volume2, Square, Check, RefreshCw } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { cn } from '../../utils/cn';

export interface VoiceRecorderProps {
  onTranscriptRecorded?: (transcript: string) => void;
  isListening?: boolean;
  questionText?: string;
  className?: string;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscriptRecorded,
  isListening = false,
  questionText,
  className,
}) => {
  const [recording, setRecording] = useState(isListening);
  const [hasTranscript, setHasTranscript] = useState(false);
  const [sampleTranscript, setSampleTranscript] = useState(
    'I have been having chest tightness since yesterday morning after walking up stairs.'
  );

  const toggleRecording = () => {
    if (recording) {
      setRecording(false);
      setHasTranscript(true);
      if (onTranscriptRecorded) onTranscriptRecorded(sampleTranscript);
    } else {
      setRecording(true);
      setHasTranscript(false);
    }
  };

  return (
    <div className={cn('flex flex-col items-center gap-6 p-6 sm:p-8 rounded-kiosk bg-white border border-clinical-border shadow-card text-center max-w-xl mx-auto', className)}>
      {questionText && (
        <div className="flex items-center gap-3 bg-brand-50 p-4 rounded-clinical border border-brand-200 text-brand-950 font-semibold text-lg text-left w-full">
          <Volume2 className="w-6 h-6 text-brand-700 shrink-0" />
          <span>"{questionText}"</span>
        </div>
      )}

      {/* Voice Visualizer Pulsing Circle */}
      <div className="relative flex items-center justify-center my-4">
        {recording && (
          <>
            <div className="absolute w-36 h-36 rounded-full bg-brand-500/20 animate-ping" />
            <div className="absolute w-28 h-28 rounded-full bg-brand-500/30 animate-pulse" />
          </>
        )}

        <button
          type="button"
          onClick={toggleRecording}
          aria-label={recording ? 'Stop recording' : 'Start voice input'}
          className={cn(
            'relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500',
            recording
              ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse scale-105'
              : 'bg-brand-700 text-white hover:bg-brand-800 hover:scale-105'
          )}
        >
          {recording ? <Square className="w-10 h-10 fill-current" /> : <Mic className="w-10 h-10" />}
        </button>
      </div>

      <div className="text-center">
        <span className="text-sm font-semibold uppercase tracking-wider text-clinical-slate block">
          {recording ? 'Listening... Speak clearly in your language' : 'Tap Microphone to Speak'}
        </span>
        <p className="text-xs text-clinical-muted mt-1">
          Supports English, Hindi, Telugu, Tamil, Bengali & 4 more languages
        </p>
      </div>

      {/* Simulated Transcript Feedback */}
      {hasTranscript && (
        <div className="w-full p-4 rounded-clinical bg-slate-50 border border-slate-200 text-left animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
            <span>Voice Recognized Transcript</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> High AI Confidence
            </span>
          </div>
          <p className="text-sm font-medium text-clinical-navy">"{sampleTranscript}"</p>
          <div className="flex items-center justify-end gap-2 mt-3">
            <Button variant="ghost" size="sm" leftIcon={RefreshCw} onClick={() => setHasTranscript(false)}>
              Re-record
            </Button>
            <Button variant="primary" size="sm" leftIcon={Check}>
              Confirm Answer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
