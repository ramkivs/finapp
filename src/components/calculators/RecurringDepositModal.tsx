import React, { useState } from 'react';
import { FinancialQueries } from '../../application/queries';
import { CurrencyValue } from '../CurrencyValue';
import { ProvenanceBadge } from '../ui/ProvenanceBadge';
import { X, Coins, Calendar, PieChart, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const RecurringDepositModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [monthlyDeposit, setMonthlyDeposit] = useState<number>(5000);
  const [annualRate, setAnnualRate] = useState<number>(7.0);
  const [tenureMonths, setTenureMonths] = useState<number>(12);
  const [compoundingFreq, setCompoundingFreq] = useState<'QUARTERLY' | 'MONTHLY'>('QUARTERLY');
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  if (!isOpen) return null;

  const result = FinancialQueries.calculateRecurringDeposit({
    monthlyDeposit,
    annualNominalRatePct: annualRate,
    tenureMonths,
    compoundingFrequency: compoundingFreq
  });

  const data = result.data;
  const totalDeposited = data ? data.totalDeposited : 0;
  const totalInterest = data ? data.totalInterestEarned : 0;
  const maturityCorpus = data ? data.maturityCorpus : 0;
  const effectiveYield = data ? data.effectiveYieldPct : 0;

  const principalPct = maturityCorpus > 0 ? Math.round((totalDeposited / maturityCorpus) * 100) : 0;
  const interestPct = Math.max(0, 100 - principalPct);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#161B22] border border-[#21262D] rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#21262D]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-950/40 border border-amber-800/30 flex items-center justify-center text-[#F59E0B]">
              <Coins size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#F0F6FC]">
                Recurring Deposit (RD) Calculator
              </h3>
              <p className="text-[11px] text-[#8B949E]">
                Model A Quarterly Compounded Bank Annuity Calculator
              </p>
            </div>
          </div>
          <button
            id="btn-close-rd-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#0D1117] hover:bg-[#21262D] border border-[#21262D] flex items-center justify-center text-[#8B949E] hover:text-[#F0F6FC] transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-[#8B949E] mb-1">
              Monthly Deposit Amount (₹)
            </label>
            <input
              id="input-rd-deposit"
              type="number"
              value={monthlyDeposit}
              onChange={e => setMonthlyDeposit(Number(e.target.value) || 0)}
              className="w-full bg-[#0D1117] border border-[#21262D] rounded-xl px-3.5 py-2.5 text-xs text-[#F0F6FC] font-bold outline-none focus:border-[#F59E0B]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#8B949E] mb-1">
              Annual Interest Rate (% p.a.)
            </label>
            <input
              id="input-rd-rate"
              type="number"
              step="0.1"
              value={annualRate}
              onChange={e => setAnnualRate(Number(e.target.value) || 0)}
              className="w-full bg-[#0D1117] border border-[#21262D] rounded-xl px-3.5 py-2.5 text-xs text-[#F0F6FC] font-bold outline-none focus:border-[#F59E0B]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#8B949E] mb-1">
              Tenure (Months)
            </label>
            <input
              id="input-rd-tenure"
              type="number"
              value={tenureMonths}
              onChange={e => setTenureMonths(Number(e.target.value) || 0)}
              className="w-full bg-[#0D1117] border border-[#21262D] rounded-xl px-3.5 py-2.5 text-xs text-[#F0F6FC] font-bold outline-none focus:border-[#F59E0B]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#8B949E] mb-1">
              Compounding Frequency
            </label>
            <select
              id="select-rd-compounding"
              value={compoundingFreq}
              onChange={e => setCompoundingFreq(e.target.value as 'QUARTERLY' | 'MONTHLY')}
              className="w-full bg-[#0D1117] border border-[#21262D] rounded-xl px-3.5 py-2.5 text-xs text-[#F0F6FC] font-bold outline-none focus:border-[#F59E0B]"
            >
              <option value="QUARTERLY">Quarterly (Indian Banking Standard)</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>
        </div>

        {/* Results Card */}
        <div className="bg-[#0D1117] border border-[#21262D] rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-baseline">
            <span className="text-xs font-bold text-[#8B949E]">Total Maturity Corpus:</span>
            <span className="text-xl font-black text-[#F59E0B]">
              <CurrencyValue value={maturityCorpus} />
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-[#21262D]/60 text-xs">
            <div>
              <span className="text-[10px] text-[#8B949E] block">Total Deposited</span>
              <span className="font-bold text-[#F0F6FC]"><CurrencyValue value={totalDeposited} /></span>
            </div>
            <div>
              <span className="text-[10px] text-[#8B949E] block">Total Interest Accrued</span>
              <span className="font-bold text-[#23C55E]">+<CurrencyValue value={totalInterest} /></span>
            </div>
            <div>
              <span className="text-[10px] text-[#8B949E] block">Effective Annual Yield</span>
              <span className="font-bold text-[#4F8CFF]">{effectiveYield}%</span>
            </div>
          </div>

          {/* Progress Bar Visual */}
          <div className="space-y-1.5 pt-1">
            <div className="h-2 w-full bg-[#161B22] rounded-full overflow-hidden flex">
              <div style={{ width: `${principalPct}%` }} className="bg-[#4F8CFF] h-full" title={`Principal: ${principalPct}%`} />
              <div style={{ width: `${interestPct}%` }} className="bg-[#23C55E] h-full" title={`Interest: ${interestPct}%`} />
            </div>
            <div className="flex justify-between text-[10px] text-[#8B949E] font-semibold">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#4F8CFF] inline-block" /> Principal ({principalPct}%)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#23C55E] inline-block" /> Interest ({interestPct}%)</span>
            </div>
          </div>
        </div>

        {/* Schedule Accordion */}
        {data && data.quarterlyBreakdown.length > 0 && (
          <div className="border border-[#21262D]/60 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowSchedule(!showSchedule)}
              className="w-full px-4 py-2.5 bg-[#0D1117] hover:bg-[#161B22] flex justify-between items-center text-xs font-bold text-[#F0F6FC] transition cursor-pointer"
            >
              <span>Quarterly Accrual Schedule ({data.quarterlyBreakdown.length} Quarters)</span>
              <span className="text-[10px] text-[#4F8CFF]">{showSchedule ? 'Hide Schedule' : 'Show Schedule'}</span>
            </button>

            {showSchedule && (
              <div className="max-h-56 overflow-y-auto divide-y divide-[#21262D]/40 bg-[#161B22]/60 text-[11px]">
                {data.quarterlyBreakdown.map(row => (
                  <div key={row.quarter} className="px-4 py-2 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-[#F0F6FC]">Quarter {row.quarter}</span>
                      <span className="text-[10px] text-[#8B949E] ml-2">(Months {row.monthStart}–{row.monthEnd})</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#F0F6FC]"><CurrencyValue value={row.closingBalance} /></span>
                      <span className="text-[10px] text-[#23C55E] block">+<CurrencyValue value={row.interestEarned} /> int</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Institutional Provenance Badge */}
        {result.provenance && (
          <ProvenanceBadge provenance={result.provenance} />
        )}

        {/* Modal Footer */}
        <div className="flex justify-end pt-3 border-t border-[#21262D]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#21262D] hover:bg-[#30363D] text-[#F0F6FC] rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
