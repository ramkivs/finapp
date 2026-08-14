import React, { useState } from 'react';
import { queries } from '../application';
import { useCanonicalLedger } from '../store/useCanonicalLedger';
import { KpiCard } from '../components/ui/KpiCard';
import { ChartCard } from '../components/ui/ChartCard';
import { EmptyState } from '../components/ui/EmptyState';
import { ProgressBar } from '../components/ui/ProgressBar';
import { EmergencyFundWorkspace } from '../components/essentials/EmergencyFundWorkspace';
import { InsuranceWorkspace } from '../components/essentials/InsuranceWorkspace';
import { GoalsWorkspace } from '../components/essentials/GoalsWorkspace';
import { FinancialProfileWorkspace } from '../components/essentials/FinancialProfileWorkspace';
import { Shield, Umbrella, Target, UserCheck, Calendar } from 'lucide-react';

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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Essentials: Financial Health & Commitments
        </h1>
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Emergency reserves, insurance policy schedule, financial goals, and holistic health scoring.
        </p>
      </div>

      {/* Top 4 Context KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Emergency Runway"
          value={displayMetric(emergencyCoverage, ' Mo')}
          change={emergencyCoverage.status === 'RECONCILED' ? `${emergencyCoverage.value} Months Cover` : undefined}
          changeType={Number(emergencyCoverage.value) >= 6 ? 'positive' : 'neutral'}
          status={emergencyCoverage.status}
          accentColor="emerald"
          icon={<Shield size={18} className="text-emerald-400" />}
          tooltip="Liquid reserves divided by monthly baseline expenditures"
        />

        <KpiCard
          label="Active Insurance"
          value={displayInsurance()}
          change={insuranceTotal.status === 'RECONCILED' ? `${policies.length} Active Policies` : undefined}
          changeType="neutral"
          status={insuranceTotal.status}
          accentColor="cyan"
          icon={<Umbrella size={18} className="text-cyan-400" />}
          tooltip="Total sum insured across active Term Life and Health policies"
        />

        <KpiCard
          label="SIP Commitment"
          value={displaySip()}
          change={sipCommitment.status === 'RECONCILED' ? 'Active Goal Allocations' : undefined}
          changeType="neutral"
          status={sipCommitment.status}
          accentColor="indigo"
          icon={<Target size={18} className="text-indigo-400" />}
          tooltip="Monthly systematic investment contributions committed across active goals"
        />

        <KpiCard
          label="Health Score"
          value={displayHealth()}
          change={healthScore.status !== 'NOT_CONFIGURED' ? healthScore.status : undefined}
          changeType={healthScore.score >= 70 ? 'positive' : healthScore.score >= 40 ? 'neutral' : 'negative'}
          status={healthScore.status}
          accentColor="amber"
          icon={<UserCheck size={18} className="text-amber-400" />}
          tooltip="Deterministic 4-factor financial health score (0-100)"
        />
      </div>

      {/* Middle Diagnostic Chart Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: 4-Factor Health Matrix */}
        <div className="lg:col-span-6">
          <ChartCard
            title="Institutional Health Matrix"
            subtitle="Transparent 4-factor financial stability diagnostics"
            badgeText={healthScore.status !== 'NOT_CONFIGURED' ? `${healthScore.score}/100 Score` : undefined}
          >
            {healthScore.status === 'NOT_CONFIGURED' ? (
              <EmptyState
                title="Financial Profile Incomplete"
                description="Configure your financial profile, emergency reserves, and insurance schedule to evaluate diagnostic health."
                actionLabel="Configure Profile"
                onAction={() => setActiveTab('profile')}
              />
            ) : (
              <div className="space-y-4 pt-2 w-full">
                <div className="space-y-3">
                  {/* Factor 1: Emergency Fund */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-gray-800 dark:text-gray-200">1. Emergency Runway</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {healthScore.emergencyRunwayScore} / 25 pts
                      </span>
                    </div>
                    <ProgressBar
                      value={healthScore.emergencyRunwayScore}
                      max={25}
                      variant="emerald"
                      size="sm"
                    />
                  </div>

                  {/* Factor 2: Insurance Adequacy */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-gray-800 dark:text-gray-200">2. Insurance Adequacy</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {healthScore.insuranceAdequacyScore} / 25 pts
                      </span>
                    </div>
                    <ProgressBar
                      value={healthScore.insuranceAdequacyScore}
                      max={25}
                      variant="cyan"
                      size="sm"
                    />
                  </div>

                  {/* Factor 3: Savings Rate */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-gray-800 dark:text-gray-200">3. Savings Rate Discipline</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {healthScore.savingsRateScore} / 25 pts
                      </span>
                    </div>
                    <ProgressBar
                      value={healthScore.savingsRateScore}
                      max={25}
                      variant="indigo"
                      size="sm"
                    />
                  </div>

                  {/* Factor 4: Solvency & Debt */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-gray-800 dark:text-gray-200">4. Solvency & Debt Burden</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {healthScore.debtSolvencyScore} / 25 pts
                      </span>
                    </div>
                    <ProgressBar
                      value={healthScore.debtSolvencyScore}
                      max={25}
                      variant="amber"
                      size="sm"
                    />
                  </div>
                </div>

                {healthScore.explanations.length > 0 && (
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-400 space-y-1">
                    {healthScore.explanations.slice(0, 2).map((exp, idx) => (
                      <div key={idx} className="truncate">• {exp}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </ChartCard>
        </div>

        {/* Chart 2: Goals Progress & Horizon */}
        <div className="lg:col-span-6">
          <ChartCard
            title="Goals Horizon & Milestones"
            subtitle="Target progress tracking across active life goals"
            badgeText={goals.length > 0 ? `${goals.length} Active Goals` : undefined}
          >
            {goals.length === 0 ? (
              <EmptyState
                title="No Financial Goals"
                description="Set milestones for retirement, home purchase, education, or emergency reserves."
                actionLabel="Create Goal"
                onAction={() => setActiveTab('goals')}
              />
            ) : (
              <div className="space-y-3.5 pt-2 w-full">
                {goals.slice(0, 4).map(goal => {
                  const pct = Math.min(100, Math.round((goal.currentSavedAmount / (goal.targetAmount || 1)) * 100));
                  return (
                    <div key={goal.id} className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-800/80 space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Target size={14} className="text-emerald-500" />
                          <span className="font-bold text-xs text-gray-900 dark:text-white">{goal.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-gray-900 dark:text-white">
                            ₹{goal.currentSavedAmount.toLocaleString('en-IN')} / ₹{goal.targetAmount.toLocaleString('en-IN')}
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px]">
                            {pct}%
                          </span>
                        </div>
                      </div>
                      <ProgressBar value={goal.currentSavedAmount} max={goal.targetAmount} variant="emerald" size="sm" />
                      <div className="flex justify-between items-center text-[10px] text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={10} /> Target: {goal.targetDate || 'Flexible'}
                        </span>
                        <span>SIP: ₹{goal.monthlyContribution.toLocaleString('en-IN')} / mo</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ChartCard>
        </div>
      </div>

      {/* Subtab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="flex gap-2 overflow-x-auto">
          <button
            id="essentials-tab-emergency"
            onClick={() => setActiveTab('emergency')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'emergency'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Shield size={15} />
            <span>Emergency Fund</span>
          </button>

          <button
            id="essentials-tab-insurance"
            onClick={() => setActiveTab('insurance')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'insurance'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Umbrella size={15} />
            <span>Insurance Schedule</span>
          </button>

          <button
            id="essentials-tab-goals"
            onClick={() => setActiveTab('goals')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'goals'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Target size={15} />
            <span>Financial Goals</span>
          </button>

          <button
            id="essentials-tab-profile"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'profile'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
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
