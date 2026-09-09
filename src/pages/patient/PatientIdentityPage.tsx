import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATIENT_ROUTES } from '../../constants/routes';
import { usePatientIntake, PatientIdentity } from '../../context/PatientIntakeContext';
import { PageContainer } from '../../components/common/containers/LayoutContainers';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Avatar } from '../../components/common/Avatar';
import { Phone, CreditCard, Link2, CheckCircle2, ArrowRight, ArrowLeft, HelpCircle, UserPlus, UserCheck } from 'lucide-react';
import { cn } from '../../utils/cn';

export const PatientIdentityPage: React.FC = () => {
  const navigate = useNavigate();
  const { identity, verifyIdentity, requestStaffAssistance, accessibility, speak, stopSpeaking, t, language } = usePatientIntake();
  const [tab, setTab] = useState<'phone' | 'mrn' | 'abha'>('phone');
  const [inputValue, setInputValue] = useState('9876543210');
  const [isVerifying, setIsVerifying] = useState(false);

  // New patient registration state for unrecognized phone numbers / MRNs
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState('32');
  const [newGender, setNewGender] = useState<'male' | 'female' | 'other'>('male');
  const [newDept, setNewDept] = useState('General Medicine');

  React.useEffect(() => {
    if (accessibility.voiceGuidance || accessibility.easyMode) {
      const timer = setTimeout(() => {
        const identityPrompts: Record<string, string> = {
          en: 'Identity verification. Please enter your mobile number or MRN, or tap 1-Tap Check-In.',
          hi: 'पहचान सत्यापन। कृपया अपना मोबाइल नंबर या एमआरएन दर्ज करें।',
          te: 'గుర్తింపు సరిచూడటం. దయచేసి మీ మొబైల్ సంఖ్య లేదా MRN నమోదు చేయండి.',
        };
        speak(identityPrompts[language] || identityPrompts['en']);
      }, 400);
      return () => {
        clearTimeout(timer);
        stopSpeaking();
      };
    }
  }, [accessibility.voiceGuidance, accessibility.easyMode, speak, stopSpeaking, language]);

  const handleSimulateVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      const cleanVal = inputValue.trim();

      // Check if it's Ramesh Kumar's default demo phone/MRN/ABHA
      if (cleanVal === '9876543210' || cleanVal === 'MRN-90214' || cleanVal === '91-8841-2026-90' || cleanVal.toLowerCase().includes('ramesh')) {
        setShowNewPatientForm(false);
        verifyIdentity({
          name: 'Ramesh Kumar',
          age: 68,
          gender: 'male',
          department: 'Cardiology',
          phone: '9876543210',
          mrn: 'MRN-90214',
          abhaId: '91-8841-2026-90',
        });
      } else {
        // Different phone number or new patient -> show new patient details form
        setShowNewPatientForm(true);
        if (!newName) {
          setNewName('');
        }
      }
    }, 600);
  };

  const handleRegisterNewPatient = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const generatedMrn = `MRN-${Math.floor(10000 + Math.random() * 90000)}`;
    const finalName = newName.trim() || 'Guest Patient';

    verifyIdentity({
      name: finalName,
      age: parseInt(newAge) || 30,
      gender: newGender,
      department: newDept,
      phone: tab === 'phone' ? inputValue : '9876543210',
      mrn: tab === 'mrn' ? inputValue : generatedMrn,
      abhaId: tab === 'abha' ? inputValue : 'Not Linked',
    });

    setShowNewPatientForm(false);
    navigate(PATIENT_ROUTES.INTAKE);
  };

  return (
    <PageContainer
      title={t('identity.title', 'Patient Identification')}
      subtitle={t('identity.subtitle', 'Enter your registered mobile number or MRN to look up your details.')}
      maxWidth="md"
    >
      {/* Easy Mode 1-Tap Check-In Banner */}
      {accessibility.easyMode && (
        <Card
          variant="interactive"
          padding="lg"
          onClick={() => {
            setInputValue('9876543210');
            setShowNewPatientForm(false);
            verifyIdentity({
              name: 'Ramesh Kumar',
              age: 68,
              gender: 'male',
              department: 'Cardiology',
              phone: '9876543210',
              mrn: 'MRN-90214',
            });
          }}
          className="mb-6 border-3 border-amber-500 bg-amber-50 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer hover:bg-amber-100/80 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-2xl shadow-sm shrink-0">
              ⚡
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-amber-900">
                1-Tap Easy Check-In (Demo Patient)
              </div>
              <h3 className="font-black text-xl text-slate-950">
                Check In as Ramesh Kumar (Age 68)
              </h3>
              <p className="text-sm font-semibold text-slate-700 mt-0.5">
                Tap here to verify automatically without typing on the keyboard.
              </p>
            </div>
          </div>
          <Button
            variant="kiosk"
            size="lg"
            className="w-full sm:w-auto shrink-0 bg-slate-950 hover:bg-slate-900 text-white font-black text-base px-6 py-4"
          >
            Check In Now
          </Button>
        </Card>
      )}

      {/* Identity Method Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <button
          type="button"
          onClick={() => {
            setTab('phone');
            setInputValue('9876543210');
            setShowNewPatientForm(false);
          }}
          className={cn(
            'flex items-center justify-center gap-2.5 p-3.5 rounded-clinical border-2 font-bold text-xs sm:text-sm transition-all',
            tab === 'phone'
              ? 'border-brand-700 bg-brand-50 text-brand-900 shadow-sm ring-1 ring-brand-700'
              : 'border-clinical-border bg-white text-clinical-slate hover:border-brand-300'
          )}
        >
          <Phone className="w-5 h-5 text-brand-700 shrink-0" />
          <span className="truncate">{t('identity.tabPhone', 'Mobile Number')}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setTab('mrn');
            setInputValue('MRN-90214');
            setShowNewPatientForm(false);
          }}
          className={cn(
            'flex items-center justify-center gap-2.5 p-3.5 rounded-clinical border-2 font-bold text-xs sm:text-sm transition-all',
            tab === 'mrn'
              ? 'border-brand-700 bg-brand-50 text-brand-900 shadow-sm ring-1 ring-brand-700'
              : 'border-clinical-border bg-white text-clinical-slate hover:border-brand-300'
          )}
        >
          <CreditCard className="w-5 h-5 text-brand-700 shrink-0" />
          <span className="truncate">{t('identity.tabMrn', 'Hospital MRN')}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setTab('abha');
            setInputValue('91-8841-2026-90');
            setShowNewPatientForm(false);
          }}
          className={cn(
            'flex items-center justify-center gap-2.5 p-3.5 rounded-clinical border-2 font-bold text-xs sm:text-sm transition-all',
            tab === 'abha'
              ? 'border-brand-700 bg-brand-50 text-brand-900 shadow-sm ring-1 ring-brand-700'
              : 'border-clinical-border bg-white text-clinical-slate hover:border-brand-300'
          )}
        >
          <Link2 className="w-5 h-5 text-brand-700 shrink-0" />
          <span className="truncate">{t('identity.tabAbha', 'ABHA Health ID')}</span>
        </button>
      </div>

      {/* Input Field Form */}
      <Card variant="default" padding="lg" className="space-y-4 mb-6 bg-white border-clinical-border">
        <Input
          label={
            tab === 'phone'
              ? t('identity.phoneLabel', 'Mobile Phone Number')
              : tab === 'mrn'
              ? t('identity.mrnLabel', 'Hospital MRN Number')
              : t('identity.abhaLabel', 'ABHA Health Record ID')
          }
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowNewPatientForm(false);
          }}
          placeholder="Enter phone number or MRN..."
          isKiosk
          leftIcon={tab === 'phone' ? Phone : tab === 'mrn' ? CreditCard : Link2}
        />

        <Button
          variant="secondary"
          size="md"
          fullWidth
          isLoading={isVerifying}
          onClick={handleSimulateVerify}
        >
          {t('identity.verifyBtn', 'Look Up Patient Record')}
        </Button>
      </Card>

      {/* New Patient Registration Form (Triggered when non-Ramesh phone is entered) */}
      {showNewPatientForm && (
        <Card variant="default" padding="lg" className="mb-6 bg-brand-50/70 border-2 border-brand-300 shadow-md space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3 pb-3 border-b border-brand-200">
            <div className="w-10 h-10 rounded-full bg-brand-700 text-white flex items-center justify-center font-bold shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-brand-950">New Patient Check-In / Registration</h3>
              <p className="text-xs text-brand-800">
                No existing record found for <strong>{inputValue}</strong>. Please enter patient details:
              </p>
            </div>
          </div>

          <form onSubmit={handleRegisterNewPatient} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">
                Patient Full Name *
              </label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                required
                isKiosk
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">
                  Age (Years) *
                </label>
                <Input
                  type="number"
                  value={newAge}
                  onChange={(e) => setNewAge(e.target.value)}
                  placeholder="30"
                  required
                  isKiosk
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">
                  Gender *
                </label>
                <select
                  value={newGender}
                  onChange={(e) => setNewGender(e.target.value as 'male' | 'female' | 'other')}
                  className="w-full p-3 rounded-lg border-2 border-slate-300 bg-white font-bold text-slate-900 text-sm focus:border-brand-600 focus:outline-none"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">
                Assigned Department / Speciality
              </label>
              <select
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                className="w-full p-3 rounded-lg border-2 border-slate-300 bg-white font-bold text-slate-900 text-sm focus:border-brand-600 focus:outline-none"
              >
                <option value="General Medicine">General Medicine</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="ENT / Otolaryngology">ENT / Otolaryngology</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Pulmonology">Pulmonology</option>
              </select>
            </div>

            <Button
              type="submit"
              onClick={handleRegisterNewPatient}
              variant="primary"
              size="lg"
              fullWidth
              leftIcon={UserCheck}
              className="bg-brand-700 hover:bg-brand-800 text-white font-black text-base py-3.5 cursor-pointer"
            >
              Complete Check-In as {newName.trim() || 'New Patient'} ➔
            </Button>
          </form>
        </Card>
      )}

      {/* Verification Result Card */}
      {identity.isVerified && !showNewPatientForm && (
        <Card
          variant="default"
          padding="lg"
          className={cn(
            'border-2 border-emerald-500 bg-emerald-50/60 mb-6 shadow-sm',
            accessibility.easyMode && 'border-4 border-emerald-600 bg-emerald-50 p-6'
          )}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar name={identity.name} roleBadge="PAT" size="lg" />
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  <h3 className="font-extrabold text-lg text-clinical-navy">{identity.name}</h3>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                    {t('identity.verifiedBadge', 'Verified Patient')}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs sm:text-sm text-clinical-muted mt-1.5 flex-wrap">
                  <span>{t('identity.age', 'Age')}: <strong className="text-slate-900 font-black">{identity.age}y</strong></span>
                  <span>{t('identity.gender', 'Gender')}: <strong className="text-slate-900 font-black">{identity.gender.toUpperCase()}</strong></span>
                  <span>{t('identity.mrn', 'MRN')}: <strong className="text-slate-900 font-mono font-black">{identity.mrn}</strong></span>
                  <span>{t('identity.dept', 'Dept')}: <strong className="text-brand-800 font-black">{identity.department}</strong></span>
                </div>
              </div>
            </div>

            {accessibility.easyMode && (
              <Button
                variant="kiosk"
                size="lg"
                rightIcon={ArrowRight}
                onClick={() => navigate(PATIENT_ROUTES.INTAKE)}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg px-8 py-5 min-h-[60px] shadow-md shrink-0"
              >
                CONTINUE TO INTAKE ➔
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-clinical-border w-full">
        <Button
          variant="ghost"
          size="md"
          leftIcon={HelpCircle}
          onClick={() => requestStaffAssistance('Identity verification assistance requested')}
          className="text-slate-600 font-semibold"
        >
          {t('btn.staffAssistance', 'Staff Assistance')}
        </Button>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="lg"
            leftIcon={ArrowLeft}
            onClick={() => navigate(PATIENT_ROUTES.CONSENT)}
          >
            {t('btn.back', 'Back')}
          </Button>

          <Button
            variant="kiosk"
            size="lg"
            disabled={!identity.isVerified}
            rightIcon={ArrowRight}
            onClick={() => navigate(PATIENT_ROUTES.INTAKE)}
          >
            {t('btn.continue', 'Continue')}
          </Button>
        </div>
      </div>
    </PageContainer>
  );
};

export default PatientIdentityPage;
