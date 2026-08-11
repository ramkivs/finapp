import React from 'react';
import { queries } from '../application';

export const EssentialsPage: React.FC = () => {
  const emergencyCoverage = queries.getMetric('EMERGENCY_FUND_COVERAGE');
  const insuranceTotal = queries.getMetric('ACTIVE_INSURANCE_POLICY_TOTAL');
  const sipCommitment = queries.getMetric('SIP_COMMITMENT_MONTHLY');

  const displayMetric = (metric: typeof emergencyCoverage, suffix = '') =>
    metric.status === 'NOT_CONFIGURED'
      ? 'Not configured'
      : `${metric.value}${suffix}`;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Essentials: Financial Health & Commitments
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Emergency reserves, insurance policy schedule, and SIP investment commitments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 mb-1">
            Emergency Fund Coverage
          </div>
          <div className="text-3xl font-black text-green-700 dark:text-green-400 mb-2">
            {displayMetric(emergencyCoverage, ' Months')}
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
            {emergencyCoverage.status === 'NOT_CONFIGURED'
              ? 'Not configured'
              : 'Configured'}
          </span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 mb-1">
            Active Insurance Policies
          </div>
          <div className="text-3xl font-black text-gray-900 dark:text-white mb-2">
            {insuranceTotal.status === 'NOT_CONFIGURED'
              ? 'Not configured'
              : `₹${insuranceTotal.value}`}
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 text-xs font-bold">
            {insuranceTotal.status === 'NOT_CONFIGURED'
              ? 'Not configured'
              : 'Configured'}
          </span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 mb-1">
            Monthly SIP Commitment
          </div>
          <div className="text-3xl font-black text-gray-900 dark:text-white mb-2">
            {sipCommitment.status === 'NOT_CONFIGURED'
              ? 'Not configured'
              : `₹${sipCommitment.value} / mo`}
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
            {sipCommitment.status === 'NOT_CONFIGURED'
              ? 'Not configured'
              : 'Configured'}
          </span>
        </div>
      </div>
    </div>
  );
};