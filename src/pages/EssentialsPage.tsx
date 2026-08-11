import React from 'react';
import { queries } from '../application';

export const EssentialsPage: React.FC = () => {
  const efMetric = queries.getMetric('EMERGENCY_FUND_COVERAGE');
  const insMetric = queries.getMetric('ACTIVE_INSURANCE_POLICY_TOTAL');
  const sipMetric = queries.getMetric('SIP_COMMITMENT_MONTHLY');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          Essentials: Financial Health & Commitments
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Emergency reserves, insurance policy schedule, and SIP investment commitments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 mb-1">Emergency Fund Coverage</div>
          <div className="text-2xl font-bold text-gray-400 dark:text-gray-500 mb-2">
            {efMetric.status === 'NOT_CONFIGURED' ? 'Not configured' : `${efMetric.value} Months`}
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-xs font-bold">
            Requires Emergency EMI Registry
          </span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 mb-1">Active Insurance Policies</div>
          <div className="text-2xl font-bold text-gray-400 dark:text-gray-500 mb-2">
            {insMetric.status === 'NOT_CONFIGURED' ? 'Not configured' : '₹1.5 Crore'}
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-xs font-bold">
            Requires Policy Schedule Model
          </span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 mb-1">Monthly SIP Commitment</div>
          <div className="text-2xl font-bold text-gray-400 dark:text-gray-500 mb-2">
            {sipMetric.status === 'NOT_CONFIGURED' ? 'Not configured' : '₹45,000 / mo'}
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-xs font-bold">
            Requires SIP Commitment Registry
          </span>
        </div>
      </div>
    </div>
  );
};
