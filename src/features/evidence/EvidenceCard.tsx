import React from 'react';
import { ExternalLink, FileText, MessageSquare, Database, ShieldCheck, HelpCircle } from 'lucide-react';
import { EvidenceSource, MedicalFact } from '../../types/evidence';
import { ConfidenceBadge } from '../confidence/ConfidenceBadge';
import { Card } from '../../components/common/Card';
import { cn } from '../../utils/cn';

export interface EvidenceCardProps {
  fact: MedicalFact;
  onOpenEvidenceDrawer?: (fact: MedicalFact) => void;
  onVerify?: (factId: string) => void;
  className?: string;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({
  fact,
  onOpenEvidenceDrawer,
  onVerify,
  className,
}) => {
  const getSourceIcon = (type: EvidenceSource['type']) => {
    switch (type) {
      case 'uploaded-document':
        return FileText;
      case 'conversation-transcript':
        return MessageSquare;
      case 'historical-emr':
        return Database;
      default:
        return FileText;
    }
  };

  const primarySource = fact.sources[0];
  const SourceIcon = primarySource ? getSourceIcon(primarySource.type) : FileText;

  return (
    <Card variant="outline" padding="sm" className={cn('flex flex-col gap-2 hover:border-brand-300 transition-colors', className)}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-clinical-muted">{fact.category.replace('-', ' ')}</span>
          <h4 className="text-sm font-semibold text-clinical-navy mt-0.5">{fact.title}</h4>
          <p className="text-xs text-clinical-slate mt-0.5">{fact.detail}</p>
        </div>
        <ConfidenceBadge level={fact.confidence} size="sm" />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-clinical-border text-xs text-clinical-muted">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <SourceIcon className="w-3.5 h-3.5 text-brand-700 shrink-0" />
          <span className="truncate font-medium text-slate-700">{primarySource ? primarySource.title : 'Patient Reported'}</span>
          {primarySource?.date && <span className="opacity-60">• {primarySource.date}</span>}
        </div>

        <button
          type="button"
          onClick={() => onOpenEvidenceDrawer && onOpenEvidenceDrawer(fact)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800 shrink-0 hover:underline"
        >
          <span>Evidence ({fact.sources.length})</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </Card>
  );
};
