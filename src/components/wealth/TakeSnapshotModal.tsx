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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0D1824] border border-[#233548] rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#233548]">
          <div className="flex items-center gap-2">
            <Camera size={18} className="text-[#38BDF8]" />
            <h3 className="text-base font-extrabold text-[#F5F8FC]">Take Snapshot</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#111F2D] hover:bg-[#142333] border border-[#233548] flex items-center justify-center text-[#94A3B8] hover:text-[#F5F8FC] transition"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-[#94A3B8] mb-4 leading-relaxed">
          Capture a reconciled snapshot of your current Net Worth, Total Assets, and Total Liabilities to anchor historical CAGR growth.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#94A3B8] mb-1">Label (optional)</label>
            <input
              type="text"
              placeholder="e.g. Regular March audit, Job change, Big bonus"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full bg-[#111F2D] border border-[#233548] rounded-xl px-3.5 py-2.5 text-xs text-[#F5F8FC] outline-none focus:border-[#38BDF8]"
            />
            <p className="text-[11px] text-[#64748B] mt-1">
              A label helps you remember what was happening at this point in time.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#233548]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#111F2D] hover:bg-[#142333] border border-[#233548] text-[#94A3B8] hover:text-[#F5F8FC] text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-[#07111C] font-extrabold text-xs transition shadow-sm"
            >
              Take Snapshot
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
