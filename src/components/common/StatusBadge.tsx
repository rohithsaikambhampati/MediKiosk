import React from 'react';
import { Badge, BadgeVariant } from './Badge';
import { CheckCircle2, Clock, AlertCircle, AlertTriangle, HelpCircle } from 'lucide-react';

export type StatusType = 'verified' | 'pending' | 'needs-verification' | 'urgent' | 'completed' | 'in-progress';

export interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'md', className }) => {
  const config: Record<StatusType, { variant: BadgeVariant; icon: any; defaultLabel: string }> = {
    verified: {
      variant: 'success',
      icon: CheckCircle2,
      defaultLabel: 'Doctor Verified',
    },
    pending: {
      variant: 'default',
      icon: Clock,
      defaultLabel: 'Pending Intake',
    },
    'needs-verification': {
      variant: 'warning',
      icon: HelpCircle,
      defaultLabel: 'Needs Doctor Verification',
    },
    urgent: {
      variant: 'danger',
      icon: AlertCircle,
      defaultLabel: 'Immediate Review',
    },
    completed: {
      variant: 'brand',
      icon: CheckCircle2,
      defaultLabel: 'Completed',
    },
    'in-progress': {
      variant: 'info',
      icon: AlertTriangle,
      defaultLabel: 'In Progress',
    },
  };

  const item = config[status] || config.pending;

  return (
    <Badge variant={item.variant} icon={item.icon} size={size} className={className}>
      {label || item.defaultLabel}
    </Badge>
  );
};
