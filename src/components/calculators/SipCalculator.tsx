import React, { useState } from 'react';
import { CalculatorsService } from '../../services/CalculatorsService';
import { CurrencyValue } from '../CurrencyValue';
import { TrendingUp, ArrowUpRight, Calendar, PiggyBank, Sparkles } from 'lucide-react';

export const SipCalculator: React.FC = () => {
  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(25000);
  const [annualRate, setAnnualRate] = useState<number>(12.0);
  const [years, setYears] = useState<number>(15);
  const [stepUpPct, setStepUpPct] = useState<number>(10);
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  const result = CalculatorsService.calculateSip(monthlyInvestment, annualRate, years, stepUpPct);

  const investedPct = result.totalValue > 0
    ? Math.round((result.totalInvested / result.totalValue) * 100)
    : 0;
  const returnsPct = 100 - investedPct;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2.5">
          <TrendingUp className="text-green-700 dark:text-green-400" size={20} />
          <div>
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
              Systematic Investment Plan (SIP) & Step-Up Compounding Engine
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Simulate wealth creation over time with regular monthly investments and annual step-up increments
            </p>
          </div>
        </div>

        {/* Input Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Monthly Investment (₹)
            </label>
            <input
              id="input-sip-amount"
              type="number"
              value={monthlyInvestment}
              onChange={e => setMonthlyInvestment(Math.max(0, Number(e.target.value) || 0))}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white font-bold outline-none focus:border-green-600"
            />
            <div className="flex gap-1.5 mt-2">
              {[10000, 25000, 50000, 100000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setMonthlyInvestment(amt)}
                  className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold text-gray-600 dark:text-gray-400 hover:text-green-700"
                >
                  ₹{(amt / 1000)}k
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Expected Return Rate (% p.a.)
            </label>
            <input
              id="input-sip-rate"
              type="number"
              step="0.5"
              value={annualRate}
              onChange={e => setAnnualRate(Math.max(0, Number(e.target.value) || 0))}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white font-bold outline-none focus:border-green-600"
            />
            <div className="flex gap-1.5 mt-2">
              {[10, 12, 14, 15].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setAnnualRate(r)}
                  className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold text-gray-600 dark:text-gray-400 hover:text-green-700"
                >
                  {r}%
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Investment Horizon (Years)
            </label>
            <input
              id="input-sip-years"
              type="number"
              value={years}
              onChange={e => setYears(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white font-bold outline-none focus:border-green-600"
            />
            <div className="flex gap-1.5 mt-2">
              {[5, 10, 15, 20, 25].map(y => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setYears(y)}
                  className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold text-gray-600 dark:text-gray-400 hover:text-green-700"
                >
                  {y}Y
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Annual Step-Up (% / year)
            </label>
            <input
              id="input-sip-stepup"
              type="number"
              value={stepUpPct}
              onChange={e => setStepUpPct(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white font-bold outline-none focus:border-green-600"
            />
            <div className="flex gap-1.5 mt-2">
              {[0, 5, 10, 15].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStepUpPct(s)}
                  className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold text-gray-600 dark:text-gray-400 hover:text-green-700"
                >
                  {s}%
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Results Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
            Total Invested Capital
          </span>
          <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
            <CurrencyValue value={result.totalInvested} />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
            {investedPct}% of total accumulated corpus
          </span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
            Estimated Wealth Gain
          </span>
          <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-1">
            <CurrencyValue value={result.estimatedReturns} />
          </div>
          <span className="text-xs text-cyan-700 dark:text-cyan-400 mt-1 block font-semibold">
            +{returnsPct}% generated via compounding
          </span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
            Total Maturity Corpus ({years} Years)
          </span>
          <div className="text-2xl font-black text-green-700 dark:text-green-400 mt-1">
            <CurrencyValue value={result.totalValue} />
          </div>
          <span className="text-xs text-green-700 dark:text-green-400 mt-1 block font-bold">
            {stepUpPct > 0 ? `Includes ${stepUpPct}% annual step-up` : 'Flat monthly installment'}
          </span>
        </div>
      </div>

      {/* Visual Compounding Proportion Bar */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-600 inline-block" />
            <span>Invested: <CurrencyValue value={result.totalInvested} /> ({investedPct}%)</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-600 inline-block" />
            <span>Wealth Gain: <CurrencyValue value={result.estimatedReturns} /> ({returnsPct}%)</span>
          </span>
        </div>

        <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
          <div style={{ width: `${investedPct}%` }} className="bg-gray-400 dark:bg-gray-600 h-full transition-all duration-300" />
          <div style={{ width: `${returnsPct}%` }} className="bg-green-600 h-full transition-all duration-300" />
        </div>
      </div>

      {/* Year-by-Year Schedule Toggle & Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-green-700 dark:text-green-400" />
            <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
              Year-by-Year Compounding Growth Schedule
            </h4>
          </div>
          <button
            type="button"
            onClick={() => setShowSchedule(!showSchedule)}
            className="text-xs font-bold text-green-700 dark:text-green-400 hover:underline"
          >
            {showSchedule ? 'Hide Schedule' : 'Show Full Schedule'}
          </button>
        </div>

        {showSchedule && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Year</th>
                  <th className="py-2.5 px-3">Monthly SIP</th>
                  <th className="py-2.5 px-3">Cumulative Invested</th>
                  <th className="py-2.5 px-3">Wealth Gain</th>
                  <th className="py-2.5 px-3 text-right">Total Corpus Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {result.yearlyBreakdown.map(row => (
                  <tr key={row.year} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <td className="py-2.5 px-3 font-bold text-gray-900 dark:text-white">Year {row.year}</td>
                    <td className="py-2.5 px-3 text-gray-700 dark:text-gray-300"><CurrencyValue value={row.monthlyInstallment} /></td>
                    <td className="py-2.5 px-3 text-gray-700 dark:text-gray-300"><CurrencyValue value={row.invested} /></td>
                    <td className="py-2.5 px-3 font-bold text-cyan-600 dark:text-cyan-400">+<CurrencyValue value={row.interestEarned} /></td>
                    <td className="py-2.5 px-3 text-right font-black text-green-700 dark:text-green-400"><CurrencyValue value={row.value} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
