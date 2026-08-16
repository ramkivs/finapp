import React, { useState } from 'react';
import { FinancialQueries } from '../../application/queries';
import { CurrencyValue } from '../CurrencyValue';
import { ProvenanceBadge } from '../ui/ProvenanceBadge';
import { X, ArrowDownRight, AlertTriangle, CheckCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SwpCalculatorModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [initialCorpus, setInitialCorpus] = useState<number>(5000000);
  const [monthlyWithdrawal, setMonthlyWithdrawal] = useState<number>(30000);
  const [expectedReturn, setExpectedReturn] = useState<number>(8.5);
  const [tenureYears, setTenureYears] = useState<number>(15);
  const [annualStepUp, setAnnualStepUp] = useState<number>(5.0);
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  if (!isOpen) return null;

  const result = FinancialQueries.calculateSwp({
    initialCorpus,
    monthlyWithdrawal,
    annualReturnRatePct: expectedReturn,
    tenureYears,
    annualStepUpPct: annualStepUp
  });

  const data = result.data;
  const totalWithdrawn = data ? data.totalWithdrawn : 0;
  const remainingCorpus = data ? data.finalRemainingCorpus : 0;
  const totalGains = data ? data.totalGainsGenerated : 0;
  const isDepleted = data ? data.isCorpusExhausted : false;
  const depletionMonth = data ? data.exhaustionMonth : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#161B22] border border-[#21262D] rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#21262D]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-950/40 border border-cyan-800/30 flex items-center justify-center text-[#06B6D4]">
              <ArrowDownRight size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#F0F6FC]">
                Systematic Withdrawal Plan (SWP) Calculator
              </h3>
              <p className="text-[11px] text-[#8B949E]">
                Cash Flow Sustenance & Longevity Depletion Solver
              </p>
            </div>
          </div>
          <button
            id="btn-close-swp-modal"
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
              Initial Investment Corpus (₹)
            </label>
            <input
              id="input-swp-corpus"
              type="number"
              value={initialCorpus}
              onChange={e => setInitialCorpus(Number(e.target.value) || 0)}
              className="w-full bg-[#0D1117] border border-[#21262D] rounded-xl px-3.5 py-2.5 text-xs text-[#F0F6FC] font-bold outline-none focus:border-[#06B6D4]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#8B949E] mb-1">
              Monthly Withdrawal Amount (₹)
            </label>
            <input
              id="input-swp-withdrawal"
              type="number"
              value={monthlyWithdrawal}
              onChange={e => setMonthlyWithdrawal(Number(e.target.value) || 0)}
              className="w-full bg-[#0D1117] border border-[#21262D] rounded-xl px-3.5 py-2.5 text-xs text-[#F0F6FC] font-bold outline-none focus:border-[#06B6D4]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#8B949E] mb-1">
              Expected Annual Return (% p.a.)
            </label>
            <input
              id="input-swp-rate"
              type="number"
              step="0.1"
              value={expectedReturn}
              onChange={e => setExpectedReturn(Number(e.target.value) || 0)}
              className="w-full bg-[#0D1117] border border-[#21262D] rounded-xl px-3.5 py-2.5 text-xs text-[#F0F6FC] font-bold outline-none focus:border-[#06B6D4]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#8B949E] mb-1">
              Duration (Years)
            </label>
            <input
              id="input-swp-tenure"
              type="number"
              value={tenureYears}
              onChange={e => setTenureYears(Number(e.target.value) || 0)}
              className="w-full bg-[#0D1117] border border-[#21262D] rounded-xl px-3.5 py-2.5 text-xs text-[#F0F6FC] font-bold outline-none focus:border-[#06B6D4]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-[#8B949E] mb-1">
              Annual Withdrawal Step-Up (% inflation adjustment)
            </label>
            <input
              id="input-swp-stepup"
              type="number"
              step="0.5"
              value={annualStepUp}
              onChange={e => setAnnualStepUp(Number(e.target.value) || 0)}
              className="w-full bg-[#0D1117] border border-[#21262D] rounded-xl px-3.5 py-2.5 text-xs text-[#F0F6FC] font-bold outline-none focus:border-[#06B6D4]"
            />
          </div>
        </div>

        {/* Results Card */}
        <div className="bg-[#0D1117] border border-[#21262D] rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-baseline">
            <div>
              <span className="text-xs font-bold text-[#8B949E]">Final Remaining Corpus:</span>
              <div className="mt-0.5">
                {isDepleted ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#EF4444]">
                    <AlertTriangle size={12} /> Corpus Depleted in Month {depletionMonth} (~{(depletionMonth! / 12).toFixed(1)} yrs)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#23C55E]">
                    <CheckCircle size={12} /> Portfolio Fully Sustained
                  </span>
                )}
              </div>
            </div>
            <span className={`text-xl font-black ${isDepleted ? 'text-[#EF4444]' : 'text-[#06B6D4]'}`}>
              <CurrencyValue value={remainingCorpus} />
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-[#21262D]/60 text-xs">
            <div>
              <span className="text-[10px] text-[#8B949E] block">Total Amount Withdrawn</span>
              <span className="font-bold text-[#F0F6FC]"><CurrencyValue value={totalWithdrawn} /></span>
            </div>
            <div>
              <span className="text-[10px] text-[#8B949E] block">Total Market Gains Earned</span>
              <span className="font-bold text-[#23C55E]">+<CurrencyValue value={totalGains} /></span>
            </div>
            <div>
              <span className="text-[10px] text-[#8B949E] block">Initial Principal</span>
              <span className="font-bold text-[#8B949E]"><CurrencyValue value={initialCorpus} /></span>
            </div>
          </div>
        </div>

        {/* Schedule Accordion */}
        {data && data.yearlySchedule.length > 0 && (
          <div className="border border-[#21262D]/60 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowSchedule(!showSchedule)}
              className="w-full px-4 py-2.5 bg-[#0D1117] hover:bg-[#161B22] flex justify-between items-center text-xs font-bold text-[#F0F6FC] transition cursor-pointer"
            >
              <span>Yearly Withdrawal & Balance Schedule ({data.yearlySchedule.length} Years)</span>
              <span className="text-[10px] text-[#06B6D4]">{showSchedule ? 'Hide Schedule' : 'Show Schedule'}</span>
            </button>

            {showSchedule && (
              <div className="max-h-56 overflow-y-auto divide-y divide-[#21262D]/40 bg-[#161B22]/60 text-[11px]">
                {data.yearlySchedule.map(row => (
                  <div key={row.year} className="px-4 py-2 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-[#F0F6FC]">Year {row.year}</span>
                      <span className="text-[10px] text-[#8B949E] ml-2">Withdrawn: <CurrencyValue value={row.totalWithdrawnThisYear} /></span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#F0F6FC]"><CurrencyValue value={row.closingBalance} /></span>
                      <span className="text-[10px] text-[#23C55E] block">+<CurrencyValue value={row.interestEarnedThisYear} /> gains</span>
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
