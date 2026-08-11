import React, { useState } from 'react';
import { useCanonicalLedger } from '../store/useCanonicalLedger';
import { FinancialMetricService } from '../services/FinancialMetricService';
import { CurrencyValue } from '../components/CurrencyValue';
import { Plus, Camera, ArrowUpRight } from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const { assets, liabilities, snapshots, addAsset, addLiability, captureSnapshot } = useCanonicalLedger();

  const nwMetric = FinancialMetricService.getMetric('NET_WORTH', [], assets, liabilities);
  const cagrMetric = FinancialMetricService.getMetric('NET_WORTH_CAGR', [], assets, liabilities);
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

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="p-9 rounded-3xl bg-gradient-to-r from-green-50 to-cyan-50 dark:from-green-950/20 dark:to-cyan-950/20 border border-green-200 dark:border-green-800/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
            Know your net worth, then watch it grow.
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm max-w-xl">
            Three quick steps to your first dashboard. Anchor today's snapshot so we can chart it over time.
          </p>
        </div>
        <div className="text-right bg-white dark:bg-gray-900 px-6 py-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Net Worth</div>
          <div className="text-3xl font-black text-green-700 dark:text-green-400 mt-1">
            <CurrencyValue value={nwMetric.value} />
          </div>
          <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400 mt-1 flex items-center justify-end gap-1">
            <span>{cagrMetric.status === 'NOT_CONFIGURED' || cagrMetric.value === 0 ? '1Y CAGR (Snapshots req.)' : `↑ +${cagrMetric.value}% 1Y CAGR`}</span>
          </div>
        </div>
      </div>

      {/* 3-Step Setup Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1 */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="w-8 h-8 rounded-full bg-green-700 text-white font-bold text-sm flex items-center justify-center mb-4">
              1
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Add what you own or owe</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
              Accounts, investments, property, loans — anything that's part of your net worth.
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2 text-xs border border-gray-100 dark:border-gray-800 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Assets</span>
                <span className="font-bold"><CurrencyValue value={totAssets} /></span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Liabilities</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">-<CurrencyValue value={totLiabs} /></span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowAssetForm(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-800 dark:text-gray-200 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-700 transition"
            >
              <Plus size={14} />
              <span>Asset</span>
            </button>
            <button
              onClick={() => setShowLiabForm(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-800 dark:text-gray-200 hover:bg-rose-100 dark:hover:bg-rose-900/30 hover:text-rose-700 transition"
            >
              <Plus size={14} />
              <span>Liability</span>
            </button>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-gradient-to-br from-white to-green-50/50 dark:from-gray-900 dark:to-green-950/20 border border-green-300 dark:border-green-800/60 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="w-8 h-8 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-sm flex items-center justify-center mb-4">
              2
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Take your first snapshot</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Anchors today's net worth so we can chart it over time.
            </p>
          </div>
          <button
            onClick={captureSnapshot}
            className="w-full py-3 px-5 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition"
          >
            <Camera size={17} />
            <span>Take snapshot</span>
          </button>
        </div>

        {/* Step 3 */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold text-sm flex items-center justify-center mb-4">
              3
            </div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Track money in / out</h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-[11px] font-bold">
                Optional
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              See where each month is going. Skip this for now if you only care about net worth.
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href="#money"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-800 dark:text-gray-200 hover:bg-gray-200 transition"
            >
              <span>Go to Transactions</span>
              <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* Asset Form Inline */}
      {showAssetForm && (
        <form onSubmit={handleAddAsset} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Asset Name</label>
            <input
              type="text"
              placeholder="e.g., Sovereign Gold Bonds"
              value={assetName}
              onChange={e => setAssetName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Current Value (₹)</label>
            <input
              type="number"
              placeholder="250000"
              value={assetAmt}
              onChange={e => setAssetAmt(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowAssetForm(false)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-green-700 text-white text-xs font-bold"
            >
              Save Asset
            </button>
          </div>
        </form>
      )}

      {/* Liability Form Inline */}
      {showLiabForm && (
        <form onSubmit={handleAddLiab} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Liability Name</label>
            <input
              type="text"
              placeholder="e.g., Car Loan EMI"
              value={liabName}
              onChange={e => setLiabName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Outstanding Amount (₹)</label>
            <input
              type="number"
              placeholder="350000"
              value={liabAmt}
              onChange={e => setLiabAmt(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowLiabForm(false)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-rose-700 text-white text-xs font-bold"
            >
              Save Liability
            </button>
          </div>
        </form>
      )}

      {/* Anchored Snapshot Log Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 dark:text-white">Anchored Net Worth Snapshot Log</h3>
          <span className="px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
            {snapshots.length} Snapshots
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-6">Snapshot Date</th>
                <th className="py-3 px-6">Total Assets</th>
                <th className="py-3 px-6">Total Liabilities</th>
                <th className="py-3 px-6">Net Worth</th>
                <th className="py-3 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
              {snapshots.map((snap, i) => (
                <tr key={snap.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                  <td className={`py-3.5 px-6 ${i === 0 ? 'font-bold' : ''}`}>{snap.dateStr}</td>
                  <td className="py-3.5 px-6"><CurrencyValue value={snap.totalAssets} /></td>
                  <td className="py-3.5 px-6"><CurrencyValue value={snap.totalLiabilities} /></td>
                  <td className="py-3.5 px-6 font-bold text-green-700 dark:text-green-400">
                    <CurrencyValue value={snap.netWorth} />
                  </td>
                  <td className="py-3.5 px-6">
                    <span className="px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
                      {snap.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
