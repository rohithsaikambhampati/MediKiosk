import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { PageContainer, ContentGrid } from '../../components/common/containers/LayoutContainers';
import { Card } from '../../components/common/Card';
import { Plug, Activity, CheckCircle2, ShieldCheck, Database, Server, RefreshCw } from 'lucide-react';
import { cn } from '../../utils/cn';

export const AdminIntegrationsPage: React.FC = () => {
  const { integrations, systemServices } = useAdmin();
  const [testResult, setTestResult] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);

  return (
    <PageContainer
      title="Integration Hub & System Health"
      subtitle="Interoperability status for ABDM Health ID, HL7 FHIR connectors, EMR sync, and AI engine health."
      maxWidth="2xl"
    >
      {/* Explicit Prototype Labeling Notice */}
      <Card padding="sm" className="bg-sky-50 border-sky-200 mb-6 text-sky-950 text-xs font-semibold flex items-center justify-between">
        <span className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-sky-700 shrink-0" />
          <span>Notice: Integration connectors are labeled <strong>Demo Integration / Prototype Ready</strong> for hackathon demonstration.</span>
        </span>
        <span className="text-[10px] font-mono bg-sky-100 px-2 py-0.5 rounded text-sky-900 font-bold border border-sky-200">
          PROTOTYPE ENVIRONMENT
        </span>
      </Card>

      {/* Integration Connectors Grid */}
      <h3 className="font-extrabold text-sm text-clinical-navy uppercase tracking-wide mb-3">
        EHR & Interoperability Connectors
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {integrations.map((item) => (
          <Card key={item.id} padding="md" className="bg-white border-clinical-border shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-clinical bg-indigo-50 border border-indigo-200 text-indigo-900 flex items-center justify-center font-bold text-base shrink-0">
                  <Plug className="w-5 h-5 text-indigo-700" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-slate-900">{item.name}</h4>
                  <span className="text-xs text-indigo-700 font-bold">{item.type}</span>
                </div>
              </div>

              <span
                className={cn(
                  'px-2.5 py-1 rounded-full text-xs font-black border',
                  item.status === 'demo-connected'
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border-amber-300'
                )}
              >
                {item.status === 'demo-connected' ? '● Demo Connected' : '◐ Prototype Ready'}
              </span>
            </div>

            <p className="text-xs text-slate-600 font-medium">{item.details}</p>

            <div className="p-2.5 bg-slate-50 rounded-clinical border border-slate-200 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500 font-sans font-semibold">{item.fhirExchange}</span>
              <span className="text-indigo-900 font-bold">Last Sync: {item.lastSync}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* AI Processing & System Health Services */}
      <h3 className="font-extrabold text-sm text-clinical-navy uppercase tracking-wide mb-3">
        AI Processing & Microservice Health Status
      </h3>
      <Card padding="none" className="bg-white border-clinical-border shadow-xs overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Active System Services (9 Operational)
          </span>
          <span className="text-xs font-extrabold text-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>All Services Operational</span>
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {systemServices.map((srv) => (
            <div key={srv.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <div>
                  <strong className="text-xs font-bold text-slate-900 block">{srv.name}</strong>
                  <span className="text-[10px] text-slate-400 font-mono uppercase">{srv.category} service</span>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs font-mono">
                <span className="text-slate-500">Latency: <strong className="text-slate-900">{srv.latency}</strong></span>
                <span className="text-emerald-800">Uptime: <strong className="text-emerald-900">{srv.uptime}</strong></span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 font-bold border border-emerald-200 text-[10px]">
                  ● Operational
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Simulated ABDM & FHIR Interoperability Tester */}
      <div className="mt-8 space-y-3">
        <h3 className="font-extrabold text-sm text-clinical-navy uppercase tracking-wide">
          Simulated ABDM / FHIR Interoperability Tester
        </h3>
        <Card padding="md" className="bg-white border-clinical-border shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-extrabold text-sm text-slate-900">
                End-to-End Interoperability Pipeline Verification
              </h4>
              <p className="text-xs text-slate-500">
                Generate compliant FHIR R4 Bundles from intake facts & simulate gateway dispatch.
              </p>
            </div>
            <button
              onClick={() => {
                setTestResult(null);
                setTestLoading(true);
                
                // Simulate network latency
                setTimeout(() => {
                  setTestResult({
                    status: 'accepted',
                    mode: 'demo_simulation',
                    reference_id: 'HIE-SIM-' + Math.floor(Math.random() * 1000000),
                    message: 'Simulated interoperability submission successfully received by ABDM Gateway.',
                    timestamp: new Date().toISOString(),
                    resource_count: 2,
                    payload_summary: 'FHIR Bundle R4 with 2 resources'
                  });
                  setTestLoading(false);
                }, 1500);
              }}
              disabled={testLoading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-clinical text-xs font-extrabold transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", testLoading && "animate-spin")} />
              <span>{testLoading ? 'Simulating Dispatch...' : 'Test Simulated HIE Dispatch'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">FHIR R4 Profiles</span>
              <strong className="text-slate-900 text-sm">10 Structured Types</strong>
              <div className="text-[11px] text-slate-500 mt-1">Patient, Encounter, Condition, Meds, Allergies, Obs, Reports, Docs, Comp, Consent</div>
            </div>

            <div className="p-3 rounded bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Consent Verification</span>
              <strong className="text-emerald-700 text-sm">Active Enforced</strong>
              <div className="text-[11px] text-slate-500 mt-1">Non-destructive withdrawal with patient data sovereignty</div>
            </div>

            <div className="p-3 rounded bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Provenance Level</span>
              <strong className="text-indigo-700 text-sm">Source Block Traced</strong>
              <div className="text-[11px] text-slate-500 mt-1">Every FHIR observation links to original OCR block or audio transcript</div>
            </div>
          </div>

          {testResult && (
            <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-xs overflow-hidden shadow-inner animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center gap-2 mb-2 text-slate-400 border-b border-slate-800 pb-2">
                <Database className="w-4 h-4" />
                <span className="font-bold">ABDM Gateway Simulation Terminal</span>
              </div>
              <pre className="whitespace-pre-wrap break-all">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </Card>
      </div>
    </PageContainer>
  );
};

export default AdminIntegrationsPage;
