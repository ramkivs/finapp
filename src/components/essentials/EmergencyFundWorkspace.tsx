import React, { useState } from 'react';
import { Asset, Account, Transaction, MonthlyBudget, FinancialProfile } from '../../domain/types';
import { EssentialsService } from '../../services/EssentialsService';
import { CurrencyValue } from '../CurrencyValue';
import { ShieldCheck, AlertCircle, TrendingUp, Info } from 'lucide-react';

interface Props {
  assets: Asset[];
  accounts: Account[];
  transactions: Transaction[];
  budgets: MonthlyBudget[];
  profile: FinancialProfile | null;
}

export const EmergencyFundWorkspace: React.FC<Props> = ({
  assets,
  accounts,
  transactions,
  budgets,
  profile
}) => {
  const [targetMonths, setTargetMonths] = useState<number>(profile?.targetEmergencyMonths || 6);

  const analysis = EssentialsService.calculateEmergencyFundAnalysis(
    assets,
    accounts,
    transactions,
    budgets,
    targetMonths,
    profile
  );

  const fundedPercentage = analysis.targetAmount > 0
    ? Math.min(100, Math.round((analysis.liquidReserves / analysis.targetAmount) * 100))
    : 0;

  const isAdequate = analysis.runwayMonths >= targetMonths;

  return (
    <div className="space-y-6">
      {/* Target Selector Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-green-700 dark:text-green-400" size={20} />
          <div>
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
              Emergency Runway Target
            </span>
            <div className="text-sm font-extrabold text-gray-900 dark:text-white">
              {targetMonths} Months Essential Living Expenses
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-semibold">Configurable Runway:</span>
          <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex gap-1 border border-gray-200 dark:border-gray-700">
            {[3, 6, 9, 12].map(m => (
              <button
                key={m}
                id={`btn-target-months-${m}`}
                onClick={() => setTargetMonths(m)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  targetMonths === m
                    ? 'bg-green-700 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {m}M
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
            Liquid Reserves
          </span>
          <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
            <CurrencyValue value={analysis.liquidReserves} />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
            Cash, Savings & Bank Balances
          </span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
            Monthly Essential Outflow
          </span>
          <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
            <CurrencyValue value={analysis.monthlyEssentialExpenses} />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
            Housing, Groceries, Utilities, EMIs
          </span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
            Current Runway
          </span>
          <div className={`text-2xl font-black mt-1 ${isAdequate ? 'text-green-700 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
            {analysis.status === 'NOT_CONFIGURED' ? 'Not configured' : `${analysis.runwayMonths} Months`}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
            Target: {targetMonths} Months
          </span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
            Funding Gap / Deficit
          </span>
          <div className={`text-2xl font-black mt-1 ${analysis.fundingGap > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-green-700 dark:text-green-400'}`}>
            <CurrencyValue value={analysis.fundingGap} />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
            {analysis.fundingGap > 0 ? 'Additional buffer needed' : 'Fully Funded'}
          </span>
        </div>
      </div>

      {/* Target Buffer Progress Bar */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
              Target Emergency Cushion Status
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Required Target Corpus: <CurrencyValue value={analysis.targetAmount} /> ({targetMonths} Months buffer)
            </p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            fundedPercentage >= 100
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400'
          }`}>
            {fundedPercentage}% Funded
          </span>
        </div>

        <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
          <div
            style={{ width: `${fundedPercentage}%` }}
            className={`h-full transition-all duration-300 ${fundedPercentage >= 100 ? 'bg-green-600' : 'bg-amber-500'}`}
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
          <Info size={14} className="text-gray-400 flex-shrink-0" />
          <span>
            {isAdequate
              ? `You currently hold ${analysis.runwayMonths} months of liquid reserves, meeting your ${targetMonths}-month target buffer.`
              : `To reach your ${targetMonths}-month safety buffer, build an additional `}
            {!isAdequate && <strong className="text-gray-700 dark:text-gray-300 font-bold"><CurrencyValue value={analysis.fundingGap} /></strong>}
            {!isAdequate && ' in dedicated liquid savings.'}
          </span>
        </div>
      </div>
    </div>
  );
};
