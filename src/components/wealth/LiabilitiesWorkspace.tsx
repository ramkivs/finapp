import React, { useState } from 'react';
import { Liability } from '../../domain/types';
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
      {/* Controls Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-sm">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Active Credit Facilities & Loans</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Reconciled debt obligations across 9 loan classifications</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-bold block uppercase">Total Debt Obligation</span>
            <span className="text-base font-extrabold text-rose-600 dark:text-rose-400">
              <CurrencyValue value={totDebt} />
            </span>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs transition shadow-sm"
          >
            <Plus size={15} />
            <span>Add Liability</span>
          </button>
        </div>
      </div>

      {liabilities.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center shadow-sm">
          <div className="text-base font-bold text-gray-900 dark:text-white">No liabilities recorded</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">
            Add a liability to calculate your net worth accurately. Track mortgages, vehicle loans, personal loans, and credit cards.
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="mt-5 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition shadow-sm"
          >
            <Plus size={14} />
            <span>Add Liability</span>
          </button>
        </div>
      ) : (
        <LiabilityTable liabilities={liabilities} />
      )}

      <AddLiabilityModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};
