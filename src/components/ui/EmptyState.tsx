import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface Props {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<Props> = ({
  title,
  description,
  icon: Icon = Inbox,
  action,
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div
      data-empty-state="true"
      className={`bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#21262D] rounded-3xl p-10 text-center shadow-sm flex flex-col items-center justify-center max-w-lg mx-auto ${className}`}
    >
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
      {!action && actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold text-xs hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
