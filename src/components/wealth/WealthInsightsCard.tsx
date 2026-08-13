import React from 'react';
import { Asset, Liability, NetWorthSnapshot } from '../../domain/types';
import { WealthIntelligenceService } from '../../services/WealthIntelligenceService';
import { Lightbulb, Info, AlertTriangle, AlertCircle } from 'lucide-react';

interface Props {
  assets: Asset[];
  liabilities: Liability[];
  snapshots: NetWorthSnapshot[];
}

export const WealthInsightsCard: React.FC<Props> = ({ assets, liabilities, snapshots }) => {
  const insights = WealthIntelligenceService.generateInsights(assets, liabilities, snapshots);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Lightbulb className="text-amber-500" size={18} />
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              Wealth Intelligence & Action Queue
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Deterministic diagnostic insights derived strictly from canonical balance sheet state
            </p>
          </div>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold">
          {insights.length} {insights.length === 1 ? 'Insight' : 'Insights'}
        </span>
      </div>

      <div className="space-y-3">
        {insights.map((ins) => {
          const isAction = ins.severity === 'ACTION';
          const isWatch = ins.severity === 'WATCH';
          const isInfo = ins.severity === 'INFO';

          return (
            <div
              key={ins.id}
              className={`p-4 rounded-xl border transition flex items-start gap-3.5 ${
                isAction
                  ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60'
                  : isWatch
                  ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60'
                  : 'bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {isAction ? (
                  <AlertCircle className="text-rose-600 dark:text-rose-400" size={18} />
                ) : isWatch ? (
                  <AlertTriangle className="text-amber-600 dark:text-amber-400" size={18} />
                ) : (
                  <Info className="text-blue-600 dark:text-blue-400" size={18} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                  <span className="font-bold text-sm text-gray-900 dark:text-white">
                    {ins.title}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                      isAction
                        ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400'
                        : isWatch
                        ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400'
                        : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'
                    }`}
                  >
                    {ins.severity}
                  </span>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  {ins.explanation}
                </p>

                <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-500 dark:text-gray-400">
                  <span>Source: <strong className="font-semibold text-gray-700 dark:text-gray-300">{ins.sourceMetric}</strong></span>
                  <span>•</span>
                  <span className="italic">{ins.deterministicReason}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
