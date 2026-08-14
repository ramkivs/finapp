import React, { useState } from 'react';
import { queries } from '../application';
import { SipCalculator } from '../components/calculators/SipCalculator';
import { LumpsumCalculator } from '../components/calculators/LumpsumCalculator';
import { XirrCalculator } from '../components/calculators/XirrCalculator';
import { CagrCalculator } from '../components/calculators/CagrCalculator';
import { LoanEmiCalculator } from '../components/calculators/LoanEmiCalculator';
import { TrendingUp, Landmark, Calculator, Percent, CreditCard, Activity } from 'lucide-react';

export const CalculatorsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sip' | 'lumpsum' | 'xirr' | 'cagr' | 'loan'>('sip');

  const yieldMetric = queries.getMetric('DIVIDEND_YIELD_TTM');
  const cagrMetric = queries.getMetric('NET_WORTH_CAGR');
  const goalMetric = queries.getMetric('EMERGENCY_FUND_GOAL');

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          Financial Calculators & Interactive Compounding Hub
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Institutional-grade modeling tools: SIP with annual step-up, lumpsum compounding, irregular cash-flow XIRR, CAGR, and loan amortization.
        </p>
      </div>

      {/* Subtab Navigation Bar */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="flex gap-2 overflow-x-auto">
          <button
            id="calc-tab-sip"
            onClick={() => setActiveTab('sip')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs border-b-2 transition whitespace-nowrap ${
              activeTab === 'sip'
                ? 'border-green-600 text-green-700 dark:text-green-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp size={15} />
            <span>SIP & Step-Up</span>
          </button>

          <button
            id="calc-tab-lumpsum"
            onClick={() => setActiveTab('lumpsum')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs border-b-2 transition whitespace-nowrap ${
              activeTab === 'lumpsum'
                ? 'border-green-600 text-green-700 dark:text-green-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Landmark size={15} />
            <span>Lumpsum Growth</span>
          </button>

          <button
            id="calc-tab-xirr"
            onClick={() => setActiveTab('xirr')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs border-b-2 transition whitespace-nowrap ${
              activeTab === 'xirr'
                ? 'border-green-600 text-green-700 dark:text-green-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Calculator size={15} />
            <span>XIRR Solver</span>
          </button>

          <button
            id="calc-tab-cagr"
            onClick={() => setActiveTab('cagr')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs border-b-2 transition whitespace-nowrap ${
              activeTab === 'cagr'
                ? 'border-green-600 text-green-700 dark:text-green-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Percent size={15} />
            <span>CAGR Engine</span>
          </button>

          <button
            id="calc-tab-loan"
            onClick={() => setActiveTab('loan')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs border-b-2 transition whitespace-nowrap ${
              activeTab === 'loan'
                ? 'border-green-600 text-green-700 dark:text-green-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <CreditCard size={15} />
            <span>Loan EMI & Schedule</span>
          </button>
        </div>
      </div>

      {/* Active Calculator Workspace */}
      <div>
        {activeTab === 'sip' && <SipCalculator />}
        {activeTab === 'lumpsum' && <LumpsumCalculator />}
        {activeTab === 'xirr' && <XirrCalculator />}
        {activeTab === 'cagr' && <CagrCalculator />}
        {activeTab === 'loan' && <LoanEmiCalculator />}
      </div>

      {/* Supporting Institutional Derived Metrics */}
      <div className="pt-8 border-t border-gray-200 dark:border-gray-800 space-y-4">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-gray-500" />
          <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
            Canonical Derived Metrics (Live Ledger Synchronization)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Dividend Yield Calculator
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white mb-2">
              {yieldMetric.status === 'NOT_CONFIGURED' ? 'Not configured' : `${yieldMetric.value}%`}
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
              TTM Yield on Invested Capital
            </span>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Net Worth CAGR
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white mb-2">
              {cagrMetric.status === 'NOT_CONFIGURED' ? 'Not configured' : `+${cagrMetric.value}%`}
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 text-xs font-bold">
              1-Year Compound Growth
            </span>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Emergency Fund Goal
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white mb-2">
              {goalMetric.status === 'NOT_CONFIGURED' ? 'Not configured' : goalMetric.value}
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-xs font-bold">
              6 Months Essential EMIs
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
