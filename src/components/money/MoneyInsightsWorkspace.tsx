import React, { useState } from 'react';
import { FinancialQueries, MoneyInsightsData } from '../../application/queries';
import { CurrencyValue } from '../CurrencyValue';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, PieChart, BarChart2, Calendar } from 'lucide-react';

interface Props {
  insightsData?: MoneyInsightsData;
}

export const MoneyInsightsWorkspace: React.FC<Props> = () => {
  const [selectedRange, setSelectedRange] = useState<string>('This Month');

  const insights = FinancialQueries.getMoneyInsights(selectedRange);

  return (
    <div className="space-y-6">
      {/* Header & Period Selector */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-sm">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Cash Flow & Spending Intelligence
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Deterministic cash flow, category expense distribution, and investment commitments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Calendar size={15} className="text-gray-400" />
          <select
            id="money-insights-period-selector"
            value={selectedRange}
            onChange={e => setSelectedRange(e.target.value)}
            className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-900 dark:text-white outline-none focus:border-green-600"
          >
            {['This Month', 'Last Month', 'Last 30 Days', '3M', '6M', '12M', 'YTD'].map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {insights.status === 'NOT_CONFIGURED' ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center shadow-sm">
          <div className="text-base font-bold text-gray-900 dark:text-white">
            No cash flow activity in this period
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
            Record income, expenses, or import transaction statements to inspect cash flow distribution, category spending, and savings rate.
          </p>
        </div>
      ) : (
        <>
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Income */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                Total Income
              </span>
              <div className="text-2xl font-black text-green-700 dark:text-green-400 mt-1 flex items-center gap-1">
                <ArrowUpRight size={20} />
                <CurrencyValue value={insights.totalIncome} />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                Period inflow
              </span>
            </div>

            {/* Total Expenses */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                Total Expenses
              </span>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                <ArrowDownRight size={20} />
                <CurrencyValue value={insights.totalExpenses} />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                Period outflow
              </span>
            </div>

            {/* Net Cash Flow */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                Net Cash Flow
              </span>
              <div className={`text-2xl font-black mt-1 ${
                insights.netCashFlow >= 0 ? 'text-green-700 dark:text-green-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {insights.netCashFlow >= 0 ? '+' : ''}
                <CurrencyValue value={insights.netCashFlow} />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                Income − Expenses
              </span>
            </div>

            {/* Total Invested */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                Total Invested
              </span>
              <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-1">
                <CurrencyValue value={insights.totalInvested} />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                Explicit Investment Category
              </span>
            </div>
          </div>

          {/* Category Breakdown & Monthly Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Expense Breakdown */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PieChart size={16} className="text-cyan-600" />
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                    Expense Category Distribution
                  </h4>
                </div>
                <span className="text-xs text-gray-500 font-semibold">
                  {insights.expenseCategoryBreakdown.length} Categories
                </span>
              </div>

              {insights.expenseCategoryBreakdown.length === 0 ? (
                <div className="text-xs text-gray-400 py-6 text-center italic">
                  No categorized expenses recorded in this period.
                </div>
              ) : (
                <div className="space-y-3">
                  {insights.expenseCategoryBreakdown.map(item => (
                    <div key={item.category} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                        <span>{item.category}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500 font-normal">{item.pct}%</span>
                          <span className="text-gray-900 dark:text-white"><CurrencyValue value={item.amount} /></span>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.min(item.pct, 100)}%` }}
                          className="h-full bg-cyan-600 dark:bg-cyan-500 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Monthly Inflow / Outflow Trends */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart2 size={16} className="text-green-600" />
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                    Trailing Monthly Cash Flow (6M)
                  </h4>
                </div>
                <span className="text-xs text-gray-500 font-semibold">
                  Income vs Expenses
                </span>
              </div>

              {insights.monthlyTrends.length === 0 ? (
                <div className="text-xs text-gray-400 py-6 text-center italic">
                  No historical monthly trend data available.
                </div>
              ) : (
                <div className="space-y-3">
                  {insights.monthlyTrends.map(m => (
                    <div key={m.month} className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 p-3 rounded-xl flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-900 dark:text-white">{m.month}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-green-700 dark:text-green-400 font-semibold">
                          +<CurrencyValue value={m.income} />
                        </span>
                        <span className="text-rose-600 dark:text-rose-400 font-semibold">
                          -<CurrencyValue value={m.expense} />
                        </span>
                        <span className={`font-extrabold ${m.net >= 0 ? 'text-green-700 dark:text-green-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          Net: {m.net >= 0 ? '+' : ''}<CurrencyValue value={m.net} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
