import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Camera, RefreshCw, CheckCircle2, X } from 'lucide-react';

export interface CameraScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaptureDocument: (fileName: string, docType: string) => void;
}

export const CameraScanModal: React.FC<CameraScanModalProps> = ({
  isOpen,
  onClose,
  onCaptureDocument,
}) => {
  const [step, setStep] = useState<'scan' | 'preview'>('scan');
  const [docType, setDocType] = useState('Prescription');

  const handleCapture = () => {
    setStep('preview');
  };

  const handleUseDocument = () => {
    onCaptureDocument(`Camera_Scan_${Date.now().toString().slice(-4)}.jpg`, docType);
    setStep('scan');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Camera Document Scanner" size="md">
      <div className="space-y-4">
        {step === 'scan' ? (
          <>
            {/* Viewfinder Frame overlay */}
            <div className="relative w-full h-64 bg-slate-950 rounded-clinical flex flex-col items-center justify-center border-4 border-dashed border-brand-400 overflow-hidden shadow-inner">
              <div className="absolute inset-4 border-2 border-white/60 rounded-lg pointer-events-none flex flex-col justify-between p-2">
                <span className="text-[10px] uppercase tracking-widest text-white/80 font-bold">Document Frame Target</span>
                <span className="text-[10px] text-white/70 text-right">Hold steady</span>
              </div>

              <div className="text-center text-white space-y-1 z-10 px-4">
                <Camera className="w-10 h-10 mx-auto text-brand-300 animate-pulse" />
                <p className="font-bold text-sm">Position your document inside the frame</p>
                <p className="text-xs text-slate-300">Ensure good lighting and avoid reflections.</p>
              </div>
            </div>

            {/* Document Type Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-clinical-navy uppercase tracking-wider">Document Type</label>
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {['Prescription', 'Lab Report', 'Discharge Summary', 'Blood Report'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setDocType(type)}
                    className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all ${
                      docType === type
                        ? 'bg-brand-700 text-white border-brand-700'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" size="md" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="kiosk" size="md" leftIcon={Camera} onClick={handleCapture}>
                Capture Photo
              </Button>
            </div>
          </>
        ) : (
          /* Captured Preview */
          <>
            <div className="relative w-full h-64 bg-slate-100 rounded-clinical flex flex-col items-center justify-center border border-slate-300 p-4">
              <div className="w-full h-full bg-white border border-slate-200 rounded shadow-sm p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold text-xs text-clinical-navy">{docType} Captured</span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                    Good Sharpness
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-600 space-y-1 my-auto">
                  <p>Rx: City Care Hospital</p>
                  <p>Date: March 2025</p>
                  <p>Rx Item: Metformin 500mg BD</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <Button variant="ghost" size="md" leftIcon={RefreshCw} onClick={() => setStep('scan')}>
                Retake
              </Button>

              <Button variant="kiosk" size="md" leftIcon={CheckCircle2} onClick={handleUseDocument}>
                Use Document
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
