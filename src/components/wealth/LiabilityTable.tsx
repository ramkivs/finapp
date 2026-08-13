import React from 'react';
import { Liability } from '../../domain/types';
import { CurrencyValue } from '../CurrencyValue';

interface LiabilityTableProps {
  liabilities: Liability[];
}

export const LiabilityTable: React.FC<LiabilityTableProps> = ({ liabilities }) => {
  if (liabilities.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th className="py-3.5 px-6">Liability Name</th>
              <th className="py-3.5 px-6">Loan Type</th>
              <th className="py-3.5 px-6">Currency</th>
              <th className="py-3.5 px-6 text-right">Obligation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
            {liabilities.map((l) => (
              <tr key={l.name} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                <td className="py-3.5 px-6 font-bold text-gray-900 dark:text-white">{l.name}</td>
                <td className="py-3.5 px-6">
                  <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 text-xs font-bold">
                    {l.type || 'Unclassified'}
                  </span>
                </td>
                <td className="py-3.5 px-6 text-gray-600 dark:text-gray-400 text-xs">
                  {l.currency || 'Not Specified'}
                </td>
                <td className="py-3.5 px-6 font-bold text-rose-600 dark:text-rose-400 text-right">
                  <CurrencyValue value={l.amount} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
