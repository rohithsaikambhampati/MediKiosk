import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NURSE_ROUTES } from '../../constants/routes';
import { useNurseTriage } from '../../context/NurseTriageContext';
import { PageContainer } from '../../components/common/containers/LayoutContainers';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { RiskBadge } from '../../features/risk/RiskBadge';
import { EscalationModal } from '../../components/nurse/TriageModals';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  AlertOctagon,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { TriageAlert, TriagePatient } from '../../types/triage';

export const NurseAlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const { alerts, patients, setActivePatientId, acknowledgeAlert, escalatePatient } = useNurseTriage();

  const [activeTab, setActiveTab] = useState<'all' | 'immediate' | 'high-priority' | 'new' | 'acknowledged'>('all');
  const [escalatePatientTarget, setEscalatePatientTarget] = useState<TriagePatient | null>(null);

  const filteredAlerts = alerts.filter((alert) => {
    if (activeTab === 'immediate') return alert.severity === 'immediate';
    if (activeTab === 'high-priority') return alert.severity === 'high-priority';
    if (activeTab === 'new') return alert.status === 'new';
    if (activeTab === 'acknowledged') return alert.status === 'acknowledged';
    return true;
  });

  const handleReview = (patientId: string) => {
    setActivePatientId(patientId);
    navigate(NURSE_ROUTES.TRIAGE);
  };

  const handleEscalateClick = (patientId: string) => {
    const target = patients.find((p) => p.id === patientId) || null;
    setEscalatePatientTarget(target);
  };

  return (
    <PageContainer
      title="Urgent Risk Alerts Console"
      subtitle="Priority clinical red-flag alerts extracted by MediKiosk AI intake."
      maxWidth="2xl"
    >
      {/* Category Tabs */}
      <Card variant="default" padding="sm" className="mb-6 bg-white border-clinical-border shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all shrink-0',
              activeTab === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            All Alerts ({alerts.length})
          </button>

          <button
            onClick={() => setActiveTab('new')}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all shrink-0 flex items-center gap-1.5',
              activeTab === 'new'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-red-50 text-red-900 border border-red-200 hover:bg-red-100'
            )}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>New Unacknowledged ({alerts.filter((a) => a.status === 'new').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('immediate')}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all shrink-0 flex items-center gap-1.5',
              activeTab === 'immediate'
                ? 'bg-red-900 text-white shadow-xs'
                : 'bg-red-50 text-red-950 border border-red-200 hover:bg-red-100'
            )}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>🔴 Immediate ({alerts.filter((a) => a.severity === 'immediate').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('high-priority')}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all shrink-0 flex items-center gap-1.5',
              activeTab === 'high-priority'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            )}
          >
            <span>🟠 High Priority ({alerts.filter((a) => a.severity === 'high-priority').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('acknowledged')}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all shrink-0 flex items-center gap-1.5',
              activeTab === 'acknowledged'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
            )}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Acknowledged</span>
          </button>
        </div>
      </Card>

      {/* Alert Items List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => {
          const isImmediate = alert.severity === 'immediate';

          return (
            <Card
              key={alert.id}
              variant={isImmediate ? 'urgent' : 'default'}
              padding="md"
              className={cn(
                'bg-white border-2 shadow-sm space-y-3 transition-all',
                isImmediate ? 'border-red-300 bg-red-50/20' : 'border-slate-200'
              )}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl font-black font-mono text-clinical-navy bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                    {alert.token}
                  </span>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">{alert.patientName}</h3>
                    <span className="text-xs text-clinical-muted font-medium">Received {alert.receivedTime}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <RiskBadge level={alert.severity} size="sm" />

                  {alert.status === 'acknowledged' ? (
                    <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Acknowledged ({alert.acknowledgedBy})
                    </span>
                  ) : alert.status === 'escalated' ? (
                    <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-red-100 text-red-950 border border-red-300 flex items-center gap-1 animate-pulse">
                      <AlertOctagon className="w-3 h-3 text-red-600" /> Escalated
                    </span>
                  ) : (
                    <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-700" /> New Alert
                    </span>
                  )}
                </div>
              </div>

              {/* Trigger Title & Signals */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-xs text-red-950 uppercase tracking-wide flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-600" /> {alert.triggerTitle}
                </h4>

                <div className="flex flex-wrap gap-1.5">
                  {alert.signals.map((signal, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-extrabold bg-red-100/90 text-red-950 border border-red-200"
                    >
                      <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />
                      <span>{signal}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Controls */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
                {alert.status === 'new' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="border-sky-300 hover:bg-sky-50 text-sky-900 font-bold text-xs"
                  >
                    Acknowledge Alert
                  </Button>
                )}

                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={AlertOctagon}
                  onClick={() => handleEscalateClick(alert.patientId)}
                  className="font-bold text-xs"
                >
                  Escalate
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  rightIcon={ChevronRight}
                  onClick={() => handleReview(alert.patientId)}
                  className="font-extrabold text-xs shadow-xs"
                >
                  Review Triage Workspace
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Escalation Modal */}
      <EscalationModal
        isOpen={!!escalatePatientTarget}
        onClose={() => setEscalatePatientTarget(null)}
        onConfirm={() => {
          if (escalatePatientTarget) {
            escalatePatient(escalatePatientTarget.id);
          }
        }}
        patient={escalatePatientTarget}
      />
    </PageContainer>
  );
};

export default NurseAlertsPage;
