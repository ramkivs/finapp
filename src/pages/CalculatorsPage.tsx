import React from 'react';

export const CalculatorsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          Financial Calculators
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Dividend Yield on Invested Capital, Net Worth CAGR, and Emergency EMI Target Planner.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 mb-1">Dividend Yield Calculator</div>
          <div className="text-3xl font-black text-gray-900 dark:text-white mb-2">4.08%</div>
          <span className="px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
            TTM Yield on Invested Capital
          </span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 mb-1">Net Worth CAGR</div>
          <div className="text-3xl font-black text-gray-900 dark:text-white mb-2">+24.1%</div>
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 text-xs font-bold">
            1-Year Compound Growth
          </span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 mb-1">Emergency Fund Goal</div>
          <div className="text-3xl font-black text-gray-900 dark:text-white mb-2">₹3,00,000</div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-xs font-bold">
            6 Months Essential EMIs
          </span>
        </div>
      </div>
    </div>
  );
};
