import React from 'react';

interface Props {
  percentage: number;
  label?: string;
  leftText?: React.ReactNode;
  rightText?: React.ReactNode;
  color?: 'green' | 'blue' | 'cyan' | 'amber' | 'rose';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const COLOR_MAP = {
  green: 'bg-[#23C55E]',
  blue: 'bg-[#4F8CFF]',
  cyan: 'bg-[#06B6D4]',
  amber: 'bg-[#F59E0B]',
  rose: 'bg-[#EF4444]'
};

export const ProgressBar: React.FC<Props> = ({
  percentage,
  label,
  leftText,
  rightText,
  color = 'green',
  size = 'md',
  className = ''
}) => {
  const clamped = Math.max(0, Math.min(100, Math.round(percentage)));

  const heightStyle = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3.5' : 'h-2.5';

  return (
    <div className={`space-y-1.5 w-full ${className}`}>
      {(label || leftText || rightText) && (
        <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-[#8B949E]">
          <div>{label || leftText}</div>
          <div>{rightText || `${clamped}%`}</div>
        </div>
      )}

      <div className={`w-full bg-gray-100 dark:bg-[#0D1117] rounded-full overflow-hidden border border-gray-200 dark:border-[#21262D] ${heightStyle}`}>
        <div
          style={{ width: `${clamped}%` }}
          className={`${heightStyle} ${COLOR_MAP[color]} rounded-full transition-all duration-300 ease-out`}
        />
      </div>
    </div>
  );
};
