import React from 'react';
import { Asset } from '../../domain/types';
import { WealthIntelligenceService } from '../../services/WealthIntelligenceService';
import { CurrencyValue } from '../CurrencyValue';
import { PieChart, AlertTriangle } from 'lucide-react';

interface Props {
  assets: Asset[];
}

export const AssetConcentrationCard: React.FC<Props> = ({ assets }) => {
  const concentration = WealthIntelligenceService.getAssetConcentration(assets);
  const total = assets.reduce((s, a) => s + a.amount, 0);

  if (assets.length === 0 || total === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <PieChart className="text-cyan-600 dark:text-cyan-400" size={18} />
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              Portfolio Concentration & Exposure Analytics
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Deterministic asset distribution across single holdings, categories, and explicit geographies
            </p>
          </div>
        </div>

        {concentration.isConcentrated && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-xs font-bold">
            <AlertTriangle size={13} />
            <span>Concentration Alert</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Largest Single Asset */}
        <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Largest Asset Position
            </div>
            {concentration.topAsset ? (
              <>
                <div className="text-sm font-extrabold text-gray-900 dark:text-white mt-1 truncate">
                  {concentration.topAsset.name}
                </div>
                <div className="text-xl font-black text-green-700 dark:text-green-400 mt-1">
                  <CurrencyValue value={concentration.topAsset.amount} />
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-400 mt-1">No assets</div>
            )}
          </div>
          <div className="mt-3">
            <span className={`text-[11px] font-bold block ${
              (concentration.topAsset?.pct || 0) > 40 ? 'text-amber-600 dark:text-amber-400' : 'text-green-700 dark:text-green-400'
            }`}>
              {concentration.topAsset?.pct}% of total portfolio
            </span>
          </div>
        </div>

        {/* Top Asset Category */}
        <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Dominant Category
            </div>
            {concentration.byType[0] ? (
              <>
                <div className="text-sm font-extrabold text-gray-900 dark:text-white mt-1">
                  {concentration.byType[0].type}
                </div>
                <div className="text-xl font-black text-cyan-600 dark:text-cyan-400 mt-1">
                  <CurrencyValue value={concentration.byType[0].amount} />
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-400 mt-1">Unclassified</div>
            )}
          </div>
          <div className="mt-3">
            <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300 block">
              {concentration.byType[0]?.pct}% of total asset valuation
            </span>
          </div>
        </div>

        {/* Geography Distribution */}
        <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Explicit Geography Exposure
            </div>
            <div className="space-y-1 mt-2 text-xs">
              {concentration.byGeography.map(g => (
                <div key={g.geography} className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">{g.geography}</span>
                  <span className="font-bold">{g.pct}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2 text-[10px] text-gray-500 dark:text-gray-400 italic">
            Explicit metadata only; no currency inference
          </div>
        </div>
      </div>
    </div>
  );
};
