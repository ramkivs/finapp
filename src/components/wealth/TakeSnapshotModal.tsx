import React, { useState } from 'react';
import { useCanonicalLedger } from '../../store/useCanonicalLedger';
import { X, Camera } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const TakeSnapshotModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [label, setLabel] = useState('');
  const { captureSnapshot } = useCanonicalLedger();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    captureSnapshot(label || undefined);
    setLabel('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Camera size={18} className="text-green-700 dark:text-green-400" />
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Take Snapshot</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
          Capture a reconciled snapshot of your current Net Worth, Total Assets, and Total Liabilities to anchor historical CAGR growth.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Label (optional)</label>
            <input
              type="text"
              placeholder="e.g. Regular March audit, Job change, Big bonus"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white outline-none focus:border-green-600 dark:focus:border-green-500"
            />
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
              A label helps you remember what was happening at this point in time.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-green-700 hover:bg-green-800 text-white font-extrabold text-xs transition shadow-sm"
            >
              Take Snapshot
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
