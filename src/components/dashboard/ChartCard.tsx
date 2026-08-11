import React from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  action,
  children,
  className = ''
}) => {
  return (
    <div className={`bg-[#0D1824] border border-[#233548] rounded-2xl p-6 shadow-sm flex flex-col ${className}`}>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h3 className="text-base font-bold text-[#F5F8FC] tracking-tight">{title}</h3>
          {subtitle && (
            <p className="text-xs text-[#94A3B8] mt-1">{subtitle}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="flex-1 w-full">{children}</div>
    </div>
  );
};
