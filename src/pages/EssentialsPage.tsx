import React from 'react';

export const EssentialsPage: React.FC = () => {
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
          <div className="text-3xl font-black text-green-700 dark:text-green-400 mb-2">6.2 Months</div>
          <span className="px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
            Target: 6.0 Months
          </span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 mb-1">Active Insurance Policies (3)</div>
          <div className="text-3xl font-black text-gray-900 dark:text-white mb-2">₹1.5 Crore</div>
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 text-xs font-bold">
            Term Life & Health
          </span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 mb-1">Monthly SIP Commitment</div>
          <div className="text-3xl font-black text-gray-900 dark:text-white mb-2">₹45,000 / mo</div>
          <span className="px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
            100% Invested
          </span>
        </div>
      </div>
    </div>
  );
};
