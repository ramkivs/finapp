import React, { useState } from 'react';
import { useCanonicalLedger } from '../store/useCanonicalLedger';
import { FinancialMetricService } from '../services/FinancialMetricService';
import { CurrencyValue } from '../components/CurrencyValue';
import { Plus, Camera, ArrowUpRight, TrendingUp, Wallet, ShieldAlert } from 'lucide-react';
import { KpiCard } from '../components/dashboard/KpiCard';
import { ChartCard } from '../components/dashboard/ChartCard';
import { EmptyState } from '../components/common/EmptyState';

export const OverviewPage: React.FC = () => {
  const { assets, liabilities, snapshots, addAsset, addLiability, captureSnapshot } = useCanonicalLedger();

  const nwMetric = FinancialMetricService.getMetric('NET_WORTH', [], assets, liabilities);
  const cagrMetric = FinancialMetricService.getMetric('NET_WORTH_CAGR', [], assets, liabilities, undefined, snapshots);
  const totAssets = assets.reduce((s, a) => s + a.amount, 0);
  const totLiabs = liabilities.reduce((s, l) => s + l.amount, 0);

  const [assetName, setAssetName] = useState('');
  const [assetAmt, setAssetAmt] = useState('');
  const [liabName, setLiabName] = useState('');
  const [liabAmt, setLiabAmt] = useState('');

  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showLiabForm, setShowLiabForm] = useState(false);

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (assetName && assetAmt) {
      addAsset(assetName, Number(assetAmt));
      setAssetName('');
      setAssetAmt('');
      setShowAssetForm(false);
    }
  };

  const handleAddLiab = (e: React.FormEvent) => {
    e.preventDefault();
    if (liabName && liabAmt) {
      addLiability(liabName, Number(liabAmt));
      setLiabName('');
      setLiabAmt('');
      setShowLiabForm(false);
    }
  };

  const isEmpty = assets.length === 0 && liabilities.length === 0;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#F5F8FC] tracking-tight">
            Financial Command Center
          </h1>
          <p className="text-xs md:text-sm text-[#94A3B8] mt-1">
            Reconciled institutional net worth, historical CAGR, and asset allocation.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowAssetForm(!showAssetForm)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-[#07111C] font-bold text-xs transition shadow-sm"
          >
            <Plus size={15} />
            <span>+ Asset</span>
          </button>
          <button
            onClick={() => setShowLiabForm(!showLiabForm)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#111F2D] hover:bg-[#142333] border border-[#233548] text-[#94A3B8] hover:text-[#F5F8FC] font-semibold text-xs transition"
          >
            <Plus size={15} />
            <span>+ Liability</span>
          </button>
          <button
            onClick={() => {
              captureSnapshot();
              alert('Reconciled Net Worth Snapshot captured successfully!');
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#111F2D] hover:bg-[#142333] border border-[#233548] text-[#94A3B8] hover:text-[#F5F8FC] font-semibold text-xs transition"
          >
            <Camera size={15} className="text-[#38BDF8]" />
            <span>Snapshot</span>
          </button>
        </div>
      </div>

      {/* Forms */}
      {showAssetForm && (
        <form onSubmit={handleAddAsset} className="bg-[#0D1824] border border-[#233548] p-5 rounded-2xl flex gap-3 flex-wrap items-center shadow-md">
          <input
            type="text"
            placeholder="Asset Name (e.g. HDFC Bank)"
            value={assetName}
            onChange={(e) => setAssetName(e.target.value)}
            className="bg-[#111F2D] border border-[#233548] rounded-xl px-3.5 py-2 text-xs text-[#F5F8FC] placeholder-[#64748B] flex-1 outline-none focus:border-[#38BDF8]"
          />
          <input
            type="number"
            placeholder="Amount (INR)"
            value={assetAmt}
            onChange={(e) => setAssetAmt(e.target.value)}
            className="bg-[#111F2D] border border-[#233548] rounded-xl px-3.5 py-2 text-xs text-[#F5F8FC] placeholder-[#64748B] w-40 outline-none focus:border-[#38BDF8]"
          />
          <button type="submit" className="px-4 py-2 bg-[#38BDF8] text-[#07111C] rounded-xl text-xs font-bold hover:bg-[#38BDF8]/90 transition">
            Save Asset
          </button>
        </form>
      )}

      {showLiabForm && (
        <form onSubmit={handleAddLiab} className="bg-[#0D1824] border border-[#233548] p-5 rounded-2xl flex gap-3 flex-wrap items-center shadow-md">
          <input
            type="text"
            placeholder="Liability Name (e.g. Home Loan)"
            value={liabName}
            onChange={(e) => setLiabName(e.target.value)}
            className="bg-[#111F2D] border border-[#233548] rounded-xl px-3.5 py-2 text-xs text-[#F5F8FC] placeholder-[#64748B] flex-1 outline-none focus:border-[#38BDF8]"
          />
          <input
            type="number"
            placeholder="Amount (INR)"
            value={liabAmt}
            onChange={(e) => setLiabAmt(e.target.value)}
            className="bg-[#111F2D] border border-[#233548] rounded-xl px-3.5 py-2 text-xs text-[#F5F8FC] placeholder-[#64748B] w-40 outline-none focus:border-[#38BDF8]"
          />
          <button type="submit" className="px-4 py-2 bg-[#EF4444] text-white rounded-xl text-xs font-bold hover:bg-[#EF4444]/90 transition">
            Save Liability
          </button>
        </form>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Net Worth"
          value={<CurrencyValue value={nwMetric.value} />}
          subtitle="Reconciled Ledger Balance"
          status={nwMetric.status}
          trendLabel="+12.45% vs last month"
          trendDirection="up"
          icon={<TrendingUp size={18} />}
        />

        <KpiCard
          title="Total Assets"
          value={<CurrencyValue value={totAssets} />}
          subtitle={`${assets.length} institutional accounts`}
          trendLabel="Liquid & Invested"
          icon={<Wallet size={18} />}
        />

        <KpiCard
          title="Total Liabilities"
          value={<CurrencyValue value={totLiabs} />}
          subtitle={`${liabilities.length} active credit facilities`}
          trendLabel="Reconciled"
          icon={<ShieldAlert size={18} />}
        />

        <KpiCard
          title="Net Worth CAGR"
          value={cagrMetric.status === 'NOT_CONFIGURED' ? 'Not configured' : `+${cagrMetric.value}%`}
          subtitle={cagrMetric.status === 'NOT_CONFIGURED' ? '1Y CAGR (Snapshots req.)' : 'Historical Compound Growth'}
          status={cagrMetric.status}
          icon={<ArrowUpRight size={18} />}
        />
      </div>

      {/* Main Content Area */}
      {isEmpty ? (
        <EmptyState
          title="No financial data yet"
          description="Add your assets and liabilities or load canonical demo data from the sidebar to see your Net Worth command center and asset allocation."
          actionLabel="+ Add Asset"
          onAction={() => setShowAssetForm(true)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <ChartCard
            title="Institutional Asset Allocation"
            subtitle="Real-time breakdown across liquid savings, equity, and debt"
            className="lg:col-span-2"
          >
            <div className="space-y-3 mt-2">
              {assets.map((a) => {
                const pct = totAssets > 0 ? Math.round((a.amount / totAssets) * 100) : 0;
                return (
                  <div key={a.name} className="bg-[#111F2D] border border-[#233548] p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
                      <span className="text-sm font-semibold text-[#F5F8FC]">{a.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-[#94A3B8]">{pct}%</span>
                      <span className="text-sm font-extrabold text-[#F5F8FC]">
                        <CurrencyValue value={a.amount} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>

          <ChartCard
            title="Active Liabilities"
            subtitle="Reconciled debt obligations"
          >
            {liabilities.length === 0 ? (
              <div className="text-center py-12 text-xs text-[#94A3B8]">
                No active liabilities recorded.
              </div>
            ) : (
              <div className="space-y-3 mt-2">
                {liabilities.map((l) => (
                  <div key={l.name} className="bg-[#111F2D] border border-[#233548] p-4 rounded-xl flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#F5F8FC]">{l.name}</span>
                    <span className="text-sm font-extrabold text-[#EF4444]">
                      <CurrencyValue value={l.amount} />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </ChartCard>
        </div>
      )}
    </div>
  );
};
