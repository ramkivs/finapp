import React from 'react';
import { MetricBadge, BadgeVariant } from './MetricBadge';

interface Props {
  status: 'RECONCILED' | 'NOT_CONFIGURED' | 'ESTIMATED' | 'Active' | 'Lapsed' | 'Pending' | 'In Progress' | 'Achieved' | 'Paused' | string;
  className?: string;
}

export const StatusBadge: React.FC<Props> = ({ status, className = '' }) => {
  let variant: BadgeVariant = 'neutral';
  let label = status;

  if (status === 'RECONCILED' || status === 'Active' || status === 'Achieved') {
    variant = 'success';
    label = status === 'RECONCILED' ? 'Reconciled' : status;
  } else if (status === 'NOT_CONFIGURED' || status === 'Lapsed' || status === 'Paused') {
    variant = 'neutral';
    label = status === 'NOT_CONFIGURED' ? 'Not Configured' : status;
  } else if (status === 'ESTIMATED' || status === 'Pending') {
    variant = 'warning';
    label = status === 'ESTIMATED' ? 'Estimated' : status;
  } else if (status === 'HEALTHY') {
    variant = 'success';
    label = 'Healthy';
  } else if (status === 'MODERATE') {
    variant = 'info';
    label = 'Moderate';
  } else if (status === 'NEEDS_ATTENTION') {
    variant = 'danger';
    label = 'Needs Attention';
  }

  return <MetricBadge label={label} variant={variant} size="sm" className={className} />;
};
