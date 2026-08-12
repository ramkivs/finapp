import React from 'react';
import { Liability } from '../../domain/types';
import { CurrencyValue } from '../CurrencyValue';
import { useCanonicalLedger } from '../../store/useCanonicalLedger';

interface LiabilityTableProps {
  liabilities: Liability[];
}

export const LiabilityTable: React.FC<LiabilityTableProps> = ({ liabilities }) => {
  if (liabilities.length === 0) return null;

  return (
    <div className="bg-[#0D1824] border border-[#233548] rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#111F2D] border-b border-[#233548] text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
              <th className="py-3 px-5">Liability Name</th>
              <th className="py-3 px-5">Loan Type</th>
              <th className="py-3 px-5">Currency</th>
              <th className="py-3 px-5">Obligation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#233548]/60 text-xs text-[#F5F8FC]">
            {liabilities.map((l) => (
              <tr key={l.name} className="hover:bg-[#111F2D]/60 transition">
                <td className="py-3.5 px-5 font-bold">{l.name}</td>
                <td className="py-3.5 px-5">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-[10px] font-bold">
                    {l.type || 'Other'}
                  </span>
                </td>
                <td className="py-3.5 px-5 text-[#94A3B8]">
                  {l.currency || 'INR'}
                </td>
                <td className="py-3.5 px-5 font-extrabold text-[#EF4444]">
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
