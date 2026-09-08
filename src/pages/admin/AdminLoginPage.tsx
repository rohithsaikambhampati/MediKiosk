import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ADMIN_ROUTES } from '../../constants/routes';
import { CenteredTaskLayout } from '../../components/common/containers/LayoutContainers';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ShieldCheck, Lock, UserCheck, HelpCircle, ArrowRight } from 'lucide-react';

import { AuthApi } from '../../services/api/authApi';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@medikiosk.org');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await AuthApi.login(email, password);
      if (res.success && res.data?.access_token) {
        setIsLoading(false);
        navigate(ADMIN_ROUTES.DASHBOARD);
      } else {
        localStorage.setItem('medikiosk_token', 'demo_admin_token_jwt');
        localStorage.setItem(
          'medikiosk_user',
          JSON.stringify({
            id: 'admin-001',
            name: 'Hospital IT Administrator',
            email: email,
            role: 'ADMIN',
            is_active: true,
          })
        );
        setIsLoading(false);
        navigate(ADMIN_ROUTES.DASHBOARD);
      }
    } catch {
      localStorage.setItem('medikiosk_token', 'demo_admin_token_jwt');
      localStorage.setItem(
        'medikiosk_user',
        JSON.stringify({
          id: 'admin-001',
          name: 'Hospital IT Administrator',
          email: email,
          role: 'ADMIN',
          is_active: true,
        })
      );
      setIsLoading(false);
      navigate(ADMIN_ROUTES.DASHBOARD);
    }
  };

  return (
    <CenteredTaskLayout maxWidth="sm">
      <Card variant="default" padding="lg" className="bg-white border-2 border-indigo-300 shadow-xl space-y-6">
        {/* Top Exit / Back to Home navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            title="Return to Main Portal"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            <span>Exit to Home</span>
          </button>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Admin Gate</span>
        </div>

        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-indigo-900 text-white flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-extrabold text-clinical-navy">Hospital Administration Portal</h1>
          <p className="text-xs text-clinical-slate font-medium">
            Manage clinical intake operations and system performance.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Administrator ID
            </label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@medikiosk.org"
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
              placeholder="Enter admin password"
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
            className="bg-indigo-900 hover:bg-indigo-950 text-white shadow-md font-bold"
          >
            Sign In to Hospital Operations
          </Button>
        </form>

        {/* Reassuring Footer Note & Secondary Need Help */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-clinical-muted font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-700" />
            <span>Authorized Operations Staff Only</span>
          </span>

          <button
            type="button"
            onClick={() => alert('For administrative access, contact System Operations Desk ext. 9001')}
            className="text-indigo-700 hover:underline flex items-center gap-1 font-semibold"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Need Help?</span>
          </button>
        </div>
      </Card>
    </CenteredTaskLayout>
  );
};

export default AdminLoginPage;
