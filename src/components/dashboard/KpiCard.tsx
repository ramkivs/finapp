import React from 'react';
import { StatusBadge } from './StatusBadge';

interface KpiCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  status?: 'RECONCILED' | 'ESTIMATED' | 'NOT_CONFIGURED' | string;
  trendLabel?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  status,
  trendLabel,
  trendDirection = 'neutral',
  icon,
  className = ''
}) => {
  let trendColor = 'text-[#94A3B8] bg-[#111F2D] border-[#233548]';
  if (trendDirection === 'up') {
    trendColor = 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20';
  } else if (trendDirection === 'down') {
    trendColor = 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20';
  }

  return (
    <div
      className={`bg-[#0D1824] hover:bg-[#111F2D]/80 border border-[#233548] rounded-2xl p-6 transition-all duration-200 shadow-sm flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-[#94A3B8] tracking-wider uppercase">
            {title}
          </span>
          {icon && (
            <div className="w-8 h-8 rounded-xl bg-[#111F2D] border border-[#233548] flex items-center justify-center text-[#38BDF8]">
              {icon}
            </div>
          )}
        </div>

        <div className="text-2xl lg:text-3xl font-extrabold text-[#F5F8FC] tracking-tight mb-2">
          {value}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#233548]/60 flex-wrap gap-2">
        {status ? (
          <StatusBadge status={status} />
        ) : subtitle ? (
          <span className="text-xs text-[#94A3B8] font-medium">{subtitle}</span>
        ) : (
          <span />
        )}

        {trendLabel && (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-semibold ${trendColor}`}
          >
            {trendLabel}
          </span>
        )}
      </div>
    </div>
  );
};
