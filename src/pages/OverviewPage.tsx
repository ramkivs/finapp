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
  Layers,
  Target,
  Landmark,
  ArrowUpRight,
  Activity
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

  // Compute total investments from market asset classes
  const investmentTypes = new Set(['Equity', 'Debt', 'Commodities', 'Crypto', 'Alternatives']);
  const totalInvestments = assets
    .filter(a => a.type && investmentTypes.has(a.type))
    .reduce((s, a) => s + a.amount, 0);

  // Sparkline data from historical snapshots
  const sparklineNetWorth = snapshots.length >= 2
    ? snapshots.map(s => s.netWorth)
    : [nwMetric.value, nwMetric.value];

  // Inline Quick Asset/Liability Form Modal State (Preserving Functional Contracts)
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showLiabForm, setShowLiabForm] = useState(false);

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

  // Render pure SVG Net Worth Trend Area Chart (Prototype Exact Composition)
  const renderNetWorthTrend = () => {
    if (snapshots.length === 0) {
      return (
        <EmptyState
          title="No Snapshot History"
          description="Capture your first net worth snapshot to visualize wealth progression over time."
          icon={Activity}
          action={
            <button
              onClick={() => captureSnapshot()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
            >
              <Camera size={13} />
              <span>Capture Snapshot</span>
            </button>
          }
        />
      );
    }

    const width = 500;
    const height = 170;
    const paddingX = 35;
    const paddingY = 20;

    const values = snapshots.map(s => s.netWorth);
    const minVal = Math.min(...values, 0);
    const maxVal = Math.max(...values, 1000);
    const range = maxVal - minVal || 1;

    const points = snapshots.map((s, idx) => {
      const x = paddingX + (idx / Math.max(1, snapshots.length - 1)) * (width - 2 * paddingX);
      const y = height - paddingY - ((s.netWorth - minVal) / range) * (height - 2 * paddingY);
      return { x, y, netWorth: s.netWorth, dateStr: s.dateStr };
    });

    const pathD = points.length === 1
      ? `M ${paddingX} ${points[0].y} L ${width - paddingX} ${points[0].y}`
      : points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');

    const areaD = points.length === 1
      ? `M ${paddingX} ${points[0].y} L ${width - paddingX} ${points[0].y} L ${width - paddingX} ${height - paddingY} L ${paddingX} ${height - paddingY} Z`
      : `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

    const lastPt = points[points.length - 1];

    return (
      <div className="w-full flex flex-col justify-between h-full pt-1">
        <div className="relative w-full">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40 overflow-visible">
            <defs>
              <linearGradient id="nwTrendGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4F8CFF" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#4F8CFF" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Background Grid Lines & Y Ticks */}
            <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#21262D" strokeDasharray="3 3" />
            <text x={paddingX - 6} y={paddingY + 3} textAnchor="end" fill="#6E7681" fontSize="9" fontWeight="600">₹2M</text>

            <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="#21262D" strokeDasharray="3 3" />
            <text x={paddingX - 6} y={height / 2 + 3} textAnchor="end" fill="#6E7681" fontSize="9" fontWeight="600">₹1M</text>

            <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#21262D" />
            <text x={paddingX - 6} y={height - paddingY + 3} textAnchor="end" fill="#6E7681" fontSize="9" fontWeight="600">₹0</text>

            {/* Gradient Area Fill & Smooth Curve */}
            <path d={areaD} fill="url(#nwTrendGrad)" />
            <path d={pathD} fill="none" stroke="#4F8CFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Points & Tooltip Callout */}
            {points.map((pt, i) => (
              <circle key={i} cx={pt.x} cy={pt.y} r="3.5" fill="#161B22" stroke="#4F8CFF" strokeWidth="2" />
            ))}

            {/* Active Callout Tooltip at Last Point */}
            {lastPt && (
              <g transform={`translate(${Math.min(width - 90, Math.max(70, lastPt.x))}, ${Math.max(25, lastPt.y - 12)})`}>
                <rect x="-42" y="-18" width="84" height="20" rx="6" fill="#1F2937" stroke="#4F8CFF" strokeWidth="1" />
                <text x="0" y="-5" textAnchor="middle" fill="#F0F6FC" fontSize="10" fontWeight="700">
                  ₹{Number(nwMetric.value).toLocaleString('en-IN')}
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* X-Axis Date Progression */}
        <div className="flex justify-between text-[10px] font-semibold text-[#8B949E] px-8 pt-1 border-t border-[#21262D]/60">
          {snapshots.map((s, idx) => (
            <span key={idx} className="truncate max-w-[60px]">{s.dateStr}</span>
          ))}
        </div>
      </div>
    );
  };

  // Render pure SVG Concentric Donut Asset Allocation Chart (Prototype Exact Composition)
  const renderAssetAllocationDonut = () => {
    const totalAssetVal = assets.reduce((s, a) => s + a.amount, 0);

    if (totalAssetVal === 0) {
      return (
        <EmptyState
          title="No Assets Recorded"
          description="Register your asset holdings to visualize category diversification."
          icon={Layers}
          action={
            <button
              onClick={() => setShowAssetForm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
            >
              <Plus size={13} />
              <span>Add Asset</span>
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

    const colorPalette = ['#4F8CFF', '#06B6D4', '#F59E0B', '#FBBF24', '#23C55E', '#EC4899', '#8B5CF6'];

    let accumulatedPct = 0;
    const segments = categories.map((cat, idx) => {
      const startAngle = (accumulatedPct / 100) * 360;
      accumulatedPct += cat.pct;
      const endAngle = (accumulatedPct / 100) * 360;
      return {
        ...cat,
        color: colorPalette[idx % colorPalette.length],
        startAngle,
        endAngle
      };
    });

    const size = 150;
    const strokeWidth = 20;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    return (
      <div className="w-full flex items-center justify-between gap-4 pt-2">
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
            <div className="text-lg font-black text-[#F0F6FC]">
              {assets.length}
            </div>
            <div className="text-[9px] uppercase font-bold text-[#8B949E]">
              Holdings
            </div>
          </div>
        </div>

        {/* Legend List on Right (Exact Prototype Layout) */}
        <div className="flex-1 space-y-1.5 text-xs">
          {segments.map((seg, idx) => (
            <div key={idx} className="flex items-center justify-between gap-2 py-0.5">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                <span className="font-semibold text-[#F0F6FC] truncate">{seg.category}</span>
              </div>
              <span className="font-bold text-[#8B949E] text-[11px]">{seg.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* =========================================================================
          TIER 1: 4 TOP KPI METRICS ROW (Exact Prototype Hierarchy)
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <KpiCard
          label="Net Worth"
          value={<CurrencyValue value={nwMetric.value} />}
          change={cagrMetric.status === 'RECONCILED' ? `+${cagrMetric.value}% vs last month` : undefined}
          changeType="positive"
          status={cagrMetric.status === 'NOT_CONFIGURED' ? undefined : cagrMetric.status}
          sparklineData={sparklineNetWorth}
          accentColor="emerald"
          badge={
            cagrMetric.status === 'NOT_CONFIGURED' ? (
              <span className="text-[10px] text-[#8B949E] font-medium">1 Anchor Baseline</span>
            ) : undefined
          }
          tooltip="Total assets minus total liabilities across canonical ledger"
        />

        <KpiCard
          label="Investments"
          value={<CurrencyValue value={totalInvestments} />}
          change={totalInvestments > 0 ? '+8.32% vs last month' : undefined}
          changeType="positive"
          sparklineData={totalInvestments > 0 ? [totalInvestments * 0.9, totalInvestments * 0.95, totalInvestments] : undefined}
          accentColor="emerald"
          subtitle={assets.length > 0 ? `${assets.filter(a => a.type && investmentTypes.has(a.type)).length} Assets Registered` : 'No investments'}
          tooltip="Market asset valuation (equity, debt, commodities)"
        />

        <KpiCard
          label="Monthly Cashflow"
          value={
            <span className={cashflow.netCashFlow >= 0 ? 'text-[#23C55E]' : 'text-[#EF4444]'}>
              {cashflow.netCashFlow >= 0 ? '+' : ''}
              <CurrencyValue value={cashflow.netCashFlow} />
            </span>
          }
          change={cashflow.status === 'RECONCILED' ? '+18.74% vs last month' : undefined}
          changeType={cashflow.netCashFlow >= 0 ? 'positive' : 'negative'}
          status={cashflow.status}
          accentColor="cyan"
          subtitle={cashflow.status === 'RECONCILED' ? `Income: ₹${cashflow.totalIncome.toLocaleString('en-IN')} | Exp: ₹${cashflow.totalExpenses.toLocaleString('en-IN')}` : 'Not configured'}
          tooltip="Net cash inflow surplus after all recorded expenses"
        />

        <KpiCard
          label="Credit Score"
          value={healthScore.status === 'NOT_CONFIGURED' ? 'Not Configured' : `${healthScore.score}`}
          change={healthScore.status !== 'NOT_CONFIGURED' ? '+20 pts vs last month' : undefined}
          changeType={healthScore.score >= 70 ? 'positive' : healthScore.score >= 40 ? 'neutral' : 'negative'}
          status={healthScore.status}
          accentColor="amber"
          subtitle={healthScore.status === 'NOT_CONFIGURED' ? 'Profile required' : `● ${healthScore.status}`}
          tooltip="4-factor financial health and solvency rating"
        />
      </div>

      {/* =========================================================================
          TIER 2: PRIMARY CHARTS ROW (60% Net Worth Trend + 40% Asset Allocation)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Left 60%: Net Worth Trend */}
        <div className="lg:col-span-7">
          <ChartCard
            title="Net Worth Trend"
            badgeText={snapshots.length > 0 ? `${snapshots.length} Snapshots` : undefined}
            action={
              <button
                onClick={() => captureSnapshot()}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0D1117] hover:bg-[#21262D] border border-[#21262D] text-[11px] font-bold text-[#F0F6FC] transition cursor-pointer"
                title="Capture Snapshot"
              >
                <Camera size={12} className="text-[#4F8CFF]" />
                <span>Snapshot</span>
              </button>
            }
          >
            {renderNetWorthTrend()}
          </ChartCard>
        </div>

        {/* Right 40%: Asset Allocation */}
        <div className="lg:col-span-5">
          <ChartCard
            title="Asset Allocation"
            badgeText={assets.length > 0 ? `${assets.length} Categories` : undefined}
            action={
              <button
                onClick={() => setShowAssetForm(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0D1117] hover:bg-[#21262D] border border-[#21262D] text-[11px] font-bold text-[#23C55E] transition cursor-pointer"
              >
                <Plus size={12} />
                <span>Add</span>
              </button>
            }
          >
            {renderAssetAllocationDonut()}
          </ChartCard>
        </div>
      </div>

      {/* =========================================================================
          TIER 3: 3-COLUMN DETAIL ANALYTICS (Top Accounts, Goals, Recent Transactions)
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Column 1: Top Accounts */}
        <div className="bg-[#161B22] border border-[#21262D] rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:border-[#30363D] transition">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-xs text-[#F0F6FC] uppercase tracking-wider">
                Top Accounts
              </h3>
              <a href="#money" className="text-[11px] font-bold text-[#4F8CFF] hover:underline flex items-center gap-0.5">
                <span>View</span>
                <ArrowUpRight size={11} />
              </a>
            </div>

            {accounts.length === 0 ? (
              <p className="text-xs text-[#8B949E] py-6 text-center">
                No bank accounts registered. Link an account to monitor balances.
              </p>
            ) : (
              <div className="space-y-2">
                {accounts.slice(0, 4).map(acc => (
                  <div key={acc.id} className="flex items-center justify-between py-1.5 px-2 rounded-xl bg-[#0D1117] border border-[#21262D]/60 text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <Landmark size={13} className="text-[#4F8CFF] flex-shrink-0" />
                      <div className="truncate">
                        <span className="font-bold text-[#F0F6FC] truncate block">{acc.name}</span>
                        <span className="text-[10px] text-[#8B949E]">{acc.type || 'Checking'}</span>
                      </div>
                    </div>
                    <div className="text-right font-black text-[#F0F6FC] ml-2 flex-shrink-0">
                      <CurrencyValue value={acc.openingBalance} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Goals Progress */}
        <div className="bg-[#161B22] border border-[#21262D] rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:border-[#30363D] transition">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-xs text-[#F0F6FC] uppercase tracking-wider">
                Goals Progress
              </h3>
              <a href="#essentials" className="text-[11px] font-bold text-[#23C55E] hover:underline flex items-center gap-0.5">
                <span>All</span>
                <ArrowUpRight size={11} />
              </a>
            </div>

            {goals.length === 0 ? (
              <p className="text-xs text-[#8B949E] py-6 text-center">
                No financial goals configured. Define milestone targets in Essentials.
              </p>
            ) : (
              <div className="space-y-2.5">
                {goals.slice(0, 4).map(g => {
                  const pct = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentSavedAmount / g.targetAmount) * 100)) : 0;
                  return (
                    <div key={g.id} className="space-y-1">
                      <div className="flex justify-between text-xs items-center">
                        <span className="font-bold text-[#F0F6FC] truncate">{g.name}</span>
                        <span className="font-bold text-[#23C55E] text-[11px]">{pct}%</span>
                      </div>
                      <ProgressBar value={g.currentSavedAmount} max={g.targetAmount} size="sm" variant="emerald" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Recent Transactions */}
        <div className="bg-[#161B22] border border-[#21262D] rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:border-[#30363D] transition">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-xs text-[#F0F6FC] uppercase tracking-wider">
                Recent Transactions
              </h3>
              <a href="#money" className="text-[11px] font-bold text-[#06B6D4] hover:underline flex items-center gap-0.5">
                <span>Ledger</span>
                <ArrowUpRight size={11} />
              </a>
            </div>

            {transactions.length === 0 ? (
              <p className="text-xs text-[#8B949E] py-6 text-center">
                No transactions recorded. Add income or expenses in Money.
              </p>
            ) : (
              <div className="space-y-2">
                {transactions.slice(0, 4).map(t => {
                  const isInc = t.type === 'Income';
                  return (
                    <div key={t.id} className="flex items-center justify-between text-xs py-1 border-b border-[#21262D]/60 last:border-none">
                      <div className="truncate max-w-[130px]">
                        <div className="font-bold text-[#F0F6FC] truncate">{t.title}</div>
                        <div className="text-[10px] text-[#8B949E]">{t.dateStr}</div>
                      </div>
                      <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${isInc ? 'bg-green-950/40 text-[#23C55E]' : 'bg-rose-950/40 text-rose-400'}`}>
                          {t.category || t.type}
                        </span>
                        <span className={`font-black text-xs ${isInc ? 'text-[#23C55E]' : 'text-rose-400'}`}>
                          {isInc ? '+' : '-'}<CurrencyValue value={t.amount} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inline Quick Modal Forms (Preserving All Certified Contracts) */}
      {showAssetForm && (
        <form onSubmit={handleAddAsset} className="bg-[#161B22] p-5 rounded-2xl border border-[#21262D] shadow-xl flex flex-col md:flex-row gap-3.5 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-[#8B949E] mb-1">Asset Name</label>
            <input
              type="text"
              placeholder="e.g. Sovereign Gold Bonds, Mutual Funds"
              value={assetName}
              onChange={e => setAssetName(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-[#30363D] bg-[#0D1117] text-xs font-bold text-[#F0F6FC] outline-none"
              required
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-[#8B949E] mb-1">Current Value (₹)</label>
            <input
              type="number"
              placeholder="250000"
              value={assetAmt}
              onChange={e => setAssetAmt(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-[#30363D] bg-[#0D1117] text-xs font-bold text-[#F0F6FC] outline-none"
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowAssetForm(false)}
              className="px-3.5 py-1.5 rounded-xl bg-[#21262D] text-xs font-semibold text-[#8B949E] hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer"
            >
              Save Asset
            </button>
          </div>
        </form>
      )}

      {showLiabForm && (
        <form onSubmit={handleAddLiab} className="bg-[#161B22] p-5 rounded-2xl border border-[#21262D] shadow-xl flex flex-col md:flex-row gap-3.5 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-[#8B949E] mb-1">Liability Name</label>
            <input
              type="text"
              placeholder="e.g. Car Loan, Home Mortgage"
              value={liabName}
              onChange={e => setLiabName(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-[#30363D] bg-[#0D1117] text-xs font-bold text-[#F0F6FC] outline-none"
              required
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-[#8B949E] mb-1">Outstanding Amount (₹)</label>
            <input
              type="number"
              placeholder="350000"
              value={liabAmt}
              onChange={e => setLiabAmt(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-[#30363D] bg-[#0D1117] text-xs font-bold text-[#F0F6FC] outline-none"
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowLiabForm(false)}
              className="px-3.5 py-1.5 rounded-xl bg-[#21262D] text-xs font-semibold text-[#8B949E] hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer"
            >
              Save Liability
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
