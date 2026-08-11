import React from 'react';
import { FolderOpen, Plus } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon
}) => {
  return (
    <div className="bg-[#0D1824] border border-[#233548] rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[220px] shadow-sm">
      <div className="w-12 h-12 rounded-full bg-[#111F2D] border border-[#233548] flex items-center justify-center text-[#94A3B8] mb-4">
        {icon || <FolderOpen size={24} />}
      </div>
      <h3 className="text-base font-bold text-[#F5F8FC] mb-1 tracking-tight">
        {title}
      </h3>
      <p className="text-xs text-[#94A3B8] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-[#07111C] font-semibold text-xs transition-all shadow-sm"
        >
          <Plus size={16} />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};
