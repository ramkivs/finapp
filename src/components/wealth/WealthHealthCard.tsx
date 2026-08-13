import React from 'react';
import { Asset, Liability, NetWorthSnapshot } from '../../domain/types';
import { WealthIntelligenceService } from '../../services/WealthIntelligenceService';
import { CurrencyValue } from '../CurrencyValue';
import { ShieldCheck, AlertTriangle, Activity, Database } from 'lucide-react';

interface Props {
  assets: Asset[];
  liabilities: Liability[];
  snapshots: NetWorthSnapshot[];
}

export const WealthHealthCard: React.FC<Props> = ({ assets, liabilities, snapshots }) => {
  const health = WealthIntelligenceService.getHealthSummary(assets, liabilities, snapshots);
  const liabDiag = WealthIntelligenceService.getLiabilityDiagnostics(assets, liabilities);
  const dataQuality = WealthIntelligenceService.getDataQuality(assets, liabilities, snapshots);

  if (health.status === 'NOT_CONFIGURED') {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Activity className="text-gray-400" size={18} />
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Wealth Health & Diagnostics</h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-bold">
            Not Configured
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Add assets and liabilities to calculate debt solvency, liquidity cushion, and portfolio health diagnostics.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <Activity className="text-green-700 dark:text-green-400" size={18} />
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Wealth Health & Solvency Diagnostics</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Canonical balance sheet ratios and structural resilience</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
            liabDiag.burdenLevel === 'LOW'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : liabDiag.burdenLevel === 'MODERATE'
              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400'
              : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
          }`}>
            {liabDiag.burdenLevel === 'LOW' ? 'Low Leverage Solvency' : liabDiag.burdenLevel === 'MODERATE' ? 'Moderate Debt Burden' : 'Elevated Debt Ratio'}
          </span>

          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
            dataQuality.status === 'COMPLETE'
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
              : dataQuality.status === 'PARTIAL'
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400'
          }`}>
            Metadata: {dataQuality.completenessScore}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Debt-to-Asset Ratio */}
        <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Debt-to-Asset Ratio
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
              {Math.round(health.debtToAssetRatio)}%
            </div>
          </div>
          <div className="mt-3">
            <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(health.debtToAssetRatio, 100)}%` }}
                className={`h-full ${
                  health.debtToAssetRatio > 40
                    ? 'bg-rose-600'
                    : health.debtToAssetRatio > 20
                    ? 'bg-amber-500'
                    : 'bg-green-600'
                }`}
              />
            </div>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 block font-medium">
              Liabilities / Assets
            </span>
          </div>
        </div>

        {/* Liquid Cash Reserves */}
        <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Liquid Reserve Cushion
            </div>
            <div className="text-2xl font-black text-green-700 dark:text-green-400 mt-1">
              <CurrencyValue value={health.liquidReserve} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 block">
              {Math.round(health.liquidRatio)}% of total asset base
            </span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 block">
              Cash & Savings classification
            </span>
          </div>
        </div>

        {/* Top Asset Concentration */}
        <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Top Asset Concentration
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
              {Math.round(health.topAssetConcentration)}%
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-[11px] font-bold block ${
              health.topAssetConcentration > 40 ? 'text-amber-600 dark:text-amber-400' : 'text-green-700 dark:text-green-400'
            }`}>
              {health.topAssetConcentration > 40 ? 'Concentrated single asset' : 'Balanced distribution'}
            </span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 block">
              Largest holding vs portfolio
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
