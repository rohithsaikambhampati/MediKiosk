import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DOCTOR_ROUTES } from '../../constants/routes';
import { useDoctorWorkspace, QueuePatient } from '../../context/DoctorWorkspaceContext';
import { PageContainer } from '../../components/common/containers/LayoutContainers';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { RiskBadge } from '../../features/risk/RiskBadge';
import { Avatar } from '../../components/common/Avatar';
import {
  Users,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Filter,
  ArrowRight,
  Search,
  Building2,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const DoctorDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    queue,
    riskFilter,
    setRiskFilter,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    setActivePatientId,
  } = useDoctorWorkspace();

  // Filtered queue logic
  const filteredQueue = queue.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRisk = riskFilter === 'all' || p.riskLevel === riskFilter;
    const matchesStatus = statusFilter === 'all' || p.intakeStatus === statusFilter;

    return matchesSearch && matchesRisk && matchesStatus;
  });

  const handleOpenPatient = (patient: QueuePatient) => {
    setActivePatientId(patient.id);
    navigate(DOCTOR_ROUTES.PATIENT_OVERVIEW.replace(':patientId', patient.id));
  };

  return (
    <PageContainer
      title="Good Morning, Dr. Sharma"
      subtitle="Operational summary & pre-consultation patient queue for General Medicine."
      maxWidth="2xl"
    >
      {/* Top Header Operational KPI Summary Cards (Compact) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card variant="default" padding="sm" className="border-l-4 border-l-brand-700 bg-white shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase font-bold text-clinical-muted">Patients in Queue</div>
            <div className="text-2xl font-black text-clinical-navy mt-0.5">32</div>
            <div className="text-[10px] text-brand-700 font-semibold mt-0.5">6 Active Now</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </Card>

        <Card variant="default" padding="sm" className="border-l-4 border-l-red-600 bg-red-50/30 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase font-bold text-red-800">High Priority</div>
            <div className="text-2xl font-black text-red-700 mt-0.5">4</div>
            <div className="text-[10px] text-red-700 font-semibold mt-0.5">2 Immediate Red-Flags</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </Card>

        <Card variant="default" padding="sm" className="border-l-4 border-l-amber-500 bg-amber-50/20 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase font-bold text-amber-900">Awaiting Review</div>
            <div className="text-2xl font-black text-amber-950 mt-0.5">8</div>
            <div className="text-[10px] text-amber-800 font-semibold mt-0.5">Intake Completed</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </Card>

        <Card variant="default" padding="sm" className="border-l-4 border-l-emerald-600 bg-emerald-50/20 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase font-bold text-emerald-800">Completed Today</div>
            <div className="text-2xl font-black text-emerald-800 mt-0.5">20</div>
            <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Verified & Signed</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Patient Queue Controls Bar (Search + Compact Filters) */}
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

          {/* Risk Level Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <span className="text-xs font-bold text-clinical-muted uppercase tracking-wider mr-1 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Urgency:
            </span>

            {[
              { id: 'all', label: 'All Risks' },
              { id: 'immediate', label: '🔴 Immediate' },
              { id: 'high-priority', label: '🟠 High' },
              { id: 'needs-attention', label: '🟡 Attention' },
              { id: 'routine', label: '🔵 Routine' },
            ].map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setRiskFilter(chip.id)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-xs font-bold transition-all shrink-0',
                  riskFilter === chip.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                )}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Today's OPD Patient Queue Table */}
      <Card variant="default" padding="none" className="bg-white border-clinical-border shadow-card overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-brand-700" />
            <h3 className="font-extrabold text-base text-clinical-navy">Today’s Consultation Queue</h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-900 border border-brand-200">
              {filteredQueue.length} Patients
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-clinical-muted">
            <Sparkles className="w-3.5 h-3.5 text-brand-700" />
            <span>AI Pre-Consultation Summary Ready</span>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 text-clinical-muted font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Token</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Chief Complaint & AI Summary</th>
                <th className="py-3 px-4">Urgency Risk</th>
                <th className="py-3 px-4">Intake Status</th>
                <th className="py-3 px-4">Wait Time</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredQueue.map((patient) => {
                const isUrgent = patient.riskLevel === 'immediate';

                return (
                  <tr
                    key={patient.id}
                    onClick={() => handleOpenPatient(patient)}
                    className={cn(
                      'hover:bg-slate-50 transition-colors cursor-pointer group',
                      isUrgent && 'bg-red-50/30'
                    )}
                  >
                    {/* Token */}
                    <td className="py-3.5 px-4 font-black text-sm text-clinical-navy font-mono">
                      {patient.token}
                    </td>

                    {/* Patient info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={patient.name} roleBadge="PAT" size="sm" />
                        <div>
                          <div className="font-extrabold text-slate-900 text-sm group-hover:text-brand-700 transition-colors">
                            {patient.name}
                          </div>
                          <div className="text-[11px] text-clinical-muted font-medium">
                            {patient.age} yrs • {patient.gender.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Chief Complaint */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-800 line-clamp-1">
                        {patient.chiefComplaint}
                      </div>
                      <div className="text-[10px] text-clinical-muted flex items-center gap-2 mt-0.5">
                        <span>{patient.documentsCount} Docs</span>
                        <span>•</span>
                        <span className="text-amber-700 font-bold">{patient.unverifiedFactsCount} Unverified Facts</span>
                      </div>
                    </td>

                    {/* Risk Badge */}
                    <td className="py-3.5 px-4">
                      <RiskBadge level={patient.riskLevel} size="sm" />
                    </td>

                    {/* Intake Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border',
                          patient.intakeStatus === 'ready'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : patient.intakeStatus === 'reviewing'
                            ? 'bg-amber-50 text-amber-900 border-amber-300'
                            : patient.intakeStatus === 'in-consultation'
                            ? 'bg-sky-50 text-sky-900 border-sky-300'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        )}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {patient.intakeStatus === 'ready'
                          ? 'Ready for Review'
                          : patient.intakeStatus === 'reviewing'
                          ? 'Review in Progress'
                          : patient.intakeStatus === 'in-consultation'
                          ? 'In Consultation'
                          : 'Completed'}
                      </span>
                    </td>

                    {/* Wait Time */}
                    <td className="py-3.5 px-4 text-clinical-muted font-mono font-semibold">
                      {patient.waitTime}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant={isUrgent ? 'danger' : 'primary'}
                        size="sm"
                        rightIcon={ChevronRight}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPatient(patient);
                        }}
                      >
                        Open Workspace
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

export default DoctorDashboardPage;
