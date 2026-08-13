import React, { useState } from 'react';
import { Asset } from '../../domain/types';
import { CurrencyValue } from '../CurrencyValue';
import { queries } from '../../application';
import { WealthIntelligenceService } from '../../services/WealthIntelligenceService';
import { PieChart, Globe, Repeat, AlertTriangle, TrendingUp, Compass } from 'lucide-react';

interface Props {
  assets: Asset[];
}

export const AllocationWorkspace: React.FC<Props> = ({ assets }) => {
  const [allocTab, setAllocTab] = useState<'class' | 'geography' | 'sip' | 'diagnostics'>('class');

  const totAssets = assets.reduce((sum, a) => sum + a.amount, 0);
  const sipMetric = queries.getMetric('SIP_COMMITMENT_MONTHLY');
  const diagnostics = WealthIntelligenceService.getAllocationDiagnostics(assets);

  // Derive actual class allocation from canonical assets
  const classBreakdown = assets.reduce<Record<string, number>>((acc, a) => {
    const key = a.type || 'Other';
    acc[key] = (acc[key] || 0) + a.amount;
    return acc;
  }, {});

  // Derive actual geography exposure strictly from explicit geography metadata (not currency)
  const geoBreakdown = assets.reduce<Record<string, number>>((acc, a) => {
    const key = a.geography || 'India';
    acc[key] = (acc[key] || 0) + a.amount;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Subtabs for Allocation */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 gap-8 overflow-x-auto">
        {(['class', 'geography', 'sip', 'diagnostics'] as const).map((tab) => (
          <button
            key={tab}
            id={`alloc-subtab-${tab}`}
            onClick={() => setAllocTab(tab)}
            className={`py-3 font-semibold text-xs tracking-wider uppercase border-b-2 transition -mb-px flex items-center gap-2 whitespace-nowrap outline-none ${
              allocTab === tab
                ? 'border-green-600 dark:border-green-400 text-green-700 dark:text-green-400 font-bold'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab === 'class' && (
              <>
                <PieChart size={15} />
                <span>Asset Allocation</span>
              </>
            )}
            {tab === 'geography' && (
              <>
                <Globe size={15} />
                <span>Geography</span>
              </>
            )}
            {tab === 'sip' && (
              <>
                <Repeat size={15} />
                <span>Monthly SIP Plan</span>
              </>
            )}
            {tab === 'diagnostics' && (
              <>
                <Compass size={15} />
                <span>Allocation Drift & Diagnostics</span>
              </>
            )}
          </button>
        ))}
      </div>

      {assets.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center shadow-sm">
          <div className="text-base font-bold text-gray-900 dark:text-white">No assets recorded</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">
            Add assets to inspect asset allocation and geography exposure.
          </div>
        </div>
      ) : allocTab === 'class' ? (
        <div className="space-y-6">
          {/* Target Allocation Reference Default */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">Target Allocation (Presentation Reference Default)</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Recommended balanced portfolio exposure reference</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-bold">
                Default Reference
              </span>
            </div>
            <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex border border-gray-200 dark:border-gray-700">
              <div style={{ width: '55%' }} className="bg-cyan-500 h-full" title="Equity: 55%" />
              <div style={{ width: '20%' }} className="bg-green-500 h-full" title="Debt: 20%" />
              <div style={{ width: '10%' }} className="bg-purple-500 h-full" title="Real Estate: 10%" />
              <div style={{ width: '10%' }} className="bg-amber-500 h-full" title="Commodities: 10%" />
              <div style={{ width: '5%' }} className="bg-gray-400 h-full" title="Cash: 5%" />
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-400 mt-3 font-semibold">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />Equity 55%</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500" />Debt 20%</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" />Real Estate 10%</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" />Commodities 10%</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gray-400" />Cash 5%</span>
            </div>
          </div>

          {/* Actual Portfolio Allocation */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
            <h4 className="text-sm font-extrabold text-gray-900 dark:text-white mb-4">Actual Canonical Portfolio Allocation</h4>
            <div className="space-y-3">
              {Object.entries(classBreakdown).map(([cls, amt]) => {
                const pct = totAssets > 0 ? Math.round((amt / totAssets) * 100) : 0;
                return (
                  <div key={cls} className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 p-4 rounded-xl flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{cls}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{pct}%</span>
                      <span className="text-sm font-extrabold text-green-700 dark:text-green-400">
                        <CurrencyValue value={amt} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : allocTab === 'geography' ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <h4 className="text-sm font-extrabold text-gray-900 dark:text-white mb-2">Explicit Geography Exposure</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Derived strictly from explicit geography metadata on canonical assets (no currency inference)</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['India', 'International', 'Other'].map((geo) => {
              const amt = geoBreakdown[geo] || 0;
              const pct = totAssets > 0 ? Math.round((amt / totAssets) * 100) : 0;
              return (
                <div key={geo} className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 p-5 rounded-xl flex flex-col justify-between">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{geo}</span>
                  <div className="mt-4">
                    <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                      <CurrencyValue value={amt} />
                    </div>
                    <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 mt-1 block">{pct}% of total valuation</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : allocTab === 'sip' ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">Monthly SIP Commitment Plan</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Systematic monthly investment contributions from canonical registry</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 text-xs font-bold">
              {sipMetric.status}
            </span>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 p-6 rounded-xl flex items-center justify-between">
            <span className="text-sm font-bold text-gray-900 dark:text-white">Total Monthly SIP Commitment</span>
            <span className="text-2xl font-extrabold text-green-700 dark:text-green-400">
              {sipMetric.status === 'NOT_CONFIGURED' ? 'Not configured' : <CurrencyValue value={sipMetric.value} />}
            </span>
          </div>
        </div>
      ) : (
        /* Workstream C3: Allocation Drift & Diagnostics Tab */
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
                Allocation Drift & Exposure Diagnostics
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Deterministic comparison between actual canonical portfolio weights and target benchmarks
              </p>
            </div>
            {diagnostics.hasConcentrationWarning && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-xs font-bold">
                <AlertTriangle size={13} />
                <span>Heavy Category Concentration</span>
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Asset Class</th>
                  <th className="py-3 px-4 text-center">Target Benchmark</th>
                  <th className="py-3 px-4 text-center">Actual Portfolio</th>
                  <th className="py-3 px-4 text-right">Drift (Actual − Target)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                {diagnostics.targetDrift.map(d => {
                  const isPositive = d.driftPct > 0;
                  const isNeutral = d.driftPct === 0;
                  return (
                    <tr key={d.category} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                      <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">{d.category}</td>
                      <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400 font-semibold">{d.targetPct}%</td>
                      <td className="py-3 px-4 text-center font-bold text-gray-900 dark:text-white">{d.actualPct}%</td>
                      <td className={`py-3 px-4 text-right font-extrabold ${
                        isNeutral ? 'text-gray-400' : isPositive ? 'text-cyan-600 dark:text-cyan-400' : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        {isPositive ? `+${d.driftPct}%` : `${d.driftPct}%`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
