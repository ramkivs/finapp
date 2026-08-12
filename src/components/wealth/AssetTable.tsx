import React from 'react';
import { Asset } from '../../domain/types';
import { CurrencyValue } from '../CurrencyValue';
import { Trash2 } from 'lucide-react';
import { useCanonicalLedger } from '../../store/useCanonicalLedger';

interface AssetTableProps {
  assets: Asset[];
}

export const AssetTable: React.FC<AssetTableProps> = ({ assets }) => {
  const { assets: assetRepo } = useCanonicalLedger();

  const handleDelete = (name: string) => {
    if (window.confirm(`Are you sure you want to remove asset "${name}"?`)) {
      // MemoryAssetRepository supports remove via root or we remove and save
      const all = assetRepo.filter(a => a.name !== name);
      // We update store via replaceAll if supported or add
    }
  };

  if (assets.length === 0) return null;

  return (
    <div className="bg-[#0D1824] border border-[#233548] rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#111F2D] border-b border-[#233548] text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
              <th className="py-3 px-5">Asset Name</th>
              <th className="py-3 px-5">Category</th>
              <th className="py-3 px-5">Geography</th>
              <th className="py-3 px-5">Currency</th>
              <th className="py-3 px-5">Valuation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#233548]/60 text-xs text-[#F5F8FC]">
            {assets.map((a) => (
              <tr key={a.name} className="hover:bg-[#111F2D]/60 transition">
                <td className="py-3.5 px-5 font-bold">{a.name}</td>
                <td className="py-3.5 px-5">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#111F2D] border border-[#233548] text-[#94A3B8] text-[10px] font-bold">
                    {a.type || 'Other'}
                  </span>
                </td>
                <td className="py-3.5 px-5 text-[#94A3B8]">
                  {a.geography || 'India'}
                </td>
                <td className="py-3.5 px-5 text-[#94A3B8]">
                  {a.currency || 'INR'}
                </td>
                <td className="py-3.5 px-5 font-extrabold text-[#22C55E]">
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
