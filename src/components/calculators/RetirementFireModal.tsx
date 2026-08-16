import React, { useState } from 'react';
import { FinancialQueries } from '../../application/queries';
import { CurrencyValue } from '../CurrencyValue';
import { ProvenanceBadge } from '../ui/ProvenanceBadge';
import { X, Flame, Shield, TrendingUp } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const RetirementFireModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [currentAge, setCurrentAge] = useState<number>(30);
  const [retirementAge, setRetirementAge] = useState<number>(50);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(60000);
  const [monthlySavings, setMonthlySavings] = useState<number>(35000);
  const [existingCorpus, setExistingCorpus] = useState<number>(1000000);
  const [inflationRate, setInflationRate] = useState<number>(6.0);
  const [preReturn, setPreReturn] = useState<number>(12.0);
  const [postReturn, setPostReturn] = useState<number>(8.0);
  const [swrPct, setSwrPct] = useState<number>(4.0);

  if (!isOpen) return null;

  const result = FinancialQueries.calculateRetirementFire({
    currentAge,
    targetRetirementAge: retirementAge,
    annualLivingExpenses: monthlyExpenses * 12,
    currentInvestedCorpus: existingCorpus,
    monthlySavings,
    preRetirementReturnRatePct: preReturn,
    postRetirementReturnRatePct: postReturn,
    expectedInflationPct: inflationRate,
    safeWithdrawalRatePct: swrPct
  });

  const data = result.data;
  const fireCorpus = data ? data.targetRetirementCorpus : 0;
  const projectedCorpus = data ? data.projectedCorpusAtRetirement : 0;
  const coastFireCorpus = data ? data.coastFireCorpusToday : 0;
  const futureExpenses = data ? data.futureAnnualExpensesAtRetirement : 0;
  const yearsToRetire = data ? data.yearsToRetirement : 0;
  const isAchievable = data ? data.isTargetAchievable : false;
  const surplusDeficit = data ? data.corpusDeficitOrSurplus : 0;
  const multiple = data ? data.fireMultiplier : 25;
  const runway = data ? data.currentRunwayYears : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#161B22] border border-[#21262D] rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#21262D]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-950/40 border border-orange-800/30 flex items-center justify-center text-[#F97316]">
              <Flame size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#F0F6FC]">
                Retirement & FIRE Number Engine
              </h3>
              <p className="text-[11px] text-[#8B949E]">
                Safe Withdrawal Rate (SWR) Corpus Capitalization Model
              </p>
            </div>
          </div>
          <button
            id="btn-close-fire-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#0D1117] hover:bg-[#21262D] border border-[#21262D] flex items-center justify-center text-[#8B949E] hover:text-[#F0F6FC] transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-[#8B949E] mb-1">
              Current Age
            </label>
            <input
              id="input-fire-current-age"
              type="number"
              value={currentAge}
              onChange={e => setCurrentAge(Number(e.target.value) || 0)}
              className="w-full bg-[#0D1117] border border-[#21262D] rounded-xl px-3 py-2 text-xs text-[#F0F6FC] font-bold outline-none focus:border-[#F97316]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#8B949E] mb-1">
              Target Age (FIRE)
            </label>
            <input
              id="input-fire-retire-age"
              type="number"
              value={retirementAge}
              onChange={e => setRetirementAge(Number(e.target.value) || 0)}
              className="w-full bg-[#0D1117] border border-[#21262D] rounded-xl px-3 py-2 text-xs text-[#F0F6FC] font-bold outline-none focus:border-[#F97316]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-[#8B949E] mb-1">
              Current Monthly Expenses (₹)
            </label>
            <input
              id="input-fire-expenses"
              type="number"
              value={monthlyExpenses}
              onChange={e => setMonthlyExpenses(Number(e.target.value) || 0)}
              className="w-full bg-[#0D1117] border border-[#21262D] rounded-xl px-3 py-2 text-xs text-[#F0F6FC] font-bold outline-none focus:border-[#F97316]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-[#8B949E] mb-1">
              Current Portfolio Corpus (₹)
            </label>
            <input
              id="input-fire-existing"
              type="number"
              value={existingCorpus}
              onChange={e => setExistingCorpus(Number(e.target.value) || 0)}
              className="w-full bg-[#0D1117] border border-[#21262D] rounded-xl px-3 py-2 text-xs text-[#F0F6FC] font-bold outline-none focus:border-[#F97316]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-[#8B949E] mb-1">
              Planned Monthly Savings (₹)
            </label>
            <input
              id="input-fire-savings"
              type="number"
              value={monthlySavings}
              onChange={e => setMonthlySavings(Number(e.target.value) || 0)}
              className="w-full bg-[#0D1117] border border-[#21262D] rounded-xl px-3 py-2 text-xs text-[#F0F6FC] font-bold outline-none focus:border-[#F97316]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#8B949E] mb-1">
              Pre-Retire Return (%)
            </label>
            <input
              id="input-fire-pre-return"
              type="number"
              step="0.5"
              value={preReturn}
              onChange={e => setPreReturn(Number(e.target.value) || 0)}
              className="w-full bg-[#0D1117] border border-[#21262D] rounded-xl px-3 py-2 text-xs text-[#F0F6FC] font-bold outline-none focus:border-[#F97316]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#8B949E] mb-1">
              Inflation Rate (%)
            </label>
            <input
              id="input-fire-inflation"
              type="number"
              step="0.5"
              value={inflationRate}
              onChange={e => setInflationRate(Number(e.target.value) || 0)}
              className="w-full bg-[#0D1117] border border-[#21262D] rounded-xl px-3 py-2 text-xs text-[#F0F6FC] font-bold outline-none focus:border-[#F97316]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-[#8B949E] mb-1">
              Safe Withdrawal Rate (SWR %)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[3.5, 4.0, 4.5].map(rate => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setSwrPct(rate)}
                  className={`py-1.5 px-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    swrPct === rate
                      ? 'border-[#F97316] bg-orange-950/30 text-[#F97316]'
                      : 'border-[#21262D] bg-[#0D1117] text-[#8B949E] hover:border-[#30363D]'
                  }`}
                >
                  {rate}% ({(100 / rate).toFixed(1)}x)
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="bg-[#0D1117] border border-[#21262D] rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-baseline">
            <div>
              <span className="text-xs font-bold text-[#8B949E]">Target FIRE Corpus (at Age {retirementAge}):</span>
              <div className="text-[10px] text-[#8B949E] mt-0.5">
                Annual Spend at Retirement: <CurrencyValue value={futureExpenses} /> ({multiple}x SWR)
              </div>
            </div>
            <span className="text-2xl font-black text-[#F97316]">
              <CurrencyValue value={fireCorpus} />
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-[#21262D]/60 text-xs">
            <div>
              <span className="text-[10px] text-[#8B949E] block">Projected Wealth at Age {retirementAge}</span>
              <span className={`font-bold ${isAchievable ? 'text-[#23C55E]' : 'text-[#EF4444]'}`}>
                <CurrencyValue value={projectedCorpus} />
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#8B949E] block">Coast FIRE Corpus Today</span>
              <span className="font-bold text-[#4F8CFF]"><CurrencyValue value={coastFireCorpus} /></span>
            </div>
            <div>
              <span className="text-[10px] text-[#8B949E] block">Horizon & Runway</span>
              <span className="font-bold text-[#F0F6FC]">{yearsToRetire}y to FIRE • {runway}y Runway</span>
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
