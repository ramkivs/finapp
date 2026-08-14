import React, { useState } from 'react';
import { queries } from '../application';
import { KpiCard } from '../components/ui/KpiCard';
import { SipCalculator } from '../components/calculators/SipCalculator';
import { LumpsumCalculator } from '../components/calculators/LumpsumCalculator';
import { XirrCalculator } from '../components/calculators/XirrCalculator';
import { CagrCalculator } from '../components/calculators/CagrCalculator';
import { LoanEmiCalculator } from '../components/calculators/LoanEmiCalculator';
import { TrendingUp, Landmark, Calculator, Percent, CreditCard, Activity, Clock, Layers } from 'lucide-react';

export const CalculatorsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sip' | 'lumpsum' | 'xirr' | 'cagr' | 'loan'>('sip');

  const yieldMetric = queries.getMetric('DIVIDEND_YIELD_TTM');
  const cagrMetric = queries.getMetric('NET_WORTH_CAGR');
  const goalMetric = queries.getMetric('EMERGENCY_FUND_GOAL');

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Financial Calculators & Compounding Hub
        </h1>
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Institutional-grade modeling tools: SIP with annual step-up, lumpsum compounding, irregular cash-flow XIRR, CAGR, and loan amortization.
        </p>
      </div>

      {/* Subtab Navigation Bar */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="flex gap-2 overflow-x-auto">
          <button
            id="calc-tab-sip"
            onClick={() => setActiveTab('sip')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'sip'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp size={15} />
            <span>SIP & Step-Up</span>
          </button>

          <button
            id="calc-tab-lumpsum"
            onClick={() => setActiveTab('lumpsum')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'lumpsum'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Landmark size={15} />
            <span>Lumpsum Growth</span>
          </button>

          <button
            id="calc-tab-xirr"
            onClick={() => setActiveTab('xirr')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'xirr'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Calculator size={15} />
            <span>XIRR Solver</span>
          </button>

          <button
            id="calc-tab-cagr"
            onClick={() => setActiveTab('cagr')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'cagr'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Percent size={15} />
            <span>CAGR Engine</span>
          </button>

          <button
            id="calc-tab-loan"
            onClick={() => setActiveTab('loan')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'loan'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <CreditCard size={15} />
            <span>Loan EMI & Schedule</span>
          </button>
        </div>
      </div>

      {/* Active Calculator Workspace */}
      <div className="min-h-[400px]">
        {activeTab === 'sip' && <SipCalculator />}
        {activeTab === 'lumpsum' && <LumpsumCalculator />}
        {activeTab === 'xirr' && <XirrCalculator />}
        {activeTab === 'cagr' && <CagrCalculator />}
        {activeTab === 'loan' && <LoanEmiCalculator />}
      </div>

      {/* Planned / Upcoming Institutional Calculators Hub */}
      <div className="bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800/80 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-emerald-500" />
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Expanded Mathematical Engine Roadmap
            </h3>
          </div>
          <span className="text-[11px] text-gray-400 font-semibold flex items-center gap-1">
            <Clock size={12} /> Institutional Modules
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { name: 'Recurring Deposit (RD)', tag: 'Coming Soon', desc: 'Quarterly compounding' },
            { name: 'Public Provident Fund', tag: 'Coming Soon', desc: 'Section 80C & EEE' },
            { name: 'Systematic Withdrawal (SWP)', tag: 'Coming Soon', desc: 'Annuity cash flow' },
            { name: 'Retirement Corpus & FIRE', tag: 'Coming Soon', desc: 'Monte Carlo simulation' },
            { name: 'Target Goal Planner', tag: 'Coming Soon', desc: 'Reverse SIP solver' }
          ].map((calc, idx) => (
            <div
              key={idx}
              className="p-3 bg-white dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/60 rounded-xl space-y-1 opacity-75"
            >
              <div className="flex justify-between items-start gap-1">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 line-clamp-1">{calc.name}</span>
              </div>
              <p className="text-[10px] text-gray-400">{calc.desc}</p>
              <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[10px] font-bold">
                {calc.tag}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Supporting Institutional Derived Metrics */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-800 space-y-4">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-emerald-500" />
          <h3 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
            Canonical Derived Metrics (Live Ledger Synchronization)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard
            label="Dividend Yield (TTM)"
            value={yieldMetric.status === 'NOT_CONFIGURED' ? 'Not configured' : `${yieldMetric.value}%`}
            change={yieldMetric.status === 'RECONCILED' ? 'TTM Yield on Capital' : undefined}
            changeType="neutral"
            status={yieldMetric.status}
            accentColor="emerald"
            tooltip="Trailing 12-month dividend yield calculated from canonical income ledger"
          />

          <KpiCard
            label="Net Worth CAGR"
            value={cagrMetric.status === 'NOT_CONFIGURED' ? 'Not configured' : `+${cagrMetric.value}%`}
            change={cagrMetric.status === 'RECONCILED' ? 'Compound Annual Growth' : undefined}
            changeType={Number(cagrMetric.value) >= 0 ? 'positive' : 'negative'}
            status={cagrMetric.status}
            accentColor="cyan"
            tooltip="Annualized compound growth rate across persistent net worth snapshots"
          />

          <KpiCard
            label="Emergency Fund Goal"
            value={goalMetric.status === 'NOT_CONFIGURED' ? 'Not configured' : goalMetric.value}
            change={goalMetric.status === 'RECONCILED' ? '6 Months Essential EMIs' : undefined}
            changeType="neutral"
            status={goalMetric.status}
            accentColor="amber"
            tooltip="Baseline 6-month essential living and debt commitment reserves"
          />
        </div>
      </div>
    </div>
  );
};
