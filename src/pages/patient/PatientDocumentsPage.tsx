import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATIENT_ROUTES } from '../../constants/routes';
import { usePatientIntake } from '../../context/PatientIntakeContext';
import { PageContainer } from '../../components/common/containers/LayoutContainers';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { CameraScanModal } from '../../components/patient/CameraScanModal';
import { Camera, Upload, FileText, Trash2, CheckCircle2, ArrowRight, ArrowLeft, Plus } from 'lucide-react';
import { cn } from '../../utils/cn';

export const PatientDocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { identity, uploadedDocs, addDocument, removeDocument, accessibility, speak, stopSpeaking, t, language } = usePatientIntake();
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

  React.useEffect(() => {
    if (accessibility.voiceGuidance || accessibility.easyMode) {
      const timer = setTimeout(() => {
        const docPrompts: Record<string, string> = {
          en: 'Document scanning stage. If you have brought prescriptions or lab reports, you can scan them using the camera. If you do not have any papers, tap Skip Documents to continue.',
          hi: 'दस्तावेज़ स्कैनिंग चरण। यदि आप पर्चे या लैब रिपोर्ट लाए हैं, तो आप उन्हें कैमरे से स्कैन कर सकते हैं। यदि आपके पास कोई कागजात नहीं हैं, तो आगे बढ़ने के लिए स्किप करें।',
          te: 'పత్రాల స్కానింగ్ దశ. మీరు ప్రిస్క్రిప్షన్లు లేదా లాబ్ నివేదికలను తెచ్చినట్లయితే, కెమెరాతో స్కాన్ చేయవచ్చు. కాగితాలు లేకపోతే దాటవేయి నొక్కండి.',
          ta: 'ஆவணங்கள் ஸ்கேனிங் படி. பிரஸ்கிரிப்ஷன் அல்லது லேப் அறிக்கைகளை கேமரா மூலம் ஸ்கேன் செய்யலாம். ஆவணங்கள் இல்லை என்றால் தவிர்க்கவும்.',
          bn: 'নথি স্ক্যানিং ধাপ। আপনার কাছে প্রেসক্রিপশন বা ল্যাব রিপোর্ট থাকলে ক্যামেরার মাধ্যমে স্ক্যান করতে পারেন। নথি না থাকলে স্কিপ করুন।',
          mr: 'दस्तऐवज स्कॅनिंग टप्पा. तुमच्याकडे प्रिस्क्रिप्शन किंवा लॅब रिपोर्ट असल्यास कॅमेऱ्याने स्कॅन करू शकता. कागदपत्रे नसल्यास पुढे जाण्यासाठी स्किप दाबा.',
          gu: 'દસ્તાવેજ સ્કેનિંગ તબક્કો. જો તમે પ્રિસ્ક્રિપ્શન અથવા લેબ રિપોર્ટ લાવ્યા હોવ, તો તેને કેમેરાથી સ્કેન કરી શકો છો. જો કાગળ ન હોય તો આગળ વધો.',
          kn: 'ದಾಖಲೆಗಳ ಸ್ಕ್ಯಾನಿಂಗ್ ಹಂತ. ನಿಮ್ಮ ಬಳಿ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಅಥವಾ ಲ್ಯಾಬ್ ವರದಿಗಳಿದ್ದರೆ ಕ್ಯಾಮೆರಾದಿಂದ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ. ದಾಖಲೆಗಳಿಲ್ಲದಿದ್ದರೆ ಸ್ಕಿಪ್ ಮಾಡಿ.',
          ml: 'രേഖകൾ സ്കാൻ ചെയ്യുന്ന ഘട്ടം. പ്രിസ്ക്രിപ്ഷനുകളോ ലാബ് റിപ്പോർട്ടുകളോ ഉണ്ടെങ്കിൽ ക്യാമറ ഉപയോഗിച്ച് സ്കാൻ ചെയ്യാം. രേഖകൾ ഇല്ലെങ്കിൽ സ്കിപ്പ് ചെയ്യുക.',
        };
        speak(docPrompts[language] || docPrompts['en']);
      }, 400);
      return () => {
        clearTimeout(timer);
        stopSpeaking();
      };
    }
  }, [accessibility.voiceGuidance, accessibility.easyMode, speak, stopSpeaking, language]);

  const handleLoadDemoDocs = async () => {
    setIsLoadingDemo(true);
    try {
      const { DocumentApi } = await import('../../services/api/documentApi');
      const docs = await DocumentApi.seedDemoDocuments('patient-ramesh-01');
      docs.forEach((doc) => {
        addDocument({
          id: doc.id,
          fileName: doc.file_name,
          fileType: doc.mime_type,
          documentType: doc.document_type.replace('_', ' ').toLowerCase(),
          uploadDate: 'Demo Record',
          status: 'ready',
          extractedFactsCount: doc.extracted_facts_count || 4,
        });
      });
    } catch (err) {
      console.error('Failed to seed demo records, falling back to mock:', err);
      addDocument({
        id: `demo-doc-rx-${Date.now()}`,
        fileName: 'Prescription_Feb2025.jpg',
        fileType: 'image/jpeg',
        documentType: 'Prescription',
        uploadDate: 'Demo Record',
        status: 'ready',
        extractedFactsCount: 4,
      });
      addDocument({
        id: `demo-doc-lab-${Date.now() + 1}`,
        fileName: 'Lipid_Panel_Report.pdf',
        fileType: 'application/pdf',
        documentType: 'Lab Report',
        uploadDate: 'Demo Record',
        status: 'ready',
        extractedFactsCount: 6,
      });
    } finally {
      setIsLoadingDemo(false);
    }
  };

  const handleSimulateFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const f = files[0];
      setIsUploading(true);
      try {
        const { DocumentService } = await import('../../services/api/client');
        const patientId = identity.mrn || 'patient-ramesh-01';
        const doc = await DocumentService.uploadDocument(f, patientId);
        
        addDocument({
          id: doc.id || `doc-${Date.now()}`,
          fileName: doc.fileName || f.name,
          fileType: doc.fileType || f.type || 'application/pdf',
          documentType: doc.documentType || (f.name.toLowerCase().includes('prescription') ? 'Prescription' : f.name.toLowerCase().includes('lab') ? 'Lab Report' : 'Discharge Summary'),
          uploadDate: 'Today',
          status: 'ready',
          extractedFactsCount: doc.extractedFactsCount || 4,
        });
      } catch (err) {
        console.warn("Backend upload offline or failed, adding document locally to context:", err);
        addDocument({
          id: `doc-${Date.now()}`,
          fileName: f.name,
          fileType: f.type || (f.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
          documentType: f.name.toLowerCase().includes('prescription')
            ? 'Prescription'
            : f.name.toLowerCase().includes('lab')
            ? 'Lab Report'
            : 'Discharge Summary',
          uploadDate: 'Today',
          status: 'ready',
          extractedFactsCount: 4,
        });
      } finally {
        setIsUploading(false);
        e.target.value = '';
      }
    }
  };

  const handleCapturedDoc = (fileName: string, docType: string) => {
    addDocument({
      id: `doc-${Date.now()}`,
      fileName,
      fileType: 'image/jpeg',
      documentType: docType,
      uploadDate: 'Today',
      status: 'ready',
      extractedFactsCount: 3,
    });
  };

  return (
    <PageContainer
      title={t('docs.title')}
      subtitle={t('docs.subtitle')}
      maxWidth="xl"
    >
      {/* Easy Mode Skip Documents Fast-Track Banner */}
      {accessibility.easyMode && (
        <Card
          variant="interactive"
          padding="lg"
          onClick={() => navigate(PATIENT_ROUTES.DOCUMENT_PROCESSING)}
          className="mb-6 border-3 border-amber-500 bg-amber-50 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer hover:bg-amber-100/80 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-2xl shadow-sm shrink-0">
              ➔
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-amber-900">
                {t('docs.skipFastTrackTitle')}
              </div>
              <h3 className="font-black text-xl text-slate-950">
                {t('docs.skipFastTrackDesc')}
              </h3>
              <p className="text-sm font-semibold text-slate-700 mt-0.5">
                {t('docs.skipFastTrackHelp')}
              </p>
            </div>
          </div>
          <Button
            variant="kiosk"
            size="lg"
            onClick={() => navigate(PATIENT_ROUTES.DOCUMENT_PROCESSING)}
            className="w-full sm:w-auto shrink-0 bg-slate-950 hover:bg-slate-900 text-white font-black text-base px-6 py-4"
          >
            {t('docs.skipFastTrackBtn')}
          </Button>
        </Card>
      )}

      {/* Document Scanner Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Camera Scan Touch Card */}
        <Card
          variant="interactive"
          padding="lg"
          onClick={() => setIsCameraModalOpen(true)}
          className="flex flex-col items-center justify-center text-center gap-3 bg-brand-50/50 border-2 border-brand-300 hover:border-brand-700 cursor-pointer min-h-[140px] shadow-sm"
        >
          <div className="w-12 h-12 rounded-full bg-brand-700 text-white flex items-center justify-center shadow-md">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-clinical-navy">{t('docs.scanCard')}</h3>
            <p className="text-xs text-clinical-muted mt-0.5">{t('docs.scanCardDesc')}</p>
          </div>
        </Card>

        {/* Upload File Card */}
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleSimulateFileUpload}
            className="hidden"
          />
          <Card
            variant="interactive"
            padding="lg"
            className="flex flex-col items-center justify-center text-center gap-3 bg-white border-2 border-clinical-border hover:border-brand-300 min-h-[140px]"
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
              <Upload className="w-6 h-6 text-brand-700" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-clinical-navy">{t('docs.uploadCard')}</h3>
              <p className="text-xs text-clinical-muted mt-0.5">{t('docs.uploadCardDesc')}</p>
            </div>
          </Card>
        </label>
      </div>

      {/* Uploaded Documents Roster */}
      <Card variant="default" padding="md" className="space-y-4 mb-6 bg-white border-clinical-border">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-bold text-sm text-clinical-navy uppercase tracking-wider">
            {t('docs.rosterTitle')} ({uploadedDocs.length})
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadDemoDocs}
              disabled={isLoadingDemo}
              className="text-xs font-semibold text-brand-700 hover:bg-brand-50"
            >
              {isLoadingDemo ? 'Seeding Records...' : '⚡ Seed Demo Records'}
            </Button>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {t('docs.readyBadge')}
            </span>
          </div>
        </div>

        {uploadedDocs.length === 0 ? (
          <div className="text-center py-8 text-xs text-clinical-muted">
            {t('docs.emptyText')}
          </div>
        ) : (
          <div className="space-y-3">
            {uploadedDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-3.5 rounded-clinical bg-slate-50 border border-slate-200 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded bg-white border border-slate-200 text-brand-700 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-clinical-navy">{doc.fileName}</span>
                      <span className="text-[11px] font-bold text-brand-900 bg-brand-100 px-2 py-0.2 rounded">
                        {doc.documentType}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-clinical-muted mt-0.5">
                      <span>Uploaded: {doc.uploadDate}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-semibold">
                        {t('docs.factsCount', `${doc.extractedFactsCount} facts identified`, {
                          count: doc.extractedFactsCount,
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={Trash2}
                  onClick={() => removeDocument(doc.id)}
                  className="text-red-600 hover:text-red-800 shrink-0"
                >
                  {t('btn.remove')}
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Navigation Actions */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-clinical-border w-full">
        <Button
          variant="outline"
          size="lg"
          leftIcon={ArrowLeft}
          onClick={() => navigate(PATIENT_ROUTES.CONVERSATION)}
        >
          {t('btn.back')}
        </Button>

        <Button
          variant="kiosk"
          size="lg"
          rightIcon={ArrowRight}
          onClick={() => navigate(PATIENT_ROUTES.DOCUMENT_PROCESSING)}
          className={cn(
            accessibility.easyMode &&
              'bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg px-8 py-5 min-h-[60px] shadow-lg border-2 border-emerald-800'
          )}
        >
          {accessibility.easyMode ? 'PROCEED TO DOCTOR SUMMARY ➔' : t('docs.processBtn')}
        </Button>
      </div>

      {/* Camera Scan Modal */}
      <CameraScanModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCaptureDocument={handleCapturedDoc}
      />
    </PageContainer>
  );
};

export default PatientDocumentsPage;
