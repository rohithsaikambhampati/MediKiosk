import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { PageContainer } from '../../components/common/containers/LayoutContainers';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadIndicator } from '../../components/admin/LoadIndicator';
import { DepartmentDetailDrawer } from '../../components/admin/DepartmentDetailDrawer';
import { DepartmentMetric } from '../../types/admin';
import { Building2, Stethoscope, Users, Clock, AlertTriangle, ChevronRight } from 'lucide-react';

export const AdminDepartmentsPage: React.FC = () => {
  const { departments } = useAdmin();
  const [selectedDept, setSelectedDept] = useState<DepartmentMetric | null>(null);

  return (
    <PageContainer
      title="Hospital Departments & Operational Load"
      subtitle="Monitor department volume, active physician distribution, and bottleneck queues."
      maxWidth="2xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {departments.map((dept) => (
          <Card
            key={dept.id}
            padding="md"
            onClick={() => setSelectedDept(dept)}
            className="bg-white border-clinical-border shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3"
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-clinical bg-indigo-50 border border-indigo-200 text-indigo-900 flex items-center justify-center font-bold text-base shrink-0">
                  {dept.code}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{dept.name}</h3>
                  <span className="text-xs text-clinical-muted font-medium">
                    {dept.activeDoctors} Active Physicians assigned
                  </span>
                </div>
              </div>

              <LoadIndicator load={dept.load} size="sm" />
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Patients Today</span>
                <span className="text-base font-black font-mono text-slate-900">{dept.patientsToday}</span>
              </div>

              <div className="p-2 bg-amber-50/60 rounded border border-amber-100">
                <span className="text-[10px] uppercase font-bold text-amber-900 block">Awaiting Triage</span>
                <span className="text-base font-black font-mono text-amber-950">{dept.awaitingTriage}</span>
              </div>

              <div className="p-2 bg-indigo-50/60 rounded border border-indigo-100">
                <span className="text-[10px] uppercase font-bold text-indigo-900 block">Ready for Doctor</span>
                <span className="text-base font-black font-mono text-indigo-950">{dept.readyForDoctor}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
              <span className="text-xs font-bold text-emerald-800">
                Intake Rate: {dept.completedIntakePercent}%
              </span>

              <Button variant="ghost" size="sm" rightIcon={ChevronRight} className="text-xs font-bold text-indigo-700">
                Department Detail
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Department Detail Drawer */}
      <DepartmentDetailDrawer
        department={selectedDept}
        onClose={() => setSelectedDept(null)}
      />
    </PageContainer>
  );
};

export default AdminDepartmentsPage;
