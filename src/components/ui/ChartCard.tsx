import React from 'react';

interface Props {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const ChartCard: React.FC<Props> = ({
  title,
  subtitle,
  action,
  children,
  footer,
  className = ''
}) => {
  return (
    <div className={`bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#21262D] rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:border-gray-300 dark:hover:border-[#30363D] transition-all duration-150 ${className}`}>
      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="font-extrabold text-base text-gray-900 dark:text-[#F0F6FC] tracking-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-[#8B949E] mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>

        <div className="min-h-[160px] w-full flex items-center justify-center">
          {children}
        </div>
      </div>

      {footer && (
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#21262D] text-xs text-gray-500 dark:text-[#8B949E]">
          {footer}
        </div>
      )}
    </div>
  );
};
