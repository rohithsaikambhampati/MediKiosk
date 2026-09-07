import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DOCTOR_ROUTES } from '../../constants/routes';
import { useDoctorWorkspace, QueuePatient } from '../../context/DoctorWorkspaceContext';
import { PageContainer } from '../../components/common/containers/LayoutContainers';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { RiskBadge } from '../../features/risk/RiskBadge';
import { Avatar } from '../../components/common/Avatar';
import {
  Users,
  Search,
  Filter,
  ArrowUpDown,
  ChevronRight,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const DoctorQueuePage: React.FC = () => {
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

  const [sortBy, setSortBy] = useState<'token' | 'wait' | 'risk'>('risk');

  // Filter & Sort
  const filteredQueue = queue
    .filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRisk = riskFilter === 'all' || p.riskLevel === riskFilter;
      const matchesStatus = statusFilter === 'all' || p.intakeStatus === statusFilter;

      return matchesSearch && matchesRisk && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'token') {
        return a.token.localeCompare(b.token);
      }
      if (sortBy === 'wait') {
        return parseInt(b.waitTime) - parseInt(a.waitTime);
      }
      // Priority risk sort order
      const riskWeight: Record<string, number> = {
        immediate: 4,
        'high-priority': 3,
        'needs-attention': 2,
        routine: 1,
      };
      return riskWeight[b.riskLevel] - riskWeight[a.riskLevel];
    });

  const handleOpenPatient = (patient: QueuePatient) => {
    setActivePatientId(patient.id);
    navigate(DOCTOR_ROUTES.PATIENT_OVERVIEW.replace(':patientId', patient.id));
  };

  return (
    <PageContainer
      title="OPD Consultation Patient Queue"
      subtitle="Filter, prioritize, and select patients ready for clinical consultation."
      maxWidth="2xl"
    >
      {/* Filters & Control Toolbar */}
      <Card variant="default" padding="md" className="space-y-4 mb-6 bg-white border-clinical-border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search */}
          <div className="md:col-span-5">
            <Input
              placeholder="Search patient name, token (#102), or symptom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={Search}
            />
          </div>

          {/* Department Selector */}
          <div className="md:col-span-3">
            <Select
              options={[
                { value: 'gen-med', label: 'Dept: General Medicine' },
                { value: 'cardio', label: 'Dept: Cardiology' },
                { value: 'ortho', label: 'Dept: Orthopedics' },
              ]}
              value="gen-med"
              onChange={() => {}}
            />
          </div>

          {/* Sort selector */}
          <div className="md:col-span-4 flex items-center gap-2">
            <span className="text-xs font-bold text-clinical-muted shrink-0">Sort By:</span>
            <Select
              options={[
                { value: 'risk', label: 'Priority / Risk Level' },
                { value: 'token', label: 'Token Number' },
                { value: 'wait', label: 'Wait Time' },
              ]}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-bold text-clinical-muted uppercase tracking-wider mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Risk:
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
                  'px-2.5 py-1 rounded-full text-xs font-bold transition-all',
                  riskFilter === chip.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                )}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-clinical-muted uppercase tracking-wider mr-1">
              Status:
            </span>

            {[
              { id: 'all', label: 'All' },
              { id: 'ready', label: 'Ready' },
              { id: 'reviewing', label: 'Reviewing' },
              { id: 'completed', label: 'Done' },
            ].map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setStatusFilter(chip.id)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-xs font-semibold transition-all',
                  statusFilter === chip.id
                    ? 'bg-brand-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                )}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Queue List Cards View */}
      <div className="space-y-3">
        {filteredQueue.map((patient) => {
          const isUrgent = patient.riskLevel === 'immediate';

          return (
            <Card
              key={patient.id}
              variant={isUrgent ? 'urgent' : 'default'}
              padding="md"
              onClick={() => handleOpenPatient(patient)}
              className={cn(
                'hover:border-brand-500 transition-all cursor-pointer shadow-subtle group',
                isUrgent && 'border-l-4 border-l-red-600 bg-red-50/40'
              )}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {/* Identity & Token */}
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-black font-mono text-clinical-navy px-3 py-1.5 bg-slate-100 rounded-clinical border border-slate-200 group-hover:bg-brand-50 group-hover:text-brand-900 group-hover:border-brand-300 transition-colors">
                    {patient.token}
                  </div>

                  <Avatar name={patient.name} roleBadge="PAT" size="md" />

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-slate-900 group-hover:text-brand-700 transition-colors">
                        {patient.name}
                      </h3>
                      <span className="text-xs text-clinical-muted font-medium">
                        ({patient.age}y, {patient.gender.toUpperCase()})
                      </span>
                    </div>

                    <div className="text-xs font-medium text-slate-600 mt-0.5 line-clamp-1">
                      <strong>Complaint:</strong> {patient.chiefComplaint}
                    </div>
                  </div>
                </div>

                {/* Badges & Meta */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-slate-200">
                  <RiskBadge level={patient.riskLevel} size="md" />

                  <div className="text-right text-xs font-mono">
                    <span className="text-clinical-muted block">Wait Time</span>
                    <strong className="text-slate-900">{patient.waitTime}</strong>
                  </div>

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
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
};

export default DoctorQueuePage;
