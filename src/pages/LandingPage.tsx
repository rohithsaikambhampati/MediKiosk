import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, HeartPulse, Stethoscope, ChevronRight } from 'lucide-react';
import { Card } from '../components/common/Card';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600 text-white shadow-lg mb-4">
            <HeartPulse className="w-8 h-8" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-clinical-navy tracking-tight">
            MediKiosk System
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto">
            Please select your role to proceed to the correct workspace or kiosk.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-8">
          
          {/* Patient Kiosk */}
          <Card 
            variant="interactive" 
            padding="lg" 
            className="group hover:border-brand-500 hover:shadow-xl transition-all duration-300"
            onClick={() => navigate('/patient/welcome')}
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <User className="w-6 h-6" />
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-brand-500 transition-colors" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Patient Kiosk</h2>
            <p className="text-sm text-slate-500 font-medium">
              Self-service AI pre-consultation intake. Includes ABHA login and Easy Mode for elderly patients.
            </p>
          </Card>

          {/* Doctor Workspace */}
          <Card 
            variant="interactive" 
            padding="lg" 
            className="group hover:border-emerald-500 hover:shadow-xl transition-all duration-300"
            onClick={() => navigate('/doctor/login')}
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Stethoscope className="w-6 h-6" />
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Doctor Workspace</h2>
            <p className="text-sm text-slate-500 font-medium">
              Review AI summaries, clinical evidence, and patient timelines before consultation.
            </p>
          </Card>

          {/* Nurse Triage */}
          <Card 
            variant="interactive" 
            padding="lg" 
            className="group hover:border-blue-500 hover:shadow-xl transition-all duration-300"
            onClick={() => navigate('/nurse/login')}
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <HeartPulse className="w-6 h-6" />
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Nurse / Triage</h2>
            <p className="text-sm text-slate-500 font-medium">
              Manage patient queues, verify vitals, and handle urgent kiosk alerts.
            </p>
          </Card>

          {/* Admin Portal */}
          <Card 
            variant="interactive" 
            padding="lg" 
            className="group hover:border-purple-500 hover:shadow-xl transition-all duration-300"
            onClick={() => navigate('/admin/login')}
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-purple-500 transition-colors" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Admin Portal</h2>
            <p className="text-sm text-slate-500 font-medium">
              Manage system settings, users (Doctors/Nurses), and view analytics.
            </p>
          </Card>

        </div>

      </div>
    </div>
  );
};

export default LandingPage;
