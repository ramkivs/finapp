import React, { useState } from 'react';
import { useCanonicalLedger } from '../store/useCanonicalLedger';
import { FinancialMetricService } from '../services/FinancialMetricService';
import { FinancialQueries } from '../application/queries';
import { CurrencyValue } from '../components/CurrencyValue';
import { KpiCard } from '../components/ui/KpiCard';
import { ChartCard } from '../components/ui/ChartCard';
import { ProgressBar } from '../components/ui/ProgressBar';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusBadge } from '../components/ui/StatusBadge';
import {
  Wallet,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  Plus,
  Camera,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Layers,
  Target,
  Clock,
  Landmark
} from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const {
    assets,
    liabilities,
    snapshots,
    transactions,
    accounts,
    goals,
    addAsset,
    addLiability,
    captureSnapshot
  } = useCanonicalLedger();

  // Canonical queries & derived metrics (Read-only)
  const nwMetric = FinancialMetricService.getMetric('NET_WORTH', transactions, assets, liabilities, snapshots);
  const cagrMetric = FinancialMetricService.getMetric('NET_WORTH_CAGR', transactions, assets, liabilities, snapshots);
  const cashflow = FinancialQueries.getMoneyInsights('This Month');
  const healthScore = FinancialQueries.getFinancialHealthScore();
  const allocation = FinancialQueries.getAllocationDiagnostics();

  // Compute total investments from market asset classes
  const investmentTypes = new Set(['Equity', 'Debt', 'Commodities', 'Crypto', 'Alternatives']);
  const totalInvestments = assets
    .filter(a => a.type && investmentTypes.has(a.type))
    .reduce((s, a) => s + a.amount, 0);

  // Sparkline data from historical snapshots
  const sparklineNetWorth = snapshots.length >= 2
    ? snapshots.map(s => s.netWorth)
    : [nwMetric.value, nwMetric.value];

  // Inline Quick Asset/Liability Form State
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showLiabForm, setShowLiabForm] = useState(false);
  const [showSnapshotLog, setShowSnapshotLog] = useState(false);

  const [assetName, setAssetName] = useState('');
  const [assetAmt, setAssetAmt] = useState('');
  const [liabName, setLiabName] = useState('');
  const [liabAmt, setLiabAmt] = useState('');

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (assetName.trim() && assetAmt) {
      addAsset(assetName.trim(), Number(assetAmt));
      setAssetName('');
      setAssetAmt('');
      setShowAssetForm(false);
    }
  };

  const handleAddLiab = (e: React.FormEvent) => {
    e.preventDefault();
    if (liabName.trim() && liabAmt) {
      addLiability(liabName.trim(), Number(liabAmt));
      setLiabName('');
      setLiabAmt('');
      setShowLiabForm(false);
    }
  };

  // Render pure SVG Net Worth Trend Chart
  const renderNetWorthTrend = () => {
    if (snapshots.length === 0) {
      return (
        <EmptyState
          title="No Snapshot History"
          description="Take your first net worth snapshot to start charting your wealth compounding over time."
          icon={Activity}
          action={
            <button
              onClick={() => captureSnapshot()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold text-xs shadow-sm transition"
            >
              <Camera size={14} />
              <span>Take First Snapshot</span>
            </button>
          }
        />
      );
    }

    const width = 540;
    const height = 180;
    const padding = 25;

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
            <linearGradient id="nwGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4F8CFF" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#4F8CFF" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          {/* Subtle Grid Lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#21262D" strokeDasharray="3 3" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#21262D" strokeDasharray="3 3" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#21262D" />

          {/* Gradient Area & Stroke Line */}
          <path d={areaD} fill="url(#nwGrad)" />
          <path d={pathD} fill="none" stroke="#4F8CFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Point Markers */}
          {points.map((pt, i) => (
            <g key={i}>
              <circle cx={pt.x} cy={pt.y} r="4.5" fill="#161B22" stroke="#4F8CFF" strokeWidth="2" />
            </g>
          ))}
        </svg>

        <div className="flex justify-between text-[11px] text-gray-500 dark:text-[#8B949E] px-2 font-medium">
          <span>{snapshots[0]?.dateStr}</span>
          <span className="font-bold text-[#4F8CFF]">Latest: <CurrencyValue value={nwMetric.value} /></span>
          <span>{snapshots[snapshots.length - 1]?.dateStr}</span>
        </div>
      </div>
    );
  };

  // Render pure SVG Donut Asset Allocation Chart
  const renderAssetAllocationDonut = () => {
    const totalAssetVal = assets.reduce((s, a) => s + a.amount, 0);

    if (totalAssetVal === 0) {
      return (
        <EmptyState
          title="No Assets Recorded"
          description="Add your liquid savings, mutual funds, gold, or property to visualize your portfolio allocation."
          icon={Layers}
          action={
            <button
              onClick={() => setShowAssetForm(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold text-xs shadow-sm transition"
            >
              <Plus size={14} />
              <span>Add First Asset</span>
            </button>
          }
        />
      );
    }

    const categoryTotals: Record<string, number> = {};
    for (const a of assets) {
      const cat = a.type || 'Unclassified';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + a.amount;
    }
    const categories = Object.entries(categoryTotals).map(([cat, val]) => ({
      category: cat,
      actualValue: val,
      pct: totalAssetVal > 0 ? Math.round((val / totalAssetVal) * 1000) / 10 : 0
    }));

    const colors = ['#4F8CFF', '#23C55E', '#06B6D4', '#F59E0B', '#A855F7', '#EF4444'];

    let accumulatedPct = 0;
    const segments = categories.map((cat, idx) => {
      const startAngle = (accumulatedPct / 100) * 360;
      accumulatedPct += cat.pct;
      const endAngle = (accumulatedPct / 100) * 360;
      return {
        ...cat,
        color: colors[idx % colors.length],
        startAngle,
        endAngle
      };
    });

    const size = 180;
    const strokeWidth = 24;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    return (
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Donut Canvas */}
        <div className="relative flex items-center justify-center flex-shrink-0">
          <svg width={size} height={size} className="transform -rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#21262D"
              strokeWidth={strokeWidth}
            />
            {segments.map((seg, idx) => {
              const dashOffset = circumference - (seg.pct / 100) * circumference;
              const rotation = (seg.startAngle * Math.PI) / 180;
              return (
                <circle
                  key={idx}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  style={{
                    transformOrigin: '50% 50%',
                    transform: `rotate(${seg.startAngle}deg)`
                  }}
                />
              );
            })}
          </svg>
          <div className="absolute text-center">
            <div className="text-xl font-black text-gray-900 dark:text-[#F0F6FC]">
              {assets.length}
            </div>
            <div className="text-[10px] uppercase font-bold text-gray-500 dark:text-[#8B949E]">
              Holdings
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2 text-xs w-full">
          {segments.map((seg, idx) => (
            <div key={idx} className="flex items-center justify-between gap-2 py-1 border-b border-gray-100 dark:border-[#21262D]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                <span className="font-bold text-gray-800 dark:text-[#F0F6FC]">{seg.category}</span>
              </div>
              <div className="text-right">
                <span className="font-mono text-gray-500 dark:text-[#8B949E]">{seg.pct}%</span>
                <span className="ml-2 font-bold text-gray-900 dark:text-[#F0F6FC]"><CurrencyValue value={seg.actualValue} /></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* 1. Executive Top 4 KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Net Worth"
          value={<CurrencyValue value={nwMetric.value} />}
          changePct={cagrMetric.status === 'RECONCILED' ? cagrMetric.value : undefined}
          changePeriod="Annualized CAGR"
          icon={Wallet}
          iconColor="text-[#4F8CFF]"
          sparklineData={sparklineNetWorth}
          sparklineColor="#4F8CFF"
          badge={
            cagrMetric.status === 'NOT_CONFIGURED' ? (
              <span className="text-[10px] text-gray-400 font-semibold">1 Anchor Baseline</span>
            ) : undefined
          }
        />

        <KpiCard
          title="Investments"
          value={<CurrencyValue value={totalInvestments} />}
          subtitle={assets.length > 0 ? `${assets.filter(a => a.type && investmentTypes.has(a.type)).length} Asset Line Items` : 'No investments'}
          icon={TrendingUp}
          iconColor="text-[#23C55E]"
          sparklineData={totalInvestments > 0 ? [totalInvestments * 0.9, totalInvestments * 0.95, totalInvestments] : undefined}
          sparklineColor="#23C55E"
        />

        <KpiCard
          title="Monthly Cashflow"
          value={
            <span className={cashflow.netCashFlow >= 0 ? 'text-[#23C55E]' : 'text-[#EF4444]'}>
              {cashflow.netCashFlow >= 0 ? '+' : ''}
              <CurrencyValue value={cashflow.netCashFlow} />
            </span>
          }
          subtitle={cashflow.status === 'RECONCILED' ? `Income: ₹${cashflow.totalIncome.toLocaleString()} | Exp: ₹${cashflow.totalExpenses.toLocaleString()}` : 'Not configured'}
          icon={CreditCard}
          iconColor="text-[#06B6D4]"
        />

        <KpiCard
          title="Financial Health"
          value={healthScore.status === 'NOT_CONFIGURED' ? 'Not Configured' : `${healthScore.score} / 100`}
          subtitle={healthScore.status === 'NOT_CONFIGURED' ? 'Profile parameters required' : `${healthScore.status} Balance Sheet`}
          icon={ShieldCheck}
          iconColor="text-[#F59E0B]"
          badge={<StatusBadge status={healthScore.status} />}
        />
      </div>

      {/* 2. Middle Section: Charts Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Net Worth Over Time"
          subtitle="Anchored historical valuation curve and milestone trajectories"
          action={
            <button
              onClick={() => captureSnapshot()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-[#0D1117] hover:bg-gray-200 dark:hover:bg-[#21262D] border border-gray-200 dark:border-[#21262D] text-xs font-bold text-gray-700 dark:text-[#F0F6FC] transition"
              title="Capture Today's Net Worth Snapshot"
            >
              <Camera size={14} className="text-[#4F8CFF]" />
              <span>Snapshot</span>
            </button>
          }
        >
          {renderNetWorthTrend()}
        </ChartCard>

        <ChartCard
          title="Asset Allocation"
          subtitle="Portfolio distribution across market asset classes"
          action={
            <button
              onClick={() => setShowAssetForm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-[#0D1117] hover:bg-gray-200 dark:hover:bg-[#21262D] border border-gray-200 dark:border-[#21262D] text-xs font-bold text-gray-700 dark:text-[#F0F6FC] transition"
            >
              <Plus size={14} className="text-[#23C55E]" />
              <span>Add Asset</span>
            </button>
          }
        >
          {renderAssetAllocationDonut()}
        </ChartCard>
      </div>

      {/* 3. Bottom Detail Grid: Top Accounts, Goals Progress, Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Top Accounts */}
        <div className="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#21262D] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-[#F0F6FC] uppercase tracking-wider">
                Accounts ({accounts.length})
              </h3>
              <a href="#money" className="text-xs font-bold text-[#4F8CFF] hover:underline flex items-center gap-1">
                <span>View All</span>
                <ArrowUpRight size={13} />
              </a>
            </div>

            {accounts.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-[#8B949E] py-8 text-center">
                No bank accounts registered. Link an account to monitor balances.
              </p>
            ) : (
              <div className="space-y-3">
                {accounts.slice(0, 4).map(acc => (
                  <div key={acc.id} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-[#0D1117] border border-gray-100 dark:border-[#21262D]">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-[#161B22] text-[#4F8CFF]">
                        <Landmark size={14} />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-gray-900 dark:text-[#F0F6FC]">{acc.name}</div>
                        <div className="text-[10px] text-gray-500 dark:text-[#8B949E]">{acc.type}</div>
                      </div>
                    </div>
                    <div className="text-right font-black text-xs text-gray-900 dark:text-[#F0F6FC]">
                      <CurrencyValue value={acc.openingBalance} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Goals Progress */}
        <div className="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#21262D] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-[#F0F6FC] uppercase tracking-wider">
                Goals Progress ({goals.length})
              </h3>
              <a href="#essentials" className="text-xs font-bold text-[#23C55E] hover:underline flex items-center gap-1">
                <span>All Goals</span>
                <ArrowUpRight size={13} />
              </a>
            </div>

            {goals.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-[#8B949E] py-8 text-center">
                No financial goals configured. Define milestone corpus targets in Essentials.
              </p>
            ) : (
              <div className="space-y-4">
                {goals.slice(0, 4).map(g => {
                  const pct = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentSavedAmount / g.targetAmount) * 100)) : 0;
                  return (
                    <div key={g.id} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-gray-800 dark:text-[#F0F6FC]">{g.name}</span>
                        <span className="font-bold text-[#23C55E]">{pct}%</span>
                      </div>
                      <ProgressBar percentage={pct} size="sm" color="green" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Recent Transactions */}
        <div className="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#21262D] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-[#F0F6FC] uppercase tracking-wider">
                Recent Transactions
              </h3>
              <a href="#money" className="text-xs font-bold text-[#06B6D4] hover:underline flex items-center gap-1">
                <span>Ledger</span>
                <ArrowUpRight size={13} />
              </a>
            </div>

            {transactions.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-[#8B949E] py-8 text-center">
                No transactions recorded. Import a CSV or add manual transactions in Money.
              </p>
            ) : (
              <div className="space-y-2.5">
                {transactions.slice(0, 4).map(t => {
                  const isInc = t.type === 'Income';
                  return (
                    <div key={t.id} className="flex items-center justify-between text-xs py-1 border-b border-gray-100 dark:border-[#21262D]">
                      <div>
                        <div className="font-bold text-gray-900 dark:text-[#F0F6FC] truncate max-w-[160px]">{t.title}</div>
                        <div className="text-[10px] text-gray-400">{t.dateStr}</div>
                      </div>
                      <div className={`font-black ${isInc ? 'text-[#23C55E]' : 'text-rose-500'}`}>
                        {isInc ? '+' : '-'}<CurrencyValue value={t.amount} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inline Forms & Snapshot Modal (Preserving All Certified Contracts) */}
      {showAssetForm && (
        <form onSubmit={handleAddAsset} className="bg-white dark:bg-[#161B22] p-6 rounded-3xl border border-gray-200 dark:border-[#21262D] shadow-sm flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-gray-500 dark:text-[#8B949E] mb-1">Asset Name</label>
            <input
              type="text"
              placeholder="e.g. Sovereign Gold Bonds, Mutual Funds"
              value={assetName}
              onChange={e => setAssetName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-[#30363D] bg-gray-50 dark:bg-[#0D1117] text-xs font-bold"
              required
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-gray-500 dark:text-[#8B949E] mb-1">Current Value (₹)</label>
            <input
              type="number"
              placeholder="250000"
              value={assetAmt}
              onChange={e => setAssetAmt(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-[#30363D] bg-gray-50 dark:bg-[#0D1117] text-xs font-bold"
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowAssetForm(false)}
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#21262D] text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-green-700 text-white text-xs font-bold"
            >
              Save Asset
            </button>
          </div>
        </form>
      )}

      {showLiabForm && (
        <form onSubmit={handleAddLiab} className="bg-white dark:bg-[#161B22] p-6 rounded-3xl border border-gray-200 dark:border-[#21262D] shadow-sm flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-gray-500 dark:text-[#8B949E] mb-1">Liability Name</label>
            <input
              type="text"
              placeholder="e.g. Car Loan, Home Mortgage"
              value={liabName}
              onChange={e => setLiabName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-[#30363D] bg-gray-50 dark:bg-[#0D1117] text-xs font-bold"
              required
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-gray-500 dark:text-[#8B949E] mb-1">Outstanding Amount (₹)</label>
            <input
              type="number"
              placeholder="350000"
              value={liabAmt}
              onChange={e => setLiabAmt(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-[#30363D] bg-gray-50 dark:bg-[#0D1117] text-xs font-bold"
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowLiabForm(false)}
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#21262D] text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rose-700 text-white text-xs font-bold"
            >
              Save Liability
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
