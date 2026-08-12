import React, { useState } from 'react';
import { Liability, LiabilityType } from '../../domain/types';
import { LiabilityTable } from './LiabilityTable';
import { AddLiabilityModal } from './AddLiabilityModal';
import { CurrencyValue } from '../CurrencyValue';
import { Plus } from 'lucide-react';

interface Props {
  liabilities: Liability[];
}

export const LiabilitiesWorkspace: React.FC<Props> = ({ liabilities }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const totDebt = liabilities.reduce((s, l) => s + l.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4 bg-[#0D1824] border border-[#233548] p-5 rounded-2xl shadow-sm">
        <div>
          <h3 className="text-base font-bold text-[#F5F8FC]">Active Credit Facilities & Loans</h3>
          <p className="text-xs text-[#94A3B8] mt-0.5">Reconciled debt obligations across 9 loan classifications</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[11px] text-[#94A3B8] font-bold block uppercase">Total Debt Obligation</span>
            <span className="text-base font-extrabold text-[#EF4444]">
              <CurrencyValue value={totDebt} />
            </span>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EF4444] hover:bg-[#EF4444]/90 text-white font-bold text-xs transition shadow-sm"
          >
            <Plus size={15} />
            <span>Add Liability</span>
          </button>
        </div>
      </div>

 {liabilities.length === 0 ? (
  <div className="border rounded-xl p-8 text-center">
    <div className="text-sm font-semibold">No liabilities recorded</div>
    <div className="text-xs text-gray-500 mt-2">
      Add a liability to calculate your net worth.
    </div>
    <button
      type="button"
      onClick={() => setModalOpen(true)}
      className="mt-4 px-4 py-2 rounded-lg border text-sm"
    >
      + Add Liability
    </button>
  </div>
) : (
        <LiabilityTable liabilities={liabilities} />
      )}

      <AddLiabilityModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};
