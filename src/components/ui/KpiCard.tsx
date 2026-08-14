import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export interface KpiCardProps {
  label?: string;
  title?: string;
  value: React.ReactNode;
  subtitle?: string;
  change?: string;
  changePct?: number | string;
  changeType?: 'positive' | 'negative' | 'neutral';
  changePeriod?: string;
  status?: 'RECONCILED' | 'NOT_CONFIGURED' | 'ESTIMATED' | 'HEALTHY' | 'MODERATE' | 'NEEDS_ATTENTION' | string;
  icon?: LucideIcon | React.ReactNode;
  iconColor?: string;
  accentColor?: 'emerald' | 'cyan' | 'indigo' | 'amber' | 'rose' | string;
  badge?: React.ReactNode;
  sparklineData?: number[];
  sparklineColor?: string;
  tooltip?: string;
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  title,
  value,
  subtitle,
  change,
  changePct,
  changeType,
  changePeriod = 'vs baseline',
  status,
  icon,
  iconColor,
  accentColor = 'emerald',
  badge,
  sparklineData,
  sparklineColor,
  tooltip,
  className = ''
}) => {
  const displayTitle = label || title || '';
  const displayChange = change || (changePct !== undefined ? (typeof changePct === 'number' ? `${changePct >= 0 ? '+' : ''}${changePct}%` : String(changePct)) : undefined);
  const isPositive = changeType === 'positive' || (changeType === undefined && (typeof changePct === 'number' ? changePct >= 0 : String(displayChange || '').startsWith('+')));
  const isNegative = changeType === 'negative' || (changeType === undefined && (typeof changePct === 'number' ? changePct < 0 : String(displayChange || '').startsWith('-')));

  const colorMap: Record<string, string> = {
    emerald: '#10B981',
    cyan: '#06B6D4',
    indigo: '#6366F1',
    amber: '#F59E0B',
    rose: '#F43F5E'
  };

  const finalSparkColor = sparklineColor || colorMap[accentColor] || '#10B981';

  // Render lightweight SVG sparkline if data provided
  const renderSparkline = () => {
    if (!sparklineData || sparklineData.length < 2) return null;
    const min = Math.min(...sparklineData);
    const max = Math.max(...sparklineData);
    const range = max - min || 1;
    const width = 76;
    const height = 26;

    const points = sparklineData.map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="overflow-visible flex-shrink-0">
        <polyline
          fill="none"
          stroke={finalSparkColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return (
        <div className={`p-1.5 rounded-lg bg-gray-50 dark:bg-[#0D1117] border border-gray-100 dark:border-[#21262D] ${iconColor || ''}`}>
          {icon}
        </div>
      );
    }
    const IconComp = icon as LucideIcon;
    return (
      <div className={`p-1.5 rounded-lg bg-gray-50 dark:bg-[#0D1117] border border-gray-100 dark:border-[#21262D] ${iconColor || 'text-emerald-500'}`}>
        <IconComp size={16} />
      </div>
    );
  };

  return (
    <div
      data-kpi-card="true"
      title={tooltip}
      className={`bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#21262D] rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-gray-300 dark:hover:border-[#30363D] transition-all duration-150 ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-bold text-gray-500 dark:text-[#8B949E] uppercase tracking-wider block">
            {displayTitle}
          </span>
          {renderIcon()}
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <div className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-[#F0F6FC] tracking-tight">
            {value}
          </div>
          {renderSparkline()}
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-[#21262D]/60 flex items-center justify-between gap-2 text-xs flex-wrap">
        {displayChange !== undefined ? (
          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-0.5 font-bold text-[11px] px-1.5 py-0.5 rounded-md ${
              isPositive
                ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                : isNegative
                ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}>
              {isPositive ? <TrendingUp size={12} /> : isNegative ? <TrendingDown size={12} /> : null}
              <span>{displayChange}</span>
            </span>
            <span className="text-[11px] text-gray-400 dark:text-[#8B949E]">{changePeriod}</span>
          </div>
        ) : subtitle ? (
          <span className="text-[11px] text-gray-500 dark:text-[#8B949E] font-medium">{subtitle}</span>
        ) : null}

        {status && (
          status === 'RECONCILED' || status === 'NOT_CONFIGURED' ? (
            <StatusBadge status={status as any} />
          ) : (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              status === 'HEALTHY'
                ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                : status === 'MODERATE'
                ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                : 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
            }`}>
              {status}
            </span>
          )
        )}
        {badge && !status && <div>{badge}</div>}
      </div>
    </div>
  );
};
