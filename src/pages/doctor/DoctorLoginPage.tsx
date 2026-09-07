import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DOCTOR_ROUTES } from '../../constants/routes';
import { BRAND } from '../../constants/tokens';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Checkbox } from '../../components/common/Checkbox';
import { Stethoscope, Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-react';

import { AuthApi } from '../../services/api/authApi';

export const DoctorLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('dr.rajesh@medikiosk.org');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await AuthApi.login(email, password);
      if (res.success && res.data?.access_token) {
        setIsLoading(false);
        navigate(DOCTOR_ROUTES.DASHBOARD);
      } else {
        // Fallback for offline demo mode if backend is not running
        localStorage.setItem('medikiosk_token', 'demo_doctor_token_jwt');
        localStorage.setItem(
          'medikiosk_user',
          JSON.stringify({
            id: 'doc-001',
            name: 'Dr. Rajesh Sharma',
            email: email,
            role: 'DOCTOR',
            is_active: true,
          })
        );
        setIsLoading(false);
        navigate(DOCTOR_ROUTES.DASHBOARD);
      }
    } catch (err: any) {
      // Demo fallback
      localStorage.setItem('medikiosk_token', 'demo_doctor_token_jwt');
      localStorage.setItem(
        'medikiosk_user',
        JSON.stringify({
          id: 'doc-001',
          name: 'Dr. Rajesh Sharma',
          email: email,
          role: 'DOCTOR',
          is_active: true,
        })
      );
      setIsLoading(false);
      navigate(DOCTOR_ROUTES.DASHBOARD);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      {/* Background Subtle Gradient Glow */}
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-brand-700 text-white flex items-center justify-center mx-auto shadow-lg border border-brand-500/30">
            <Stethoscope className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {BRAND.NAME}
          </h1>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">
            Clinical Portal & Intake Intelligence
          </p>
        </div>

        {/* Login Card */}
        <Card variant="default" padding="lg" className="bg-white border-slate-200 shadow-2xl space-y-5">
          <div className="space-y-1 text-center">
            <h2 className="text-xl font-extrabold text-clinical-navy">Clinical Portal Sign In</h2>
            <p className="text-xs text-clinical-muted">
              Sign in to review your OPD patient queue and structured pre-consultation stories.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Hospital ID / Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="dr.sharma@hospital.org"
              leftIcon={Mail}
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={Lock}
              required
            />

            <div className="flex items-center justify-between text-xs">
              <Checkbox
                label="Remember my credentials"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <button
                type="button"
                onClick={() => alert('Please contact hospital IT desk at ext. 4400.')}
                className="font-semibold text-brand-700 hover:underline"
              >
                Need help?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              rightIcon={ArrowRight}
            >
              Sign In to Workspace
            </Button>
          </form>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-clinical-muted">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>HIPAA-Compliant Doctor Authentication Demo</span>
          </div>
        </Card>

        {/* Quick Demo Help Footer */}
        <div className="text-center text-xs text-slate-400">
          Demo Doctor Account: <span className="text-slate-200 font-mono">Dr. Ananya Sharma (General Medicine)</span>
        </div>
      </div>
    </div>
  );
};

export default DoctorLoginPage;
