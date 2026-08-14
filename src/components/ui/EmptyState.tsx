import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface Props {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<Props> = ({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className = ''
}) => {
  return (
    <div className={`bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#21262D] rounded-3xl p-12 text-center shadow-sm flex flex-col items-center justify-center max-w-lg mx-auto ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-[#0D1117] border border-gray-200 dark:border-[#21262D] flex items-center justify-center text-gray-400 dark:text-[#8B949E] mb-4">
        <Icon size={24} />
      </div>
      <h4 className="font-extrabold text-base text-gray-900 dark:text-[#F0F6FC] tracking-tight">
        {title}
      </h4>
      <p className="text-xs text-gray-500 dark:text-[#8B949E] mt-1.5 max-w-sm leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};
