import React, { useState } from 'react';
import { NetWorthSnapshot } from '../../domain/types';
import { TakeSnapshotModal } from './TakeSnapshotModal';
import { AddPastEntryModal } from './AddPastEntryModal';
import { EmptyState } from '../common/EmptyState';
import { CurrencyValue } from '../CurrencyValue';
import { Camera, Calendar, TrendingUp } from 'lucide-react';

interface Props {
  snapshots: NetWorthSnapshot[];
  totalAssets: number;
  totalLiabilities: number;
}

export const NetWorthWorkspace: React.FC<Props> = ({ snapshots, totalAssets, totalLiabilities }) => {
  const [takeModalOpen, setTakeModalOpen] = useState(false);
  const [pastModalOpen, setPastModalOpen] = useState(false);

  const currentNetWorth = totalAssets - totalLiabilities;
  const sortedSnaps = [...snapshots].sort((a, b) => {
    const tA = new Date(a.dateStr.replace(' (Today)', '')).getTime();
    const tB = new Date(b.dateStr.replace(' (Today)', '')).getTime();
    return (isNaN(tA) ? 0 : tA) - (isNaN(tB) ? 0 : tB);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4 bg-[#0D1824] border border-[#233548] p-5 rounded-2xl shadow-sm">
        <div>
          <h3 className="text-base font-bold text-[#F5F8FC]">Net Worth Historical Snapshots ({snapshots.length})</h3>
          <p className="text-xs text-[#94A3B8] mt-0.5">Reconciled temporal checkpoints anchoring 1-year CAGR compounding</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setPastModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#111F2D] hover:bg-[#142333] border border-[#233548] text-[#94A3B8] hover:text-[#F5F8FC] font-semibold text-xs transition"
          >
            <Calendar size={15} />
            <span>Add Past Entry</span>
          </button>

          <button
            onClick={() => setTakeModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-[#07111C] font-bold text-xs transition shadow-sm"
          >
            <Camera size={15} />
            <span>Take New Snapshot</span>
          </button>
        </div>
      </div>

      {snapshots.length === 0 ? (
        <EmptyState
          title="No net worth snapshots recorded"
          description="Capture your first snapshot or record historical past entries to anchor your authoritative compound growth rate."
          actionLabel="Take New Snapshot"
          onAction={() => setTakeModalOpen(true)}
        />
      ) : (
        <div className="bg-[#0D1824] border border-[#233548] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#111F2D] border-b border-[#233548] text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                  <th className="py-3 px-5">Snapshot Date</th>
                  <th className="py-3 px-5">Label / Reference</th>
                  <th className="py-3 px-5">Total Assets</th>
                  <th className="py-3 px-5">Total Liabilities</th>
                  <th className="py-3 px-5">Net Worth</th>
                  <th className="py-3 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#233548]/60 text-xs text-[#F5F8FC]">
                {sortedSnaps.map((s) => (
                  <tr key={s.id} className="hover:bg-[#111F2D]/60 transition">
                    <td className="py-3.5 px-5 font-bold">{s.dateStr}</td>
                    <td className="py-3.5 px-5 text-[#94A3B8] italic">{s.label || '—'}</td>
                    <td className="py-3.5 px-5 text-[#22C55E] font-semibold">
                      <CurrencyValue value={s.totalAssets} />
                    </td>
                    <td className="py-3.5 px-5 text-[#EF4444] font-semibold">
                      <CurrencyValue value={s.totalLiabilities} />
                    </td>
                    <td className="py-3.5 px-5 font-extrabold text-[#38BDF8]">
                      <CurrencyValue value={s.netWorth} />
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="px-2 py-0.5 rounded-full bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 text-[10px] font-bold">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <TakeSnapshotModal isOpen={takeModalOpen} onClose={() => setTakeModalOpen(false)} />
      <AddPastEntryModal isOpen={pastModalOpen} onClose={() => setPastModalOpen(false)} />
    </div>
  );
};
