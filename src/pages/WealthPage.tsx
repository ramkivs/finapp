import React from 'react';
import { useCanonicalLedger } from '../store/useCanonicalLedger';
import { FinancialMetricService } from '../services/FinancialMetricService';
import { CurrencyValue } from '../components/CurrencyValue';

export const WealthPage: React.FC = () => {
  const { transactions, assets, liabilities } = useCanonicalLedger();

  const ttmMetric = FinancialMetricService.getMetric('TTM_REALIZED_DIVIDEND', transactions, assets, liabilities);
  const avgMetric = FinancialMetricService.getMetric('MONTHLY_AVERAGE_DIVIDEND', transactions, assets, liabilities);
  const mtdMetric = FinancialMetricService.getMetric('MTD_REALIZED_DIVIDEND', transactions, assets, liabilities);
  const histogramSeries = FinancialMetricService.getSeries('MONTHLY_DIVIDEND_HISTOGRAM', transactions);

  const buckets = histogramSeries?.points || [];
  const maxAmt = Math.max(...buckets.map(b => b.amount), 100);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Dividend Cash Flow Dashboard</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          "Do you know how much dividend you receive in a year? Do you know the actual cash flow you're generating?"
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 mb-1">Reconciled 12-Month Total Dividend</div>
          <div className="text-3xl font-black text-gray-900 dark:text-white mb-2">
            <CurrencyValue value={ttmMetric.value} />
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
            Option A Supreme Authority
          </span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 mb-1">Reconciled Monthly Average</div>
          <div className="text-3xl font-black text-gray-900 dark:text-white mb-2">
            <CurrencyValue value={avgMetric.value} decimals={2} />
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 text-xs font-bold">
            12M Total / 12 Months
          </span>
        </div>

        <div className="bg-green-50/50 dark:bg-green-950/20 border border-green-300 dark:border-green-800 rounded-2xl p-6 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 mb-1">August 2026 (Ongoing Month - MTD)</div>
          <div className="text-3xl font-black text-green-700 dark:text-green-400 mb-2">
            <CurrencyValue value={mtdMetric.value} />
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-xs font-bold">
            3 Payouts Received (MTD*)
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-6">
          Month-by-Month Reconciled 12M Dividend Cash Flow (FinancialSeries)
        </h3>

        <div className="h-[250px] flex items-end gap-3 pb-4 border-b border-gray-200 dark:border-gray-800">
          {buckets.map((b, i) => {
            const heightPct = Math.round((b.amount / maxAmt) * 100);
            return (
              <div key={b.month} className="flex-1 flex flex-col items-center h-full justify-end">
                <div
                  title={`${b.month}: ₹${b.amount.toLocaleString()} (${b.payoutCount} payouts)`}
                  style={{ height: `${Math.max(heightPct, 5)}%` }}
                  className={`w-full rounded-t-lg transition-all ${
                    b.amount === maxAmt
                      ? 'bg-cyan-600 dark:bg-cyan-500'
                      : b.isMtd
                      ? 'bg-amber-500 border-2 border-dashed border-gray-900 dark:border-white'
                      : 'bg-green-600 dark:bg-green-500'
                  }`}
                />
              </div>
            );
          })}
        </div>

        <div className="flex justify-between text-xs text-gray-500 mt-2">
          {buckets.map(b => (
            <span key={b.month}>{b.month}</span>
          ))}
        </div>
      </div>
    </div>
  );
};
