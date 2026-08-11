import React from 'react';

interface StatusBadgeProps {
  status: 'RECONCILED' | 'ESTIMATED' | 'NOT_CONFIGURED' | string;
  displayLabel?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, displayLabel }) => {
  const isReconciled = status === 'RECONCILED';
  const isEstimated = status === 'ESTIMATED';
  const isNotConfigured = status === 'NOT_CONFIGURED';

  let bgClass = 'bg-[#111F2D] text-[#94A3B8] border-[#233548]';
  let dotClass = 'bg-[#94A3B8]';
  let text = displayLabel || status;

  if (isReconciled) {
    bgClass = 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30';
    dotClass = 'bg-[#22C55E]';
    text = displayLabel || 'Reconciled';
  } else if (isEstimated) {
    bgClass = 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30';
    dotClass = 'bg-[#F59E0B]';
    text = displayLabel || 'Estimated';
  } else if (isNotConfigured) {
    bgClass = 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30';
    dotClass = 'bg-[#F59E0B]';
    text = displayLabel || 'Not configured';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold tracking-wide ${bgClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      <span>{text}</span>
    </span>
  );
};
