import React, { useState } from 'react';
import { EssentialsService } from '../../services/EssentialsService';
import { CurrencyValue } from '../CurrencyValue';
import { X, Calculator, TrendingUp } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const InflationCalculatorModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [presentValue, setPresentValue] = useState<number>(1000000);
  const [inflationRate, setInflationRate] = useState<number>(6.0);
  const [years, setYears] = useState<number>(10);

  if (!isOpen) return null;

  const futureValue = EssentialsService.calculateFutureValueWithInflation(presentValue, inflationRate, years);
  const inflationGap = futureValue - presentValue;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Calculator size={18} className="text-cyan-600 dark:text-cyan-400" />
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
              Inflation & Future Value Calculator
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
          Purchasing power projection: determine the future corpus required to match today's standard of living under long-term inflation.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Target Cost in Today's Terms (₹)
            </label>
            <input
              id="input-calc-pv"
              type="number"
              value={presentValue}
              onChange={e => setPresentValue(Number(e.target.value) || 0)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white outline-none focus:border-green-600 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Expected Inflation Rate (% / yr)
              </label>
              <input
                id="input-calc-inflation"
                type="number"
                step="0.5"
                value={inflationRate}
                onChange={e => setInflationRate(Number(e.target.value) || 0)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white outline-none focus:border-green-600 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Time Horizon (Years)
              </label>
              <input
                id="input-calc-years"
                type="number"
                value={years}
                onChange={e => setYears(Number(e.target.value) || 0)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white outline-none focus:border-green-600 font-bold"
              />
            </div>
          </div>

          {/* Results Box */}
          <div className="bg-gray-50 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 p-4 rounded-xl space-y-2 mt-4">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Future Corpus Required ({years} yrs):</span>
              <span className="text-xl font-black text-cyan-600 dark:text-cyan-400">
                <CurrencyValue value={futureValue} />
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pt-1 border-t border-gray-200 dark:border-gray-700">
              <span>Inflation Impact (Purchasing Power Loss):</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">+<CurrencyValue value={inflationGap} /></span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
