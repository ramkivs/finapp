import React, { useState } from 'react';
import { FinancialQueries } from '../../application/queries';
import { CurrencyValue } from '../CurrencyValue';
import { ProvenanceBadge } from '../ui/ProvenanceBadge';
import { Landmark, Calendar, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';

export const LumpsumCalculator: React.FC = () => {
  const [principal, setPrincipal] = useState<number>(500000);
  const [annualRate, setAnnualRate] = useState<number>(12.0);
  const [years, setYears] = useState<number>(10);
  const [inflationRate, setInflationRate] = useState<number>(6.0);
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  const calcResult = FinancialQueries.calculateLumpsum(principal, annualRate, years, inflationRate);
  const result = calcResult.data || {
    investedAmount: 0,
    estimatedReturns: 0,
    totalValue: 0,
    realPurchasingPower: 0,
    absoluteGrowthMultiple: 0,
    yearlyBreakdown: []
  };

  const investedPct = result.totalValue > 0
    ? Math.round((result.investedAmount / result.totalValue) * 100)
    : 0;
  const returnsPct = 100 - investedPct;

  return (
    <div className="space-y-6">
      {/* Input Header Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2.5">
          <Landmark className="text-cyan-600 dark:text-cyan-400" size={20} />
          <div>
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
              One-Time Lumpsum Wealth Compounding Calculator
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Project future portfolio value with long-term compound growth and inflation-adjusted purchasing power
            </p>
          </div>
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              One-Time Principal (₹)
            </label>
            <input
              id="input-lump-amount"
              type="number"
              value={principal}
              onChange={e => setPrincipal(Math.max(0, Number(e.target.value) || 0))}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white font-bold outline-none focus:border-green-600"
            />
            <div className="flex gap-1.5 mt-2">
              {[100000, 500000, 1000000, 2500000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setPrincipal(amt)}
                  className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold text-gray-600 dark:text-gray-400 hover:text-green-700"
                >
                  ₹{(amt / 100000)}L
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Expected Return Rate (% p.a.)
            </label>
            <input
              id="input-lump-rate"
              type="number"
              step="0.5"
              value={annualRate}
              onChange={e => setAnnualRate(Math.max(0, Number(e.target.value) || 0))}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white font-bold outline-none focus:border-green-600"
            />
            <div className="flex gap-1.5 mt-2">
              {[8, 10, 12, 15].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setAnnualRate(r)}
                  className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold text-gray-600 dark:text-gray-400 hover:text-green-700"
                >
                  {r}%
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Investment Horizon (Years)
            </label>
            <input
              id="input-lump-years"
              type="number"
              value={years}
              onChange={e => setYears(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white font-bold outline-none focus:border-green-600"
            />
            <div className="flex gap-1.5 mt-2">
              {[3, 5, 10, 15, 20].map(y => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setYears(y)}
                  className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold text-gray-600 dark:text-gray-400 hover:text-green-700"
                >
                  {y}Y
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Expected Inflation Rate (% / yr)
            </label>
            <input
              id="input-lump-inflation"
              type="number"
              step="0.5"
              value={inflationRate}
              onChange={e => setInflationRate(Math.max(0, Number(e.target.value) || 0))}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white font-bold outline-none focus:border-green-600"
            />
            <div className="flex gap-1.5 mt-2">
              {[4, 5, 6, 7].map(inf => (
                <button
                  key={inf}
                  type="button"
                  onClick={() => setInflationRate(inf)}
                  className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold text-gray-600 dark:text-gray-400 hover:text-green-700"
                >
                  {inf}%
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
            Principal Invested
          </span>
          <div className="text-xl font-black text-gray-900 dark:text-white mt-1">
            <CurrencyValue value={result.investedAmount} />
          </div>
          <span className="text-[10px] text-gray-400 mt-0.5 block">
            One-time committed capital
          </span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
            Estimated Wealth Gain
          </span>
          <div className="text-xl font-black text-cyan-600 dark:text-cyan-400 mt-1">
            <CurrencyValue value={result.estimatedReturns} />
          </div>
          <span className="text-[10px] text-cyan-700 dark:text-cyan-400 mt-0.5 block font-bold">
            {result.absoluteGrowthMultiple}x Capital Multiplier
          </span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
            Nominal Future Value
          </span>
          <div className="text-xl font-black text-green-700 dark:text-green-400 mt-1">
            <CurrencyValue value={result.totalValue} />
          </div>
          <span className="text-[10px] text-green-700 dark:text-green-400 mt-0.5 block font-semibold">
            At {years} Years Maturity
          </span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
            Real Purchasing Power
          </span>
          <div className="text-xl font-black text-gray-900 dark:text-white mt-1">
            <CurrencyValue value={result.realPurchasingPower} />
          </div>
          <span className="text-[10px] text-rose-600 dark:text-rose-400 mt-0.5 block font-semibold">
            Adjusted for {inflationRate}% inflation
          </span>
        </div>
      </div>

      {/* Visual Growth Split Bar */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-600 inline-block" />
            <span>Principal: <CurrencyValue value={result.investedAmount} /> ({investedPct}%)</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-600 inline-block" />
            <span>Growth Gain: <CurrencyValue value={result.estimatedReturns} /> ({returnsPct}%)</span>
          </span>
        </div>

        <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
          <div style={{ width: `${investedPct}%` }} className="bg-gray-400 dark:bg-gray-600 h-full transition-all duration-300" />
          <div style={{ width: `${returnsPct}%` }} className="bg-cyan-600 h-full transition-all duration-300" />
        </div>
      </div>

      {/* Year-by-Year Growth Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-cyan-600 dark:text-cyan-400" />
            <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
              Year-by-Year Lumpsum Compounding Trajectory
            </h4>
          </div>
          <button
            type="button"
            onClick={() => setShowSchedule(!showSchedule)}
            className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            {showSchedule ? 'Hide Schedule' : 'Show Full Schedule'}
          </button>
        </div>

        {showSchedule && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Year</th>
                  <th className="py-2.5 px-3">Principal</th>
                  <th className="py-2.5 px-3">Accumulated Interest</th>
                  <th className="py-2.5 px-3 text-right">Portfolio Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {result.yearlyBreakdown.map(row => (
                  <tr key={row.year} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <td className="py-2.5 px-3 font-bold text-gray-900 dark:text-white">Year {row.year}</td>
                    <td className="py-2.5 px-3 text-gray-700 dark:text-gray-300"><CurrencyValue value={row.invested} /></td>
                    <td className="py-2.5 px-3 font-bold text-cyan-600 dark:text-cyan-400">+<CurrencyValue value={row.interestEarned} /></td>
                    <td className="py-2.5 px-3 text-right font-black text-green-700 dark:text-green-400"><CurrencyValue value={row.value} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Institutional Provenance Badge */}
      {calcResult.provenance && (
        <ProvenanceBadge provenance={calcResult.provenance} />
      )}
    </div>
  );
};
