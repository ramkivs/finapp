import React, { useState } from 'react';
import { useCanonicalLedger } from '../store/useCanonicalLedger';
import { FinancialMetricService } from '../services/FinancialMetricService';
import { CurrencyValue } from '../components/CurrencyValue';
import { KpiCard } from '../components/ui/KpiCard';
import { ChartCard } from '../components/ui/ChartCard';
import { EmptyState } from '../components/ui/EmptyState';
import { AssetsWorkspace } from '../components/wealth/AssetsWorkspace';
import { LiabilitiesWorkspace } from '../components/wealth/LiabilitiesWorkspace';
import { NetWorthWorkspace } from '../components/wealth/NetWorthWorkspace';
import { AllocationWorkspace } from '../components/wealth/AllocationWorkspace';
import { WealthHealthCard } from '../components/wealth/WealthHealthCard';
import { WealthInsightsCard } from '../components/wealth/WealthInsightsCard';
import { AssetConcentrationCard } from '../components/wealth/AssetConcentrationCard';
import { APP_AS_OF_DATE } from '../domain/types';
import { Landmark, CreditCard, LineChart, PieChart, TrendingUp, ShieldCheck, Activity } from 'lucide-react';

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

  // Sparkline data
  const sparklineNetWorth = snapshots.length >= 2
    ? snapshots.map(s => s.netWorth)
    : [currentNetWorth, currentNetWorth];

  // Assets vs Liabilities Gauge Calculation
  const totalBalanceSheet = totAssets + totLiabs;
  const assetRatioPct = totalBalanceSheet > 0 ? Math.round((totAssets / totalBalanceSheet) * 100) : 0;
  const liabilityRatioPct = 100 - assetRatioPct;

  // Render SVG Net Worth Chart
  const renderNetWorthChart = () => {
    if (snapshots.length === 0) {
      return (
        <EmptyState
          title="No Snapshot History"
          description="Take your first snapshot in the Net Worth workspace to track your multi-year wealth curve."
          icon={Activity}
        />
      );
    }

    const width = 500;
    const height = 180;
    const padding = 20;

    const values = snapshots.map(s => s.netWorth);
    const minVal = Math.min(...values, 0);
    const maxVal = Math.max(...values, 1000);
    const range = maxVal - minVal || 1;

    const points = snapshots.map((s, idx) => {
      const x = padding + (idx / Math.max(1, snapshots.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((s.netWorth - minVal) / range) * (height - 2 * padding);
      return { x, y, netWorth: s.netWorth, dateStr: s.dateStr };
    });

    const pathD = points.length === 1
      ? `M ${padding} ${points[0].y} L ${width - padding} ${points[0].y}`
      : points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');

    const areaD = points.length === 1
      ? `M ${padding} ${points[0].y} L ${width - padding} ${points[0].y} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`
      : `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
      <div className="w-full space-y-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="wealthNwGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4F8CFF" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#4F8CFF" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#21262D" strokeDasharray="3 3" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#21262D" strokeDasharray="3 3" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#21262D" />

          <path d={areaD} fill="url(#wealthNwGrad)" />
          <path d={pathD} fill="none" stroke="#4F8CFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {points.map((pt, i) => (
            <circle key={i} cx={pt.x} cy={pt.y} r="4" fill="#161B22" stroke="#4F8CFF" strokeWidth="2" />
          ))}
        </svg>

        <div className="flex justify-between text-[11px] text-gray-500 dark:text-[#8B949E] px-2 font-medium">
          <span>{snapshots[0]?.dateStr}</span>
          <span className="font-bold text-[#4F8CFF]">Current: <CurrencyValue value={currentNetWorth} /></span>
          <span>{snapshots[snapshots.length - 1]?.dateStr}</span>
        </div>
      </div>
    );
  };

  // Render SVG Assets vs Liabilities Gauge
  const renderAssetsVsLiabilitiesGauge = () => {
    if (totalBalanceSheet === 0) {
      return (
        <EmptyState
          title="No Balance Sheet Items"
          description="Add assets or liabilities to analyze solvency and capital structure."
          icon={PieChart}
        />
      );
    }

    const size = 180;
    const strokeWidth = 24;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const assetDashOffset = circumference - (assetRatioPct / 100) * circumference;

    return (
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Radial Canvas */}
        <div className="relative flex items-center justify-center flex-shrink-0">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background Ring (Liabilities portion) */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#EF4444"
              strokeWidth={strokeWidth}
            />
            {/* Assets Arc */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#23C55E"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={assetDashOffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
            />
          </svg>
          <div className="absolute text-center">
            <div className="text-2xl font-black text-gray-900 dark:text-[#F0F6FC]">
              {assetRatioPct}%
            </div>
            <div className="text-[10px] uppercase font-bold text-green-600 dark:text-green-400">
              Solvent
            </div>
          </div>
        </div>

        {/* Breakdown Legend */}
        <div className="flex-1 space-y-3 text-xs w-full">
          <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#0D1117] border border-gray-100 dark:border-[#21262D] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#23C55E]" />
              <span className="font-bold text-gray-800 dark:text-[#F0F6FC]">Total Assets ({assetRatioPct}%)</span>
            </div>
            <span className="font-black text-gray-900 dark:text-[#F0F6FC]"><CurrencyValue value={totAssets} /></span>
          </div>

          <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#0D1117] border border-gray-100 dark:border-[#21262D] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
              <span className="font-bold text-gray-800 dark:text-[#F0F6FC]">Total Liabilities ({liabilityRatioPct}%)</span>
            </div>
            <span className="font-black text-rose-600 dark:text-rose-400">-<CurrencyValue value={totLiabs} /></span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* 1. Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Wealth & Portfolio Management
        </h1>
        <p className="text-xs md:text-sm text-gray-600 dark:text-[#8B949E] mt-1">
          Reconciled assets, liability debt schedules, historical net worth snapshots, and portfolio allocation.
        </p>
      </div>

      {/* 2. Executive 4-KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Net Worth"
          value={<CurrencyValue value={currentNetWorth} />}
          changePct={cagrMetric.status === 'RECONCILED' ? cagrMetric.value : undefined}
          changePeriod="Annualized CAGR"
          icon={Landmark}
          iconColor="text-[#4F8CFF]"
          sparklineData={sparklineNetWorth}
          sparklineColor="#4F8CFF"
        />

        <KpiCard
          title="Total Assets"
          value={<CurrencyValue value={totAssets} />}
          subtitle={`${assets.length} Active Asset Line Items`}
          icon={TrendingUp}
          iconColor="text-[#23C55E]"
          badge={<span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">{assets.length} Active</span>}
        />

        <KpiCard
          title="Total Liabilities"
          value={totLiabs > 0 ? <span>- <CurrencyValue value={totLiabs} /></span> : <CurrencyValue value={totLiabs} />}
          subtitle={`${liabilities.length} Debt Obligations`}
          icon={CreditCard}
          iconColor="text-[#EF4444]"
          badge={<span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 text-xs font-bold">{liabilities.length} Loans</span>}
        />

        <KpiCard
          title="Net Worth Growth"
          value={cagrMetric.status === 'NOT_CONFIGURED' ? 'Not Configured' : `${cagrMetric.value > 0 ? '+' : ''}${cagrMetric.value}%`}
          subtitle={cagrMetric.status === 'NOT_CONFIGURED' ? 'Requires historical snapshots' : 'Annualized Snapshot CAGR'}
          icon={Activity}
          iconColor="text-[#06B6D4]"
          badge={<span className="px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 text-xs font-bold">{snapshots.length} Snaps</span>}
        />
      </div>

      {/* 3. Visual Canvas: Net Worth Over Time + Assets vs Liabilities Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Net Worth Over Time"
          subtitle="Anchored historical snapshot curve"
        >
          {renderNetWorthChart()}
        </ChartCard>

        <ChartCard
          title="Assets vs Liabilities Structure"
          subtitle="Capital solvency and debt burden ratio"
        >
          {renderAssetsVsLiabilitiesGauge()}
        </ChartCard>
      </div>

      {/* 4. Primary Wealth Workspace Navigation Tabs (Certified WP-17 Contract) */}
      <div className="border-b border-gray-200 dark:border-[#21262D]">
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
                    : 'border-transparent text-gray-500 dark:text-[#8B949E] hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-[#30363D]'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 5. Active Workspace Content (Certified WP-17 Workspaces) */}
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

      {/* 6. Decision Intelligence & Action Layer (Certified WP-17) */}
      <div className="pt-6 border-t border-gray-200 dark:border-[#21262D] space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            Wealth Decision Intelligence & Health
          </h2>
          <p className="text-xs md:text-sm text-gray-600 dark:text-[#8B949E] mt-0.5">
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

      {/* 7. Supporting Analytics: Dividend Cash Flow Dashboard (Certified WP-17) */}
      <div className="pt-8 border-t border-gray-200 dark:border-[#21262D] space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            Supporting Analytics: Dividend Cash Flow & Yield
          </h2>
          <p className="text-xs md:text-sm text-gray-600 dark:text-[#8B949E] mt-0.5">
            Trailing 12-month realized dividend revenue and month-by-month cash flow distribution.
          </p>
        </div>

        {/* 3 Dividend Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#21262D] rounded-2xl p-6 shadow-sm">
            <div className="text-xs font-semibold text-gray-500 dark:text-[#8B949E] mb-1">
              Reconciled 12-Month Total Dividend
            </div>
            <div className="text-3xl font-black text-gray-900 dark:text-white mb-2">
              <CurrencyValue value={ttmMetric.value} />
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
              Option A Supreme Authority
            </span>
          </div>

          <div className="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#21262D] rounded-2xl p-6 shadow-sm">
            <div className="text-xs font-semibold text-gray-500 dark:text-[#8B949E] mb-1">
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
            <div className="text-xs font-semibold text-gray-500 dark:text-[#8B949E] mb-1">
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
        <div className="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#21262D] rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1">
            Month-by-Month Reconciled 12M Dividend Cash Flow
          </h3>
          <p className="text-xs text-gray-500 dark:text-[#8B949E] mb-6">
            Reconciled ledger cash flow across trailing 12 months
          </p>

          <div className="h-[240px] flex items-end gap-3 pb-4 border-b border-gray-200 dark:border-[#21262D]">
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

          <div className="flex justify-between text-xs text-gray-500 dark:text-[#8B949E] mt-2 font-medium">
            {buckets.map((b) => (
              <span key={b.month}>{b.month}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
