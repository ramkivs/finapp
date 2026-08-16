import React, { useState } from 'react';
import { FinancialQueries } from '../../application/queries';
import { CurrencyValue } from '../CurrencyValue';
import { ProvenanceBadge } from '../ui/ProvenanceBadge';
import { X, Landmark } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PpfCalculatorModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [annualDeposit, setAnnualDeposit] = useState<number>(150000);
  const [interestRate, setInterestRate] = useState<number>(7.1);
  const [tenureYears, setTenureYears] = useState<number>(15);
  const [showLedger, setShowLedger] = useState<boolean>(false);

  if (!isOpen) return null;

  const result = FinancialQueries.calculatePpf({
    annualDepositAmount: annualDeposit,
    customRatePct: interestRate,
    tenureYears
  });

  const data = result.data;
  const totalDeposited = data ? data.totalDeposited : 0;
  const totalInterest = data ? data.totalInterestEarned : 0;
  const maturityCorpus = data ? data.maturityAmount : 0;
  const effectiveTenure = data ? data.statutoryTenureYears : 15;

  const principalPct = maturityCorpus > 0 ? Math.round((totalDeposited / maturityCorpus) * 100) : 0;
  const interestPct = Math.max(0, 100 - principalPct);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#161B22] border border-[#21262D] rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#21262D]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-950/40 border border-purple-800/30 flex items-center justify-center text-[#A855F7]">
              <Landmark size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#F0F6FC]">
                Public Provident Fund (PPF) Calculator
              </h3>
              <p className="text-[11px] text-[#8B949E]">
                PPF Scheme 2019 Statutory Compound Interest Engine (EEE Tax Status)
              </p>
            </div>
          </div>
          <button
            id="btn-close-ppf-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#0D1117] hover:bg-[#21262D] border border-[#21262D] flex items-center justify-center text-[#8B949E] hover:text-[#F0F6FC] transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-[#8B949E] mb-1">
              Annual Deposit (₹) <span className="text-[#8B949E] font-normal">(Max ₹1.5L)</span>
            </label>
            <input
              id="input-ppf-deposit"
              type="number"
              value={annualDeposit}
              onChange={e => setAnnualDeposit(Number(e.target.value) || 0)}
              className="w-full bg-[#0D1117] border border-[#21262D] rounded-xl px-3.5 py-2.5 text-xs text-[#F0F6FC] font-bold outline-none focus:border-[#A855F7]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#8B949E] mb-1">
              Statutory PPF Rate (% p.a.)
            </label>
            <input
              id="input-ppf-rate"
              type="number"
              step="0.1"
              value={interestRate}
              onChange={e => setInterestRate(Number(e.target.value) || 0)}
              className="w-full bg-[#0D1117] border border-[#21262D] rounded-xl px-3.5 py-2.5 text-xs text-[#F0F6FC] font-bold outline-none focus:border-[#A855F7]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#8B949E] mb-1">
              Tenure (Years)
            </label>
            <input
              id="input-ppf-tenure"
              type="number"
              value={tenureYears}
              onChange={e => setTenureYears(Number(e.target.value) || 15)}
              className="w-full bg-[#0D1117] border border-[#21262D] rounded-xl px-3.5 py-2.5 text-xs text-[#F0F6FC] font-bold outline-none focus:border-[#A855F7]"
            />
          </div>
        </div>

        {/* Results Card */}
        <div className="bg-[#0D1117] border border-[#21262D] rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-baseline">
            <div>
              <span className="text-xs font-bold text-[#8B949E]">Total Maturity Value ({effectiveTenure} Years):</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="px-1.5 py-0.2 rounded bg-purple-950/50 border border-purple-800/40 text-[9px] font-bold text-[#A855F7]">
                  EEE Exempt-Exempt-Exempt
                </span>
                <span className="text-[10px] text-[#8B949E]">Sec 80C Compliant</span>
              </div>
            </div>
            <span className="text-xl font-black text-[#A855F7]">
              <CurrencyValue value={maturityCorpus} />
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-[#21262D]/60 text-xs">
            <div>
              <span className="text-[10px] text-[#8B949E] block">Total Principal Deposited</span>
              <span className="font-bold text-[#F0F6FC]"><CurrencyValue value={totalDeposited} /></span>
            </div>
            <div>
              <span className="text-[10px] text-[#8B949E] block">Total Tax-Free Interest</span>
              <span className="font-bold text-[#23C55E]">+<CurrencyValue value={totalInterest} /></span>
            </div>
            <div>
              <span className="text-[10px] text-[#8B949E] block">Section 80C Deduction</span>
              <span className="font-bold text-[#4F8CFF]">₹1,50,000 / yr</span>
            </div>
          </div>

          {/* Progress Bar Visual */}
          <div className="space-y-1.5 pt-1">
            <div className="h-2 w-full bg-[#161B22] rounded-full overflow-hidden flex">
              <div style={{ width: `${principalPct}%` }} className="bg-[#4F8CFF] h-full" title={`Principal: ${principalPct}%`} />
              <div style={{ width: `${interestPct}%` }} className="bg-[#23C55E] h-full" title={`Tax-Free Interest: ${interestPct}%`} />
            </div>
            <div className="flex justify-between text-[10px] text-[#8B949E] font-semibold">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#4F8CFF] inline-block" /> Deposited ({principalPct}%)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#23C55E] inline-block" /> Tax-Free Interest ({interestPct}%)</span>
            </div>
          </div>
        </div>

        {/* Annual Ledger Accordion */}
        {data && data.yearlySchedule.length > 0 && (
          <div className="border border-[#21262D]/60 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowLedger(!showLedger)}
              className="w-full px-4 py-2.5 bg-[#0D1117] hover:bg-[#161B22] flex justify-between items-center text-xs font-bold text-[#F0F6FC] transition cursor-pointer"
            >
              <span>Fiscal Year Balance Progression ({data.yearlySchedule.length} Years)</span>
              <span className="text-[10px] text-[#A855F7]">{showLedger ? 'Hide Progression' : 'Show Progression'}</span>
            </button>

            {showLedger && (
              <div className="max-h-56 overflow-y-auto divide-y divide-[#21262D]/40 bg-[#161B22]/60 text-[11px]">
                {data.yearlySchedule.map(row => (
                  <div key={row.year} className="px-4 py-2 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-[#F0F6FC]">Year {row.year}</span>
                      <span className="text-[10px] text-[#8B949E] ml-2">Dep: <CurrencyValue value={row.depositAmount} /></span>
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
