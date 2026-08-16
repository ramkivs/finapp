import React, { useState } from 'react';
import { FinancialQueries } from '../../application/queries';
import { CurrencyValue } from '../CurrencyValue';
import { ProvenanceBadge } from '../ui/ProvenanceBadge';
import { Percent, TrendingUp, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

export const CagrCalculator: React.FC = () => {
  const [initialValue, setInitialValue] = useState<number>(100000);
  const [finalValue, setFinalValue] = useState<number>(250000);
  const [years, setYears] = useState<number>(5);

  const calcResult = FinancialQueries.calculateCagr(initialValue, finalValue, years);
  const result = calcResult.data || {
    cagr: 0,
    absoluteGrowthPct: 0,
    multiplier: 0,
    isValid: false,
    error: calcResult.error?.message || 'Invalid calculation'
  };

  return (
    <div className="space-y-6">
      {/* Header Form */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2.5">
          <Percent className="text-cyan-600 dark:text-cyan-400" size={20} />
          <div>
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
              Compound Annual Growth Rate (CAGR) Calculator
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Calculate geometric mean annualized growth rate across multi-year asset valuations
            </p>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Beginning Value (₹)
            </label>
            <input
              id="input-cagr-initial"
              type="number"
              value={initialValue}
              onChange={e => setInitialValue(Number(e.target.value) || 0)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white font-bold outline-none focus:border-cyan-600"
            />
            <div className="flex gap-1.5 mt-2">
              {[50000, 100000, 500000, 1000000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setInitialValue(amt)}
                  className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold text-gray-600 dark:text-gray-400 hover:text-cyan-600"
                >
                  ₹{(amt / 1000)}k
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Ending / Final Value (₹)
            </label>
            <input
              id="input-cagr-final"
              type="number"
              value={finalValue}
              onChange={e => setFinalValue(Number(e.target.value) || 0)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white font-bold outline-none focus:border-cyan-600"
            />
            <div className="flex gap-1.5 mt-2">
              {[150000, 250000, 500000, 2000000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setFinalValue(amt)}
                  className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold text-gray-600 dark:text-gray-400 hover:text-cyan-600"
                >
                  ₹{(amt / 1000)}k
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Holding Period (Years)
            </label>
            <input
              id="input-cagr-years"
              type="number"
              step="0.5"
              value={years}
              onChange={e => setYears(Number(e.target.value) || 0)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white font-bold outline-none focus:border-cyan-600"
            />
            <div className="flex gap-1.5 mt-2">
              {[1, 2, 3, 5, 10].map(y => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setYears(y)}
                  className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold text-gray-600 dark:text-gray-400 hover:text-cyan-600"
                >
                  {y}Y
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Output */}
      {result.isValid ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
              Compound Annual Growth Rate (CAGR)
            </span>
            <div className="text-3xl font-black text-cyan-600 dark:text-cyan-400 mt-1">
              {result.cagr >= 0 ? '+' : ''}{result.cagr}%
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
              Annualized geometric compounding rate
            </span>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
              Absolute Total Return
            </span>
            <div className="text-3xl font-black text-green-700 dark:text-green-400 mt-1">
              {result.absoluteGrowthPct >= 0 ? '+' : ''}{result.absoluteGrowthPct}%
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
              Net Gain: <CurrencyValue value={finalValue - initialValue} />
            </span>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
              Capital Multiple
            </span>
            <div className="text-3xl font-black text-gray-900 dark:text-white mt-1">
              {result.multiplier}x
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
              Ending vs Initial Valuation
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl p-6 flex items-center gap-3">
          <ShieldAlert className="text-rose-600 flex-shrink-0" size={20} />
          <div>
            <h4 className="text-xs font-bold text-rose-800 dark:text-rose-300">Invalid Input Bounds</h4>
            <p className="text-xs text-rose-700 dark:text-rose-400 mt-0.5">{result.error}</p>
          </div>
        </div>
      )}

      {/* Formula Explanation Card */}
      <div className="bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 p-5 rounded-2xl space-y-2 text-xs text-gray-600 dark:text-gray-400">
        <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>Mathematical Formulation</span>
        </div>
        <p className="font-mono bg-white dark:bg-gray-900 p-2 rounded-lg border border-gray-200 dark:border-gray-800">
          CAGR = (Ending Value / Beginning Value)^(1 / Years) - 1
        </p>
        <p className="text-[11px] text-gray-500">
          CAGR smoothes out year-to-year volatility to depict what an investment would have yielded on an annually compounded basis.
        </p>
      </div>

      {/* Institutional Provenance Badge */}
      {calcResult.provenance && (
        <ProvenanceBadge provenance={calcResult.provenance} />
      )}
    </div>
  );
};
