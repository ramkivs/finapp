import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  changePct?: number | string;
  changePeriod?: string;
  icon?: LucideIcon;
  iconColor?: string;
  badge?: React.ReactNode;
  sparklineData?: number[];
  sparklineColor?: string;
  className?: string;
}

export const KpiCard: React.FC<Props> = ({
  title,
  value,
  subtitle,
  changePct,
  changePeriod = 'vs last month',
  icon: Icon,
  iconColor = 'text-green-600 dark:text-green-400',
  badge,
  sparklineData,
  sparklineColor = '#23C55E',
  className = ''
}) => {
  // Render lightweight SVG sparkline if data provided
  const renderSparkline = () => {
    if (!sparklineData || sparklineData.length < 2) return null;
    const min = Math.min(...sparklineData);
    const max = Math.max(...sparklineData);
    const range = max - min || 1;
    const width = 80;
    const height = 28;

    const points = sparklineData.map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="overflow-visible flex-shrink-0">
        <polyline
          fill="none"
          stroke={sparklineColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  const isPositiveChange = typeof changePct === 'number' ? changePct >= 0 : String(changePct || '').startsWith('+');

  return (
    <div className={`bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#21262D] rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-gray-300 dark:hover:border-[#30363D] transition-all duration-150 ${className}`}>
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-bold text-gray-500 dark:text-[#8B949E] uppercase tracking-wider block">
            {title}
          </span>
          {Icon && (
            <div className={`p-1.5 rounded-lg bg-gray-50 dark:bg-[#0D1117] border border-gray-100 dark:border-[#21262D] ${iconColor}`}>
              <Icon size={16} />
            </div>
          )}
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <div className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-[#F0F6FC] tracking-tight">
            {value}
          </div>
          {renderSparkline()}
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-[#21262D]/60 flex items-center justify-between gap-2 text-xs flex-wrap">
        {changePct !== undefined ? (
          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-0.5 font-bold text-[11px] px-1.5 py-0.5 rounded-md ${
              isPositiveChange
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
            }`}>
              {isPositiveChange ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{typeof changePct === 'number' ? `${changePct >= 0 ? '+' : ''}${changePct}%` : changePct}</span>
            </span>
            <span className="text-[11px] text-gray-400 dark:text-[#8B949E]">{changePeriod}</span>
          </div>
        ) : subtitle ? (
          <span className="text-[11px] text-gray-500 dark:text-[#8B949E] font-medium">{subtitle}</span>
        ) : null}

        {badge && <div>{badge}</div>}
      </div>
    </div>
  );
};
