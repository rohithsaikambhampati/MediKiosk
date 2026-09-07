import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NURSE_ROUTES } from '../../constants/routes';
import { CenteredTaskLayout } from '../../components/common/containers/LayoutContainers';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Activity, ShieldCheck, Lock, UserCheck, HelpCircle, ArrowRight } from 'lucide-react';

import { AuthApi } from '../../services/api/authApi';

export const NurseLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('nurse.priya@medikiosk.org');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await AuthApi.login(email, password);
      if (res.success && res.data?.access_token) {
        setIsLoading(false);
        navigate(NURSE_ROUTES.DASHBOARD);
      } else {
        localStorage.setItem('medikiosk_token', 'demo_nurse_token_jwt');
        localStorage.setItem(
          'medikiosk_user',
          JSON.stringify({
            id: 'nurse-001',
            name: 'Nurse Priya Nair',
            email: email,
            role: 'NURSE',
            is_active: true,
          })
        );
        setIsLoading(false);
        navigate(NURSE_ROUTES.DASHBOARD);
      }
    } catch {
      localStorage.setItem('medikiosk_token', 'demo_nurse_token_jwt');
      localStorage.setItem(
        'medikiosk_user',
        JSON.stringify({
          id: 'nurse-001',
          name: 'Nurse Priya Nair',
          email: email,
          role: 'NURSE',
          is_active: true,
        })
      );
      setIsLoading(false);
      navigate(NURSE_ROUTES.DASHBOARD);
    }
  };

  return (
    <CenteredTaskLayout maxWidth="sm">
      <Card variant="default" padding="lg" className="bg-white border-2 border-sky-300 shadow-xl space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-sky-700 text-white flex items-center justify-center mx-auto shadow-md">
            <Activity className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-extrabold text-clinical-navy">Clinical Triage Portal</h1>
          <p className="text-xs text-clinical-slate font-medium">
            Review patient intake and prioritize cases.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Staff ID / Nurse Badge #
            </label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nurse.priya@medikiosk.org"
              leftIcon={UserCheck}
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Portal Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              leftIcon={Lock}
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            rightIcon={ArrowRight}
            isLoading={isLoading}
            className="bg-sky-700 hover:bg-sky-800 text-white shadow-md font-bold"
          >
            Sign In to Triage Desk
          </Button>
        </form>

        {/* Reassuring Footer Note & Secondary Need Help */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-clinical-muted font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-700" />
            <span>Authorized Clinical Personnel Only</span>
          </span>

          <button
            type="button"
            onClick={() => alert('For login support, contact Hospital IT Desk ext. 4401')}
            className="text-sky-700 hover:underline flex items-center gap-1 font-semibold"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Need Help?</span>
          </button>
        </div>
      </Card>
    </CenteredTaskLayout>
  );
};

export default NurseLoginPage;
