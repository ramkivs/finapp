import React, { useState } from 'react';
import { FinancialQueries } from '../../application/queries';
import { CurrencyValue } from '../CurrencyValue';
import { ProvenanceBadge } from '../ui/ProvenanceBadge';
import { X, Target, TrendingUp, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const GoalReverseSipModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [targetAmount, setTargetAmount] = useState<number>(2500000);
  const [targetYears, setTargetYears] = useState<number>(5);
  const [expectedReturn, setExpectedReturn] = useState<number>(12.0);
  const [stepUpPct, setStepUpPct] = useState<number>(10.0);
  const [existingSavings, setExistingSavings] = useState<number>(200000);

  if (!isOpen) return null;

  const result = FinancialQueries.calculateGoalReverseSip({
    targetCorpus: targetAmount,
    tenureYears: targetYears,
    annualExpectedRatePct: expectedReturn,
    annualStepUpPct: stepUpPct,
    currentSavings: existingSavings
  });

  const data = result.data;
  const requiredSip = data ? data.requiredMonthlySip : 0;
  const totalDeposited = data ? data.totalCapitalInvested : 0;
  const totalGains = data ? data.totalEstimatedGains : 0;
  const existingGrowth = data ? data.currentSavingsFutureValue : 0;
  const remainingDeficit = data ? data.remainingCorpusDeficit : targetAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#161B22] border border-[#21262D] rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#21262D]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pink-950/40 border border-pink-800/30 flex items-center justify-center text-[#EC4899]">
              <Target size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#F0F6FC]">
                Goal Planner & Reverse SIP Calculator
              </h3>
              <p className="text-[11px] text-[#8B949E]">
                Root-Finding Solver for Exact Target Corpus SIP Accumulation
              </p>
            </div>
          </div>
          <button
            id="btn-close-goal-modal"
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
              Target Goal Corpus (₹)
            </label>
            <input
              id="input-goal-target"
              type="number"
              value={targetAmount}
              onChange={e => setTargetAmount(Number(e.target.value) || 0)}
              className="w-full bg-[#0D1117] border border-[#21262D] rounded-xl px-3.5 py-2.5 text-xs text-[#F0F6FC] font-bold outline-none focus:border-[#EC4899]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#8B949E] mb-1">
              Time to Reach Goal (Years)
            </label>
            <input
              id="input-goal-years"
              type="number"
              value={targetYears}
              onChange={e => setTargetYears(Number(e.target.value) || 0)}
              className="w-full bg-[#0D1117] border border-[#21262D] rounded-xl px-3.5 py-2.5 text-xs text-[#F0F6FC] font-bold outline-none focus:border-[#EC4899]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#8B949E] mb-1">
              Expected Annual Return (% p.a.)
            </label>
            <input
              id="input-goal-rate"
              type="number"
              step="0.5"
              value={expectedReturn}
              onChange={e => setExpectedReturn(Number(e.target.value) || 0)}
              className="w-full bg-[#0D1117] border border-[#21262D] rounded-xl px-3.5 py-2.5 text-xs text-[#F0F6FC] font-bold outline-none focus:border-[#EC4899]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#8B949E] mb-1">
              Annual Step-Up (% increase/yr)
            </label>
            <input
              id="input-goal-stepup"
              type="number"
              step="1"
              value={stepUpPct}
              onChange={e => setStepUpPct(Number(e.target.value) || 0)}
              className="w-full bg-[#0D1117] border border-[#21262D] rounded-xl px-3.5 py-2.5 text-xs text-[#F0F6FC] font-bold outline-none focus:border-[#EC4899]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-[#8B949E] mb-1">
              Existing Current Savings (₹)
            </label>
            <input
              id="input-goal-existing"
              type="number"
              value={existingSavings}
              onChange={e => setExistingSavings(Number(e.target.value) || 0)}
              className="w-full bg-[#0D1117] border border-[#21262D] rounded-xl px-3.5 py-2.5 text-xs text-[#F0F6FC] font-bold outline-none focus:border-[#EC4899]"
            />
          </div>
        </div>

        {/* Results Card */}
        <div className="bg-[#0D1117] border border-[#21262D] rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-baseline">
            <div>
              <span className="text-xs font-bold text-[#8B949E]">Required Starting Monthly SIP:</span>
              <div className="text-[10px] text-[#8B949E] mt-0.5">
                Target: <CurrencyValue value={targetAmount} /> in {targetYears} years
              </div>
            </div>
            <span className="text-2xl font-black text-[#EC4899]">
              <CurrencyValue value={requiredSip} />
              <span className="text-xs font-semibold text-[#8B949E] ml-1">/mo</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-[#21262D]/60 text-xs">
            <div>
              <span className="text-[10px] text-[#8B949E] block">Total Capital to Invest</span>
              <span className="font-bold text-[#F0F6FC]"><CurrencyValue value={totalDeposited} /></span>
            </div>
            <div>
              <span className="text-[10px] text-[#8B949E] block">Estimated Compound Gains</span>
              <span className="font-bold text-[#23C55E]">+<CurrencyValue value={totalGains} /></span>
            </div>
            <div>
              <span className="text-[10px] text-[#8B949E] block">Existing Savings at Maturity</span>
              <span className="font-bold text-[#4F8CFF]"><CurrencyValue value={existingGrowth} /></span>
            </div>
          </div>
        </div>

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
