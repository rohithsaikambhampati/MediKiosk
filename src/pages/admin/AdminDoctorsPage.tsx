import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { PageContainer } from '../../components/common/containers/LayoutContainers';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { DoctorStatus } from '../../types/admin';
import { Stethoscope, Shield } from 'lucide-react';
import { cn } from '../../utils/cn';

export const AdminDoctorsPage: React.FC = () => {
  const { doctors, updateDoctorStatus } = useAdmin();

  const handleStatusChange = (doctorId: string, status: DoctorStatus) => {
    updateDoctorStatus(doctorId, status);
  };

  return (
    <PageContainer
      title="Physicians & Specialist Roster"
      subtitle="Operational roster of attending OPD doctors, current patient queues, and review benchmarks."
      maxWidth="2xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {doctors.map((doc) => (
          <Card key={doc.id} padding="md" className="bg-white border-clinical-border shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-clinical bg-indigo-50 border border-indigo-200 text-indigo-900 flex items-center justify-center font-bold text-lg shrink-0">
                  <Stethoscope className="w-6 h-6 text-indigo-700" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{doc.name}</h3>
                  <p className="text-xs text-indigo-700 font-bold">{doc.specialty}</p>
                  <span className="text-[10px] text-slate-500 font-medium">{doc.department}</span>
                </div>
              </div>

              {/* Status Select Toggle */}
              <select
                value={doc.status}
                onChange={(e) => handleStatusChange(doc.id, e.target.value as DoctorStatus)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-xs font-extrabold border shadow-xs focus:ring-2 focus:ring-indigo-500 cursor-pointer',
                  doc.status === 'active' && 'bg-emerald-50 text-emerald-900 border-emerald-300',
                  doc.status === 'on-break' && 'bg-amber-50 text-amber-900 border-amber-300',
                  doc.status === 'offline' && 'bg-slate-100 text-slate-700 border-slate-300',
                  doc.status === 'unavailable' && 'bg-red-50 text-red-900 border-red-300'
                )}
              >
                <option value="active">● Active</option>
                <option value="on-break">◐ On Break</option>
                <option value="offline">○ Offline</option>
                <option value="unavailable">✕ Unavailable</option>
              </select>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2 bg-indigo-50/60 rounded border border-indigo-100">
                <span className="text-[10px] uppercase font-bold text-indigo-900 block">Current Queue</span>
                <span className="text-base font-black font-mono text-indigo-950">{doc.currentQueue} patients</span>
              </div>

              <div className="p-2 bg-emerald-50/60 rounded border border-emerald-100">
                <span className="text-[10px] uppercase font-bold text-emerald-900 block">Completed Today</span>
                <span className="text-base font-black font-mono text-emerald-950">{doc.completedToday}</span>
              </div>

              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-600 block">Avg Review</span>
                <span className="text-xs font-mono font-extrabold text-slate-900">{doc.avgReviewTime}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
              <span className="text-[10px] text-clinical-muted flex items-center gap-1 font-semibold">
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span>Verified Clinical Staff</span>
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => alert(`Operational privileges for ${doc.name} are active.`)}
                  className="text-xs font-bold text-indigo-700 hover:bg-indigo-50"
                >
                  Inspect Schedule
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => alert(`Removed ${doc.name} from the system. (Admin Only Action)`)}
                  className="text-xs font-bold text-red-600 hover:bg-red-50 border-red-200"
                >
                  Remove
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="mt-8 flex justify-center">
        <Button variant="kiosk" size="lg" className="shadow-md" onClick={() => alert("Added a new Doctor to the system. (Admin Only Action)")}>
          + Add New Doctor
        </Button>
      </div>
    </PageContainer>
  );
};

export default AdminDoctorsPage;
