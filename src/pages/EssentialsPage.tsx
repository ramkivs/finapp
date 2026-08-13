import React, { useState } from 'react';
import { queries } from '../application';
import { useCanonicalLedger } from '../store/useCanonicalLedger';
import { EmergencyFundWorkspace } from '../components/essentials/EmergencyFundWorkspace';
import { InsuranceWorkspace } from '../components/essentials/InsuranceWorkspace';
import { GoalsWorkspace } from '../components/essentials/GoalsWorkspace';
import { FinancialProfileWorkspace } from '../components/essentials/FinancialProfileWorkspace';
import { Shield, Umbrella, Target, UserCheck } from 'lucide-react';

export const EssentialsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'emergency' | 'insurance' | 'goals' | 'profile'>('emergency');

  const {
    assets,
    accounts,
    transactions,
    budgets,
    policies,
    goals,
    profile
  } = useCanonicalLedger();

  const emergencyCoverage = queries.getMetric('EMERGENCY_FUND_COVERAGE');
  const insuranceTotal = queries.getMetric('ACTIVE_INSURANCE_POLICY_TOTAL');
  const sipCommitment = queries.getMetric('SIP_COMMITMENT_MONTHLY');
  const healthScore = queries.getFinancialHealthScore();

  const displayMetric = (metric: typeof emergencyCoverage, suffix = '') =>
    metric.status === 'NOT_CONFIGURED'
      ? 'Not configured'
      : `${metric.value}${suffix}`;

  const displayInsurance = () =>
    insuranceTotal.status === 'NOT_CONFIGURED'
      ? 'Not configured'
      : `₹${Number(insuranceTotal.value).toLocaleString('en-IN')}`;

  const displaySip = () =>
    sipCommitment.status === 'NOT_CONFIGURED'
      ? 'Not configured'
      : `₹${Number(sipCommitment.value).toLocaleString('en-IN')} / mo`;

  const displayHealth = () =>
    healthScore.status === 'NOT_CONFIGURED'
      ? 'Not configured'
      : `${healthScore.score}/100`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">
          Essentials: Financial Health & Commitments
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Emergency reserves, insurance policy schedule, financial goals, and holistic health scoring.
        </p>
      </div>

      {/* Top 4 Context KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Emergency Runway
          </div>
          <div className="text-xl font-black text-green-700 dark:text-green-400">
            {displayMetric(emergencyCoverage, ' Months')}
          </div>
          <span className="text-[10px] font-semibold text-gray-400 mt-0.5 block">
            {emergencyCoverage.status === 'NOT_CONFIGURED' ? 'Not configured' : 'Liquid coverage'}
          </span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Active Insurance
          </div>
          <div className="text-xl font-black text-gray-900 dark:text-white">
            {displayInsurance()}
          </div>
          <span className="text-[10px] font-semibold text-gray-400 mt-0.5 block">
            {insuranceTotal.status === 'NOT_CONFIGURED' ? 'Not configured' : `${policies.length} Active Policies`}
          </span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            SIP Commitment
          </div>
          <div className="text-xl font-black text-cyan-600 dark:text-cyan-400">
            {displaySip()}
          </div>
          <span className="text-[10px] font-semibold text-gray-400 mt-0.5 block">
            {sipCommitment.status === 'NOT_CONFIGURED' ? 'Not configured' : 'Monthly goal SIPs'}
          </span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Health Score
          </div>
          <div className="text-xl font-black text-gray-900 dark:text-white">
            {displayHealth()}
          </div>
          <span className="text-[10px] font-semibold text-gray-400 mt-0.5 block">
            {healthScore.status === 'NOT_CONFIGURED' ? 'Not configured' : healthScore.status}
          </span>
        </div>
      </div>

      {/* Subtab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="flex gap-2">
          <button
            id="essentials-tab-emergency"
            onClick={() => setActiveTab('emergency')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs border-b-2 transition ${
              activeTab === 'emergency'
                ? 'border-green-600 text-green-700 dark:text-green-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Shield size={15} />
            <span>Emergency Fund</span>
          </button>

          <button
            id="essentials-tab-insurance"
            onClick={() => setActiveTab('insurance')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs border-b-2 transition ${
              activeTab === 'insurance'
                ? 'border-green-600 text-green-700 dark:text-green-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Umbrella size={15} />
            <span>Insurance Schedule</span>
          </button>

          <button
            id="essentials-tab-goals"
            onClick={() => setActiveTab('goals')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs border-b-2 transition ${
              activeTab === 'goals'
                ? 'border-green-600 text-green-700 dark:text-green-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Target size={15} />
            <span>Financial Goals</span>
          </button>

          <button
            id="essentials-tab-profile"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs border-b-2 transition ${
              activeTab === 'profile'
                ? 'border-green-600 text-green-700 dark:text-green-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <UserCheck size={15} />
            <span>Profile & Health</span>
          </button>
        </div>
      </div>

      {/* Subtab Content */}
      {activeTab === 'emergency' && (
        <EmergencyFundWorkspace
          assets={assets}
          accounts={accounts}
          transactions={transactions}
          budgets={budgets}
          profile={profile}
        />
      )}

      {activeTab === 'insurance' && (
        <InsuranceWorkspace policies={policies} />
      )}

      {activeTab === 'goals' && (
        <GoalsWorkspace goals={goals} />
      )}

      {activeTab === 'profile' && (
        <FinancialProfileWorkspace profile={profile} />
      )}
    </div>
  );
};
