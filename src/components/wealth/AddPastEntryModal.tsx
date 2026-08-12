import React, { useState } from 'react';
import { useCanonicalLedger } from '../../store/useCanonicalLedger';
import { CurrencyValue } from '../CurrencyValue';
import { X, Calendar } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AddPastEntryModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [dateStr, setDateStr] = useState('09-08-2025');
  const [assetsAmt, setAssetsAmt] = useState('');
  const [liabsAmt, setLiabsAmt] = useState('');
  const [label, setLabel] = useState('');
  const [error, setError] = useState('');

  const { addPastSnapshot } = useCanonicalLedger();

  if (!isOpen) return null;

  const totAssets = Number(assetsAmt) || 0;
  const totLiabs = Number(liabsAmt) || 0;
  const computedNetWorth = totAssets - totLiabs;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      addPastSnapshot({
        dateStr,
        totalAssets: totAssets,
        totalLiabilities: totLiabs,
        label: label || undefined
      });
      setDateStr('09-08-2025');
      setAssetsAmt('');
      setLiabsAmt('');
      setLabel('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error recording historical snapshot.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0D1824] border border-[#233548] rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#233548]">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-[#38BDF8]" />
            <h3 className="text-base font-extrabold text-[#F5F8FC]">Add past entry</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#111F2D] hover:bg-[#142333] border border-[#233548] flex items-center justify-center text-[#94A3B8] hover:text-[#F5F8FC] transition"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-[#94A3B8] mb-4 leading-relaxed">
          Record what you were worth on a date that has already passed. Use this for months you tracked somewhere else before moving here.
        </p>

        {error && (
          <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 p-3 rounded-xl text-[#EF4444] text-xs font-semibold mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#94A3B8] mb-1">Date (dd-mm-yyyy or readable date) *</label>
            <input
              type="text"
              placeholder="dd-mm-yyyy e.g. 09-08-2025"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              required
              className="w-full bg-[#111F2D] border border-[#233548] rounded-xl px-3.5 py-2.5 text-xs text-[#F5F8FC] outline-none focus:border-[#38BDF8]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#94A3B8] mb-1">Total assets *</label>
              <input
                type="number"
                placeholder="0"
                value={assetsAmt}
                onChange={(e) => setAssetsAmt(e.target.value)}
                required
                className="w-full bg-[#111F2D] border border-[#233548] rounded-xl px-3.5 py-2.5 text-xs text-[#F5F8FC] outline-none focus:border-[#38BDF8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#94A3B8] mb-1">Total liabilities (optional)</label>
              <input
                type="number"
                placeholder="0"
                value={liabsAmt}
                onChange={(e) => setLiabsAmt(e.target.value)}
                className="w-full bg-[#111F2D] border border-[#233548] rounded-xl px-3.5 py-2.5 text-xs text-[#F5F8FC] outline-none focus:border-[#38BDF8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#94A3B8] mb-1">Label (optional)</label>
            <input
              type="text"
              placeholder="e.g. From my old spreadsheet"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full bg-[#111F2D] border border-[#233548] rounded-xl px-3.5 py-2.5 text-xs text-[#F5F8FC] outline-none focus:border-[#38BDF8]"
            />
          </div>

          <div className="bg-[#111F2D] border border-[#233548] p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#94A3B8]">Net worth</span>
              <span className="text-sm font-extrabold text-[#22C55E]">
                <CurrencyValue value={computedNetWorth} />
              </span>
            </div>
            <p className="text-[11px] text-[#64748B] mt-1">
              Totals only. This entry plots on the chart and compares historical net worth totals deterministically.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#111F2D] hover:bg-[#142333] border border-[#233548] text-[#94A3B8] hover:text-[#F5F8FC] text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#22C55E] hover:bg-[#22C55E]/90 text-[#07111C] font-extrabold text-xs transition shadow-sm"
            >
              Add entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
