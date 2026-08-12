import React, { useState } from 'react';
import { useCanonicalLedger } from '../store/useCanonicalLedger';
import { FinancialMetricService } from '../services/FinancialMetricService';
import { CurrencyValue } from '../components/CurrencyValue';
import { AssetsWorkspace } from '../components/wealth/AssetsWorkspace';
import { LiabilitiesWorkspace } from '../components/wealth/LiabilitiesWorkspace';
import { NetWorthWorkspace } from '../components/wealth/NetWorthWorkspace';
import { AllocationWorkspace } from '../components/wealth/AllocationWorkspace';
import { TrendingUp, BarChart2, Calendar, Landmark, CreditCard, PieChart, LineChart } from 'lucide-react';

export const WealthPage: React.FC = () => {
  const [subTab, setSubTab] = useState<'networth' | 'assets' | 'liabilities' | 'allocation'>('assets');
  const { transactions, assets, liabilities, snapshots } = useCanonicalLedger();

  const ttmMetric = FinancialMetricService.getMetric('TTM_REALIZED_DIVIDEND', transactions, assets, liabilities);
  const avgMetric = FinancialMetricService.getMetric('MONTHLY_AVERAGE_DIVIDEND', transactions, assets, liabilities);
  const mtdMetric = FinancialMetricService.getMetric('MTD_REALIZED_DIVIDEND', transactions, assets, liabilities);
  const histogramSeries = FinancialMetricService.getSeries('MONTHLY_DIVIDEND_HISTOGRAM', transactions);

  const buckets = histogramSeries?.points || [];
  const maxAmt = Math.max(...buckets.map(b => b.amount), 100);


  const totAssets = assets.reduce((s, a) => s + a.amount, 0);
  const totLiabs = liabilities.reduce((s, l) => s + l.amount, 0);

  return (
    <div className="space-y-8">
      {/* Hero header */}
      <div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Dividend Cash Flow Dashboard</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          "Do you know how much dividend you receive in a year? Do you know the actual cash flow you're generating?"
        </p>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#F5F8FC] tracking-tight">
          Wealth & Institutional Portfolio Command
        </h1>
        <p className="text-xs md:text-sm text-[#94A3B8] mt-1">
          Reconciled assets, liability debt schedules, historical net worth snapshots, and dividend cash flow.
        </p>
      </div>

      {/* Trailing 12-Month Dividend Revenue Summary */}
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
      {/* Sub navigation tabs */}
      <div className="flex border-b border-[#233548] gap-8 overflow-x-auto">
        {(['assets', 'liabilities', 'networth', 'allocation'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={`py-3 font-bold text-xs tracking-wider uppercase border-b-2 transition -mb-px flex items-center gap-2 whitespace-nowrap ${
              subTab === tab
                ? 'border-[#38BDF8] text-[#38BDF8]'
                : 'border-transparent text-[#94A3B8] hover:text-[#F5F8FC]'
            }`}
          >
            {tab === 'assets' && (
              <>
                <Landmark size={15} />
                <span>Assets ({assets.length})</span>
              </>
            )}
            {tab === 'liabilities' && (
              <>
                <CreditCard size={15} />
                <span>Liabilities ({liabilities.length})</span>
              </>
            )}
            {tab === 'networth' && (
              <>
                <LineChart size={15} />
                <span>Net Worth ({snapshots.length})</span>
              </>
            )}
            {tab === 'allocation' && (
              <>
                <PieChart size={15} />
                <span>Allocation</span>
              </>
            )}
          </button>
        ))}
      </div>

      {/* Subtab content */}
      {subTab === 'assets' && <AssetsWorkspace assets={assets} />}
      {subTab === 'liabilities' && <LiabilitiesWorkspace liabilities={liabilities} />}
      {subTab === 'networth' && (
        <NetWorthWorkspace
          snapshots={snapshots}
          totalAssets={totAssets}
          totalLiabilities={totLiabs}
        />
      )}
      {subTab === 'allocation' && <AllocationWorkspace assets={assets} />}

      {/* Dividend histogram chart */}
     {transactions.length > 0 && (
  <div className="border rounded-xl p-6">
    <div className="mb-6">
      <h3 className="text-base font-bold">
        Month-by-Month Reconciled 12M Dividend Cash Flow
      </h3>
      <p className="text-xs text-gray-500 mt-1">
        Reconciled ledger cash flow across trailing 12 months
      </p>
    </div>
          <div className="h-[240px] flex items-end gap-3 pb-4 border-b border-[#233548] mt-4">
            {buckets.map((b) => {
              const heightPct = Math.round((b.amount / maxAmt) * 100);
              return (
                <div key={b.month} className="flex-1 flex flex-col items-center h-full justify-end">
                  <div
                    title={`${b.month}: ₹${b.amount.toLocaleString()} (${b.payoutCount} payouts)`}
                    style={{ height: `${Math.max(heightPct, 4)}%` }}
                    className={`w-full rounded-t-lg transition-all ${
                      b.amount === maxAmt
                        ? 'bg-[#38BDF8]'
                        : b.isMtd
                        ? 'bg-[#F59E0B] border-2 border-dashed border-[#F5F8FC]'
                        : 'bg-[#22C55E]'
                    }`}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-[#94A3B8] mt-3 font-medium">
            {buckets.map(b => (
              <span key={b.month}>{b.month}</span>
            ))}
          </div>
       </div>
)}
    </div>
  );
};
