import React, { useState } from 'react';
import { CalculatorsService } from '../../services/CalculatorsService';
import { CurrencyValue } from '../CurrencyValue';
import { CreditCard, Calendar, PieChart, TrendingDown } from 'lucide-react';

export const LoanEmiCalculator: React.FC = () => {
  const [principal, setPrincipal] = useState<number>(3000000);
  const [annualRate, setAnnualRate] = useState<number>(8.5);
  const [tenureYears, setTenureYears] = useState<number>(20);
  const [scheduleView, setScheduleView] = useState<'yearly' | 'monthly'>('yearly');
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  const tenureMonths = tenureYears * 12;
  const result = CalculatorsService.calculateLoanEmi(principal, annualRate, tenureMonths);

  const principalPct = result.totalAmount > 0
    ? Math.round((principal / result.totalAmount) * 100)
    : 0;
  const interestPct = 100 - principalPct;

  // Group by year for yearly schedule view
  const yearlySchedule = React.useMemo(() => {
    const yearsMap: Record<number, { year: number; emiPaid: number; principalPaid: number; interestPaid: number; closingBalance: number }> = {};

    result.schedule.forEach(row => {
      if (!yearsMap[row.year]) {
        yearsMap[row.year] = {
          year: row.year,
          emiPaid: 0,
          principalPaid: 0,
          interestPaid: 0,
          closingBalance: row.closingBalance
        };
      }
      yearsMap[row.year].emiPaid += row.emi;
      yearsMap[row.year].principalPaid += row.principalComponent;
      yearsMap[row.year].interestPaid += row.interestComponent;
      yearsMap[row.year].closingBalance = row.closingBalance;
    });

    return Object.values(yearsMap);
  }, [result.schedule]);

  return (
    <div className="space-y-6">
      {/* Inputs Form */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2.5">
          <CreditCard className="text-cyan-600 dark:text-cyan-400" size={20} />
          <div>
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
              Loan Equated Monthly Installment (EMI) & Amortization Engine
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Simulate Home, Auto, or Personal loan monthly installments, cumulative interest burden, and payoff schedules
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Loan Principal Amount (₹)
            </label>
            <input
              id="input-loan-principal"
              type="number"
              value={principal}
              onChange={e => setPrincipal(Math.max(0, Number(e.target.value) || 0))}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white font-bold outline-none focus:border-cyan-600"
            />
            <div className="flex gap-1.5 mt-2">
              {[1000000, 3000000, 5000000, 10000000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setPrincipal(amt)}
                  className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold text-gray-600 dark:text-gray-400 hover:text-cyan-600"
                >
                  ₹{(amt / 100000)}L
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Interest Rate (% p.a.)
            </label>
            <input
              id="input-loan-rate"
              type="number"
              step="0.1"
              value={annualRate}
              onChange={e => setAnnualRate(Math.max(0, Number(e.target.value) || 0))}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white font-bold outline-none focus:border-cyan-600"
            />
            <div className="flex gap-1.5 mt-2">
              {[7.5, 8.5, 9.0, 10.5].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setAnnualRate(r)}
                  className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold text-gray-600 dark:text-gray-400 hover:text-cyan-600"
                >
                  {r}%
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Loan Tenure (Years)
            </label>
            <input
              id="input-loan-tenure-years"
              type="number"
              value={tenureYears}
              onChange={e => setTenureYears(Math.max(1, Math.min(40, Number(e.target.value) || 1)))}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white font-bold outline-none focus:border-cyan-600"
            />
            <div className="flex gap-1.5 mt-2">
              {[5, 10, 15, 20, 30].map(y => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setTenureYears(y)}
                  className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold text-gray-600 dark:text-gray-400 hover:text-cyan-600"
                >
                  {y}Y
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
            Monthly Loan EMI
          </span>
          <div className="text-3xl font-black text-cyan-600 dark:text-cyan-400 mt-1">
            <CurrencyValue value={result.monthlyEmi} />
            <span className="text-xs font-bold text-gray-500"> / mo</span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
            For {tenureMonths} Monthly Installments
          </span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
            Total Interest Payable
          </span>
          <div className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-1">
            <CurrencyValue value={result.totalInterest} />
          </div>
          <span className="text-xs text-rose-600 dark:text-rose-400 mt-1 block font-semibold">
            {interestPct}% of overall repayment
          </span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
            Total Outflow (Principal + Interest)
          </span>
          <div className="text-3xl font-black text-gray-900 dark:text-white mt-1">
            <CurrencyValue value={result.totalAmount} />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
            Principal: <CurrencyValue value={principal} />
          </span>
        </div>
      </div>

      {/* Visual Proportion Bar */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-600 inline-block" />
            <span>Principal: <CurrencyValue value={principal} /> ({principalPct}%)</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
            <span>Interest: <CurrencyValue value={result.totalInterest} /> ({interestPct}%)</span>
          </span>
        </div>

        <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
          <div style={{ width: `${principalPct}%` }} className="bg-cyan-600 h-full transition-all duration-300" />
          <div style={{ width: `${interestPct}%` }} className="bg-rose-500 h-full transition-all duration-300" />
        </div>
      </div>

      {/* Amortization Schedule Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-cyan-600 dark:text-cyan-400" />
            <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
              Loan Amortization Repayment Schedule
            </h4>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex gap-1 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setScheduleView('yearly')}
                className={`px-2.5 py-0.5 rounded-lg transition ${
                  scheduleView === 'yearly' ? 'bg-cyan-600 text-white' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Yearly View
              </button>
              <button
                type="button"
                onClick={() => setScheduleView('monthly')}
                className={`px-2.5 py-0.5 rounded-lg transition ${
                  scheduleView === 'monthly' ? 'bg-cyan-600 text-white' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Monthly View
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowSchedule(!showSchedule)}
              className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              {showSchedule ? 'Hide Schedule' : 'Show Full Schedule'}
            </button>
          </div>
        </div>

        {showSchedule && (
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-white dark:bg-gray-900 shadow-sm">
                <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">{scheduleView === 'yearly' ? 'Year' : 'Month'}</th>
                  <th className="py-2.5 px-3">EMI Repayment</th>
                  <th className="py-2.5 px-3">Principal Paid</th>
                  <th className="py-2.5 px-3">Interest Paid</th>
                  <th className="py-2.5 px-3 text-right">Outstanding Principal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {scheduleView === 'yearly'
                  ? yearlySchedule.map(row => (
                      <tr key={row.year} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                        <td className="py-2.5 px-3 font-bold text-gray-900 dark:text-white">Year {row.year}</td>
                        <td className="py-2.5 px-3 text-gray-700 dark:text-gray-300"><CurrencyValue value={row.emiPaid} /></td>
                        <td className="py-2.5 px-3 font-bold text-cyan-600 dark:text-cyan-400"><CurrencyValue value={row.principalPaid} /></td>
                        <td className="py-2.5 px-3 font-bold text-rose-600 dark:text-rose-400"><CurrencyValue value={row.interestPaid} /></td>
                        <td className="py-2.5 px-3 text-right font-black text-gray-900 dark:text-white"><CurrencyValue value={row.closingBalance} /></td>
                      </tr>
                    ))
                  : result.schedule.map(row => (
                      <tr key={row.month} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                        <td className="py-2 px-3 font-bold text-gray-900 dark:text-white">Month {row.month} (Y{row.year})</td>
                        <td className="py-2 px-3 text-gray-700 dark:text-gray-300"><CurrencyValue value={row.emi} /></td>
                        <td className="py-2 px-3 font-bold text-cyan-600 dark:text-cyan-400"><CurrencyValue value={row.principalComponent} /></td>
                        <td className="py-2 px-3 font-bold text-rose-600 dark:text-rose-400"><CurrencyValue value={row.interestComponent} /></td>
                        <td className="py-2 px-3 text-right font-black text-gray-900 dark:text-white"><CurrencyValue value={row.closingBalance} /></td>
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
