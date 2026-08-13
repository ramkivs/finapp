import React from 'react';
import { Asset } from '../../domain/types';
import { CurrencyValue } from '../CurrencyValue';

interface AssetTableProps {
  assets: Asset[];
}

export const AssetTable: React.FC<AssetTableProps> = ({ assets }) => {
  if (assets.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th className="py-3.5 px-6">Asset Name</th>
              <th className="py-3.5 px-6">Category</th>
              <th className="py-3.5 px-6">Geography</th>
              <th className="py-3.5 px-6">Currency</th>
              <th className="py-3.5 px-6 text-right">Valuation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
            {assets.map((a) => (
              <tr key={a.name} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                <td className="py-3.5 px-6 font-bold text-gray-900 dark:text-white">{a.name}</td>
                <td className="py-3.5 px-6">
                  <span className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold">
                    {a.type || 'Unclassified'}
                  </span>
                </td>
                <td className="py-3.5 px-6 text-gray-600 dark:text-gray-400 text-xs">
                  {a.geography || 'Not Specified'}
                </td>
                <td className="py-3.5 px-6 text-gray-600 dark:text-gray-400 text-xs">
                  {a.currency || 'Not Specified'}
                </td>
                <td className="py-3.5 px-6 font-bold text-green-700 dark:text-green-400 text-right">
                  <CurrencyValue value={a.amount} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
