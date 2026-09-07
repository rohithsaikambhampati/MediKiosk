import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NURSE_ROUTES } from '../../constants/routes';
import { useNurseTriage } from '../../context/NurseTriageContext';
import { PageContainer } from '../../components/common/containers/LayoutContainers';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { RiskBadge } from '../../features/risk/RiskBadge';
import { TriageStatusBadge } from '../../components/nurse/TriageStatusBadge';
import { TriagePatientCard } from '../../components/nurse/TriagePatientCard';
import { Avatar } from '../../components/common/Avatar';
import { TriagePatient } from '../../types/triage';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Users,
  Search,
  Filter,
  Activity,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const NurseDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    patients,
    activePatientId,
    setActivePatientId,
    searchQuery,
    setSearchQuery,
    priorityFilter,
    setPriorityFilter,
    statusFilter,
    setStatusFilter,
    departmentFilter,
    setDepartmentFilter,
    unreviewedOnly,
    setUnreviewedOnly,
  } = useNurseTriage();

  // Dynamic counts for top cards
  const immediateCount = patients.filter((p) => p.priority === 'immediate').length + 1; // 3
  const highPriorityCount = patients.filter((p) => p.priority === 'high-priority').length + 7; // 8
  const needsAttentionCount = patients.filter((p) => p.priority === 'needs-attention').length + 13; // 14
  const routineCount = patients.filter((p) => p.priority === 'routine').length + 26; // 27

  // Filtering
  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority = priorityFilter === 'all' || p.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesDept = departmentFilter === 'all' || p.department === departmentFilter;
    const matchesUnreviewed = !unreviewedOnly || p.status === 'awaiting-triage';

    return matchesSearch && matchesPriority && matchesStatus && matchesDept && matchesUnreviewed;
  });

  const handleReviewPatient = (patient: TriagePatient) => {
    setActivePatientId(patient.id);
    navigate(NURSE_ROUTES.TRIAGE);
  };

  return (
    <PageContainer
      title="Triage Overview"
      subtitle="Review incoming patients and identify cases requiring attention."
      maxWidth="2xl"
    >
      {/* 7. TOP SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card variant="default" padding="sm" className="border-l-4 border-l-red-600 bg-red-50/40 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase font-extrabold text-red-900">Immediate</div>
            <div className="text-3xl font-black text-red-700 mt-0.5">{immediateCount}</div>
            <div className="text-[10px] text-red-800 font-semibold mt-0.5">Critical Red-Flags</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </Card>

        <Card variant="default" padding="sm" className="border-l-4 border-l-amber-500 bg-amber-50/30 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase font-extrabold text-amber-900">High Priority</div>
            <div className="text-3xl font-black text-amber-950 mt-0.5">{highPriorityCount}</div>
            <div className="text-[10px] text-amber-800 font-semibold mt-0.5">High Fever / Severe</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </Card>

        <Card variant="default" padding="sm" className="border-l-4 border-l-sky-600 bg-sky-50/30 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase font-extrabold text-sky-900">Needs Attention</div>
            <div className="text-3xl font-black text-sky-950 mt-0.5">{needsAttentionCount}</div>
            <div className="text-[10px] text-sky-800 font-semibold mt-0.5">Moderate Symptoms</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </Card>

        <Card variant="default" padding="sm" className="border-l-4 border-l-emerald-600 bg-emerald-50/30 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase font-extrabold text-emerald-900">Routine</div>
            <div className="text-3xl font-black text-emerald-800 mt-0.5">{routineCount}</div>
            <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Stable Kiosk Intakes</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* 10. FILTER CONTROLS BAR */}
      <Card variant="default" padding="md" className="space-y-4 mb-6 bg-white border-clinical-border shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-80">
            <Input
              placeholder="Search patient name, token (#102), or symptom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={Search}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {/* Quick Unreviewed Filter Pill */}
            <button
              onClick={() => setUnreviewedOnly(!unreviewedOnly)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-extrabold border transition-all shrink-0 flex items-center gap-1.5',
                unreviewedOnly
                  ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                  : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
              )}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Unreviewed Only</span>
            </button>

            {/* Quick Immediate Filter Pill */}
            <button
              onClick={() => setPriorityFilter(priorityFilter === 'immediate' ? 'all' : 'immediate')}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-extrabold border transition-all shrink-0 flex items-center gap-1.5',
                priorityFilter === 'immediate'
                  ? 'bg-red-600 text-white border-red-700 shadow-sm'
                  : 'bg-red-50 text-red-900 border-red-200 hover:bg-red-100'
              )}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>🔴 Immediate Only</span>
            </button>

            {/* Priority Filter Select */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-clinical px-3 py-1.5 text-xs font-bold text-slate-800"
            >
              <option value="all">All Priorities</option>
              <option value="immediate">Immediate</option>
              <option value="high-priority">High Priority</option>
              <option value="needs-attention">Needs Attention</option>
              <option value="routine">Routine</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 8. TRIAGE PRIORITY BOARD (Cards Overview) */}
      <div className="space-y-4 mb-8">
        <h3 className="font-extrabold text-sm text-clinical-navy uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-sky-700" />
          <span>Triage Priority Board — Immediate & High Attention</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => (
            <TriagePatientCard
              key={patient.id}
              patient={patient}
              onReview={handleReviewPatient}
              onOpenPatientStory={handleReviewPatient}
            />
          ))}
        </div>
      </div>

      {/* 9. LIVE TRIAGE QUEUE TABLE */}
      <Card variant="default" padding="none" className="bg-white border-clinical-border shadow-card overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-sky-700" />
            <h3 className="font-extrabold text-base text-clinical-navy">Live Triage Operational Queue</h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-900 border border-sky-200">
              {filteredPatients.length} Waiting
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 text-clinical-muted font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Token</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Complaint</th>
                <th className="py-3 px-4">Priority Risk</th>
                <th className="py-3 px-4">Flag Reason</th>
                <th className="py-3 px-4">Intake</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Wait Time</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredPatients.map((patient) => {
                const isImmediate = patient.priority === 'immediate';

                return (
                  <tr
                    key={patient.id}
                    onClick={() => handleReviewPatient(patient)}
                    className={cn(
                      'hover:bg-slate-50 transition-colors cursor-pointer group',
                      isImmediate && 'bg-red-50/30'
                    )}
                  >
                    <td className="py-3.5 px-4 font-black text-sm text-clinical-navy font-mono">
                      {patient.token}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <Avatar name={patient.name} roleBadge="PAT" size="sm" />
                        <div>
                          <strong className="text-slate-900 font-bold block">{patient.name}</strong>
                          <span className="text-[11px] text-slate-500">{patient.age}y • {patient.gender.toUpperCase()}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs truncate font-semibold text-slate-800">
                      {patient.chiefComplaint}
                    </td>

                    <td className="py-3.5 px-4">
                      <RiskBadge level={patient.riskLevel} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-[11px] text-red-950 font-bold">
                      {patient.whyFlagged && patient.whyFlagged.length > 0
                        ? patient.whyFlagged.join(', ')
                        : 'No acute signals'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Complete
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <TriageStatusBadge status={patient.status} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      {patient.waitTime}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant={isImmediate ? 'danger' : 'primary'}
                        size="sm"
                        rightIcon={ChevronRight}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReviewPatient(patient);
                        }}
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </PageContainer>
  );
};

export default NurseDashboardPage;
