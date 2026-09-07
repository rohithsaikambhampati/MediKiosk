import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { PageContainer } from '../../components/common/containers/LayoutContainers';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { AuditDetailDrawer } from '../../components/admin/AuditDetailDrawer';
import { AuditEvent } from '../../types/admin';
import { Search, RefreshCw, CheckCircle2, AlertTriangle, Eye } from 'lucide-react';
import { cn } from '../../utils/cn';

export const AdminAuditLogsPage: React.FC = () => {
  const { auditEvents } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);

  const filteredEvents = auditEvents.filter((evt) => {
    const matchesSearch =
      evt.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.resource.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || evt.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || evt.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <PageContainer
      title="Clinical Audit Trail & Log Stream"
      subtitle="Immutable audit log of doctor verification actions, nurse triage escalations, and AI source inspection."
      maxWidth="2xl"
    >
      {/* Search & Filter Bar */}
      <Card padding="md" className="bg-white border-clinical-border shadow-xs mb-6 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex-1">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Actor, Action, or Resource (#102)..."
              leftIcon={Search}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 rounded-clinical border border-slate-200 text-xs font-semibold text-slate-700 bg-white shadow-xs focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Roles</option>
              <option value="Doctor">Doctor</option>
              <option value="Nurse">Nurse</option>
              <option value="Admin">Admin</option>
              <option value="Patient Kiosk">Patient Kiosk</option>
              <option value="System Engine">System Engine</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-clinical border border-slate-200 text-xs font-semibold text-slate-700 bg-white shadow-xs focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="Success">Success</option>
              <option value="Warning">Warning</option>
              <option value="Failed">Failed</option>
            </select>

            {(searchQuery || roleFilter !== 'all' || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setRoleFilter('all');
                  setStatusFilter('all');
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

      {/* Audit Log Stream Table */}
      <Card padding="none" className="bg-white border-clinical-border shadow-xs overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Audit Stream ({filteredEvents.length} Recorded Events)
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Click row to inspect event metadata</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] uppercase font-black text-slate-500 bg-slate-100/70">
                <th className="p-3">Timestamp</th>
                <th className="p-3">Actor & Role</th>
                <th className="p-3">Action Executed</th>
                <th className="p-3">Resource / Token</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvents.map((evt) => (
                <tr
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className="hover:bg-indigo-50/50 cursor-pointer transition-colors"
                >
                  <td className="p-3 font-mono text-slate-500 font-medium">{evt.timestamp}</td>
                  <td className="p-3">
                    <strong className="font-bold text-slate-900 block text-xs">{evt.actor}</strong>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
                      {evt.role}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-slate-800">{evt.action}</td>
                  <td className="p-3">
                    <span className="font-mono font-bold text-xs text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 inline-block">
                      {evt.resource}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={cn(
                        'text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-flex items-center gap-1',
                        evt.status === 'Success'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          : 'bg-amber-100 text-amber-900 border border-amber-200'
                      )}
                    >
                      {evt.status === 'Success' ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-amber-700" />
                      )}
                      <span>{evt.status}</span>
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(evt);
                      }}
                      className="p-1 text-indigo-700 hover:bg-indigo-50 rounded"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredEvents.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-sm text-slate-500 font-medium">
                    No audit events match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Event Detail Drawer */}
      <AuditDetailDrawer
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </PageContainer>
  );
};

export default AdminAuditLogsPage;
