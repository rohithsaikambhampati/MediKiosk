import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageContainer } from '../../components/common/containers/LayoutContainers';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { RiskBadge } from '../../features/risk/RiskBadge';
import { TriageStatusBadge } from '../../components/nurse/TriageStatusBadge';
import { Search, RefreshCw } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface AdminPatientRow {
  id: string;
  token: string;
  name: string;
  age: number;
  gender: string;
  department: string;
  intakeStatus: 'Completed' | 'In Progress' | 'Abandoned';
  triageStatus: 'awaiting-triage' | 'under-review' | 'escalated' | 'ready-for-doctor' | 'completed';
  doctorStatus: 'Waiting for Doctor' | 'Ready for Doctor' | 'In Consultation' | 'Completed';
  createdTime: string;
  riskLevel: 'immediate' | 'high-priority' | 'needs-attention' | 'routine';
  hospitalId: string;
}

export const MOCK_ADMIN_PATIENTS: AdminPatientRow[] = [
  {
    id: 'patient-ramesh-01',
    token: '#102',
    name: 'Ramesh Kumar',
    age: 65,
    gender: 'M',
    department: 'General Medicine',
    intakeStatus: 'Completed',
    triageStatus: 'escalated',
    doctorStatus: 'Ready for Doctor',
    createdTime: '10:38 AM',
    riskLevel: 'immediate',
    hospitalId: 'GGH-2026-9041',
  },
  {
    id: 'patient-priya-02',
    token: '#105',
    name: 'Priya Sharma',
    age: 42,
    gender: 'F',
    department: 'Cardiology',
    intakeStatus: 'Completed',
    triageStatus: 'ready-for-doctor',
    doctorStatus: 'Ready for Doctor',
    createdTime: '10:45 AM',
    riskLevel: 'high-priority',
    hospitalId: 'GGH-2026-9045',
  },
  {
    id: 'patient-anita-03',
    token: '#108',
    name: 'Anita Desai',
    age: 58,
    gender: 'F',
    department: 'General Medicine',
    intakeStatus: 'Completed',
    triageStatus: 'awaiting-triage',
    doctorStatus: 'Waiting for Doctor',
    createdTime: '10:50 AM',
    riskLevel: 'high-priority',
    hospitalId: 'GGH-2026-9048',
  },
  {
    id: 'patient-sunil-04',
    token: '#112',
    name: 'Sunil Verma',
    age: 34,
    gender: 'M',
    department: 'Pediatrics',
    intakeStatus: 'Completed',
    triageStatus: 'completed',
    doctorStatus: 'Completed',
    createdTime: '09:30 AM',
    riskLevel: 'routine',
    hospitalId: 'GGH-2026-8990',
  },
  {
    id: 'patient-kavita-05',
    token: '#115',
    name: 'Kavita Patel',
    age: 29,
    gender: 'F',
    department: 'ENT & Head Neck',
    intakeStatus: 'Completed',
    triageStatus: 'under-review',
    doctorStatus: 'Waiting for Doctor',
    createdTime: '11:02 AM',
    riskLevel: 'needs-attention',
    hospitalId: 'GGH-2026-9080',
  },
  {
    id: 'patient-rajesh-06',
    token: '#118',
    name: 'Rajesh Reddy',
    age: 71,
    gender: 'M',
    department: 'Orthopedics',
    intakeStatus: 'Completed',
    triageStatus: 'ready-for-doctor',
    doctorStatus: 'In Consultation',
    createdTime: '10:15 AM',
    riskLevel: 'needs-attention',
    hospitalId: 'GGH-2026-9012',
  },
];

export const AdminPatientsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialStatusFilter = searchParams.get('status') || 'all';

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [triageFilter, setTriageFilter] = useState(initialStatusFilter);
  const [riskFilter, setRiskFilter] = useState('all');

  useEffect(() => {
    const paramStatus = searchParams.get('status');
    if (paramStatus) {
      setTriageFilter(paramStatus);
    }
  }, [searchParams]);

  const filteredPatients = MOCK_ADMIN_PATIENTS.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.hospitalId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = departmentFilter === 'all' || patient.department === departmentFilter;
    const matchesTriage =
      triageFilter === 'all' ||
      (triageFilter === 'awaiting-triage' && patient.triageStatus === 'awaiting-triage') ||
      (triageFilter === 'ready-for-doctor' && patient.triageStatus === 'ready-for-doctor') ||
      (triageFilter === 'completed' && patient.triageStatus === 'completed');
    const matchesRisk = riskFilter === 'all' || patient.riskLevel === riskFilter;

    return matchesSearch && matchesDept && matchesTriage && matchesRisk;
  });

  return (
    <PageContainer
      title="Patient Operations Directory"
      subtitle="Hospital-wide pre-consultation intake status and workflow monitoring."
      maxWidth="2xl"
    >
      {/* Search & Filter Controls */}
      <Card padding="md" className="bg-white border-clinical-border shadow-xs mb-6 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex-1">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Patient Name, Token (#102), or Hospital ID..."
              leftIcon={Search}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 rounded-clinical border border-slate-200 text-xs font-semibold text-slate-700 bg-white shadow-xs focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Departments</option>
              <option value="General Medicine">General Medicine</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="ENT & Head Neck">ENT & Head Neck</option>
            </select>

            {/* Triage Status Filter */}
            <select
              value={triageFilter}
              onChange={(e) => setTriageFilter(e.target.value)}
              className="px-3 py-2 rounded-clinical border border-slate-200 text-xs font-semibold text-slate-700 bg-white shadow-xs focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Workflow Statuses</option>
              <option value="awaiting-triage">Awaiting Triage</option>
              <option value="ready-for-doctor">Ready for Doctor</option>
              <option value="completed">Completed</option>
            </select>

            {/* Risk Filter */}
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-3 py-2 rounded-clinical border border-slate-200 text-xs font-semibold text-slate-700 bg-white shadow-xs focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Risk Stratifications</option>
              <option value="immediate">🔴 Immediate</option>
              <option value="high-priority">🟠 High Priority</option>
              <option value="needs-attention">🟡 Needs Attention</option>
              <option value="routine">🟢 Routine</option>
            </select>

            {(searchQuery || departmentFilter !== 'all' || triageFilter !== 'all' || riskFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setDepartmentFilter('all');
                  setTriageFilter('all');
                  setRiskFilter('all');
                }}
                className="p-2 text-slate-500 hover:text-slate-900 border border-slate-200 rounded-clinical hover:bg-slate-50"
                title="Reset Filters"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Patient Operations Table */}
      <Card padding="none" className="bg-white border-clinical-border shadow-xs overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Patient Workflows ({filteredPatients.length} Active Records)
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            Privacy Protected • Clinical details restricted to authorized staff
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] uppercase font-black text-slate-500 bg-slate-100/70">
                <th className="p-3">Token</th>
                <th className="p-3">Patient & ID</th>
                <th className="p-3">Age / Sex</th>
                <th className="p-3">Department</th>
                <th className="p-3">Intake Status</th>
                <th className="p-3">Triage Status</th>
                <th className="p-3">Doctor Queue Status</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3 text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map((pt) => (
                <tr key={pt.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-mono font-black text-base text-clinical-navy">{pt.token}</td>
                  <td className="p-3">
                    <strong className="font-bold text-slate-900 block text-xs">{pt.name}</strong>
                    <span className="text-[10px] text-slate-400 font-mono">{pt.hospitalId}</span>
                  </td>
                  <td className="p-3 text-slate-700 font-medium">{pt.age}y / {pt.gender}</td>
                  <td className="p-3 font-semibold text-slate-800">{pt.department}</td>
                  <td className="p-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200">
                      {pt.intakeStatus}
                    </span>
                  </td>
                  <td className="p-3">
                    <TriageStatusBadge status={pt.triageStatus} size="sm" />
                  </td>
                  <td className="p-3 font-semibold text-indigo-900">{pt.doctorStatus}</td>
                  <td className="p-3">
                    <RiskBadge level={pt.riskLevel} size="sm" />
                  </td>
                  <td className="p-3 text-right font-mono text-slate-500">{pt.createdTime}</td>
                </tr>
              ))}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-sm text-slate-500 font-medium">
                    No patients match your current filters. Try adjusting the search or filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </PageContainer>
  );
};

export default AdminPatientsPage;
