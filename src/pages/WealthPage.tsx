import React, { useState } from 'react';
import { useCanonicalLedger } from '../store/useCanonicalLedger';
import { FinancialMetricService } from '../services/FinancialMetricService';
import { CurrencyValue } from '../components/CurrencyValue';
import { AssetsWorkspace } from '../components/wealth/AssetsWorkspace';
import { LiabilitiesWorkspace } from '../components/wealth/LiabilitiesWorkspace';
import { NetWorthWorkspace } from '../components/wealth/NetWorthWorkspace';
import { AllocationWorkspace } from '../components/wealth/AllocationWorkspace';
import { WealthHealthCard } from '../components/wealth/WealthHealthCard';
import { WealthInsightsCard } from '../components/wealth/WealthInsightsCard';
import { AssetConcentrationCard } from '../components/wealth/AssetConcentrationCard';
import { APP_AS_OF_DATE } from '../domain/types';
import { Landmark, CreditCard, LineChart, PieChart } from 'lucide-react';

export const WealthPage: React.FC = () => {
  const [subTab, setSubTab] = useState<'assets' | 'liabilities' | 'networth' | 'allocation'>('assets');
  const { transactions, assets, liabilities, snapshots } = useCanonicalLedger();

  const ttmMetric = FinancialMetricService.getMetric('TTM_REALIZED_DIVIDEND', transactions, assets, liabilities, snapshots);
  const avgMetric = FinancialMetricService.getMetric('MONTHLY_AVERAGE_DIVIDEND', transactions, assets, liabilities, snapshots);
  const mtdMetric = FinancialMetricService.getMetric('MTD_REALIZED_DIVIDEND', transactions, assets, liabilities, snapshots);
  const cagrMetric = FinancialMetricService.getMetric('NET_WORTH_CAGR', transactions, assets, liabilities, snapshots);
  const histogramSeries = FinancialMetricService.getSeries('MONTHLY_DIVIDEND_HISTOGRAM', transactions);

  const buckets = histogramSeries?.points || [];
  const maxAmt = Math.max(...buckets.map(b => b.amount), 100);

  const totAssets = assets.reduce((s, a) => s + a.amount, 0);
  const totLiabs = liabilities.reduce((s, l) => s + l.amount, 0);
  const currentNetWorth = totAssets - totLiabs;

  const asOfDate = new Date(APP_AS_OF_DATE);
  const currentMonthLabel = asOfDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-8">
      {/* 1. Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Wealth & Portfolio Management
        </h1>
        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
          Reconciled assets, liability debt schedules, historical net worth snapshots, and portfolio allocation.
        </p>
      </div>

      {/* 2. Compact Wealth Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Assets */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Total Assets
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
            <CurrencyValue value={totAssets} />
          </div>
          <div className="mt-2">
            <span className="px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
              {assets.length} Active Assets
            </span>
          </div>
        </div>

        {/* Total Liabilities */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Total Liabilities
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {totLiabs > 0 ? (
              <span className="flex items-center">
                -&nbsp;<CurrencyValue value={totLiabs} />
              </span>
            ) : (
              <CurrencyValue value={totLiabs} />
            )}
          </div>
          <div className="mt-2">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 text-xs font-bold">
              {liabilities.length} Obligations
            </span>
          </div>
        </div>

        {/* Current Net Worth */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Current Net Worth
          </div>
          <div className="text-2xl font-black text-green-700 dark:text-green-400 mt-1">
            <CurrencyValue value={currentNetWorth} />
          </div>
          <div className="mt-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 text-xs font-bold">
              Assets − Liabilities
            </span>
          </div>
        </div>

        {/* Snapshots & Growth */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Snapshots & Growth
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
            {snapshots.length} Snapshots
          </div>
          <div className="mt-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold">
              {cagrMetric.status === 'NOT_CONFIGURED'
                ? '1Y CAGR (Snapshots req.)'
                : (cagrMetric.value > 0 ? `↑ +${cagrMetric.value}% 1Y CAGR` : `${cagrMetric.value}% 1Y CAGR`)}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Primary Wealth Workspace Navigation Tabs (Immediately Visible Above The Fold) */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav aria-label="Wealth Workspaces" className="flex gap-8 overflow-x-auto">
          {(
            [
              { id: 'assets', label: `Assets (${assets.length})`, icon: Landmark },
              { id: 'liabilities', label: `Liabilities (${liabilities.length})`, icon: CreditCard },
              { id: 'networth', label: `Net Worth (${snapshots.length})`, icon: LineChart },
              { id: 'allocation', label: 'Allocation', icon: PieChart }
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = subTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`wealth-tab-${tab.id}`}
                onClick={() => setSubTab(tab.id)}
                className={`py-3.5 font-bold text-xs tracking-wider uppercase border-b-2 transition -mb-px flex items-center gap-2 whitespace-nowrap outline-none focus:ring-2 focus:ring-green-500 rounded-t-sm ${
                  isActive
                    ? 'border-green-600 dark:border-green-400 text-green-700 dark:text-green-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 4. Active Workspace Content */}
      <div className="min-h-[280px]">
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
      </div>

      {/* 5. Decision Intelligence & Action Layer (Workstream C1, C2, C6, C7) */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-800 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            Wealth Decision Intelligence & Health
          </h2>
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
            Solvency diagnostics, single-asset concentration analytics, and deterministic action queue.
          </p>
        </div>

        {/* Wealth Health Diagnostics Bar */}
        <WealthHealthCard assets={assets} liabilities={liabilities} snapshots={snapshots} />

        {/* Action Queue & Insights */}
        <WealthInsightsCard assets={assets} liabilities={liabilities} snapshots={snapshots} />

        {/* Portfolio Concentration Analytics (if assets exist) */}
        {assets.length > 0 && <AssetConcentrationCard assets={assets} />}
      </div>

      {/* 6. Supporting Analytics: Dividend Cash Flow Dashboard */}
      <div className="pt-8 border-t border-gray-200 dark:border-gray-800 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            Supporting Analytics: Dividend Cash Flow & Yield
          </h2>
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
            Trailing 12-month realized dividend revenue and month-by-month cash flow distribution.
          </p>
        </div>

        {/* 3 Dividend Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Reconciled 12-Month Total Dividend
            </div>
            <div className="text-3xl font-black text-gray-900 dark:text-white mb-2">
              <CurrencyValue value={ttmMetric.value} />
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
              Option A Supreme Authority
            </span>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Reconciled Monthly Average
            </div>
            <div className="text-3xl font-black text-gray-900 dark:text-white mb-2">
              <CurrencyValue value={avgMetric.value} decimals={2} />
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 text-xs font-bold">
              12M Total / 12 Months
            </span>
          </div>

          <div className="bg-green-50/50 dark:bg-green-950/20 border border-green-300 dark:border-green-800 rounded-2xl p-6 shadow-sm">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              {`${currentMonthLabel} (Ongoing Month - MTD)`}
            </div>
            <div className="text-3xl font-black text-green-700 dark:text-green-400 mb-2">
              <CurrencyValue value={mtdMetric.value} />
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-xs font-bold">
              {mtdMetric.value > 0 ? 'Payouts Received (MTD*)' : '0 Payouts (MTD)'}
            </span>
          </div>
        </div>

        {/* Month-by-Month Reconciled 12M Dividend Cash Flow Histogram */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1">
            Month-by-Month Reconciled 12M Dividend Cash Flow
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
            Reconciled ledger cash flow across trailing 12 months
          </p>

          <div className="h-[240px] flex items-end gap-3 pb-4 border-b border-gray-200 dark:border-gray-800">
            {buckets.map((b) => {
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

          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
            {buckets.map((b) => (
              <span key={b.month}>{b.month}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
