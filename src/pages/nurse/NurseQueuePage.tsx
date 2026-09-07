import React, { useState } from 'react';
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
  Users,
  Search,
  Filter,
  LayoutGrid,
  List,
  AlertTriangle,
  Clock,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const NurseQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    patients,
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

  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

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

  const handleReview = (patient: TriagePatient) => {
    setActivePatientId(patient.id);
    navigate(NURSE_ROUTES.TRIAGE);
  };

  return (
    <PageContainer
      title="Triage Queue Console"
      subtitle="Operational pre-consultation queue management & triage status tracking."
      maxWidth="2xl"
    >
      {/* Control Bar: Search + Filters + View Toggle */}
      <Card variant="default" padding="md" className="space-y-4 mb-6 bg-white border-clinical-border shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-80">
            <Input
              placeholder="Search patient name, token (#102), or complaint..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={Search}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {/* Quick Filter: Unreviewed */}
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
              <span>Unreviewed</span>
            </button>

            {/* Quick Filter: Immediate */}
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
              <span>🔴 Immediate</span>
            </button>

            {/* Priority Filter */}
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

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-clinical px-3 py-1.5 text-xs font-bold text-slate-800"
            >
              <option value="all">All Statuses</option>
              <option value="awaiting-triage">Awaiting Triage</option>
              <option value="under-review">Under Review</option>
              <option value="escalated">Escalated</option>
              <option value="ready-for-doctor">Ready for Doctor</option>
              <option value="completed">Completed</option>
            </select>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
              <button
                onClick={() => setViewMode('table')}
                className={cn(
                  'p-1.5 rounded transition-all',
                  viewMode === 'table' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
                )}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={cn(
                  'p-1.5 rounded transition-all',
                  viewMode === 'cards' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
                )}
                title="Cards Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Queue View */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => (
            <TriagePatientCard
              key={patient.id}
              patient={patient}
              onReview={handleReview}
              onOpenPatientStory={handleReview}
            />
          ))}
        </div>
      ) : (
        <Card variant="default" padding="none" className="bg-white border-clinical-border shadow-card overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-700" />
              <h3 className="font-extrabold text-base text-clinical-navy">Pre-Consultation Patient Queue</h3>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-900 border border-sky-200">
                {filteredPatients.length} Patients Listed
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 text-clinical-muted font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Token</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Chief Complaint</th>
                  <th className="py-3 px-4">Priority Risk</th>
                  <th className="py-3 px-4">Flag Reason</th>
                  <th className="py-3 px-4">Triage Status</th>
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
                      onClick={() => handleReview(patient)}
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
                            handleReview(patient);
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
      )}
    </PageContainer>
  );
};

export default NurseQueuePage;
