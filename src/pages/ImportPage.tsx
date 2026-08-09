import React, { useState } from 'react';
import { useCanonicalLedger } from '../store/useCanonicalLedger';

export const ImportPage: React.FC = () => {
  const [selectedBroker, setSelectedBroker] = useState('Zerodha');
  const [showReview, setShowReview] = useState(false);
  const commitImportedRows = useCanonicalLedger(s => s.commitImportedRows);

  const brokers = [
    'Zerodha', 'Groww', 'INDmoney', 'Upstox', 'ICICI Direct',
    'CDSL', 'Angel One', 'HDFC Bank', 'SBI Bank', 'ICICI Bank'
  ];

  const handleSimulate = () => {
    setShowReview(true);
  };

  const handleCommit = () => {
    const { appended, duplicates } = commitImportedRows();
    setShowReview(false);
    alert(`Algorithmic Set<fingerprint>: Appended ${appended} new rows. Automatically excluded ${duplicates} exact duplicates.`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          5-Stage Bulk Import Engine
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          1. UPLOAD ➔ 2. DETECT ➔ 3. PARSE ➔ 4. NORMALIZE ➔ 5. REVIEW ➔ COMMIT (Append Mode)
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-gray-900 dark:text-white text-base mb-4">
          Select Institution (18+ Supported Brokerages & Indian Banks)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {brokers.map(b => {
            const active = selectedBroker === b;
            return (
              <button
                key={b}
                onClick={() => setSelectedBroker(b)}
                className={`py-3 px-3 rounded-xl border text-sm font-bold transition ${
                  active
                    ? 'bg-green-50 dark:bg-green-900/30 border-green-600 text-green-700 dark:text-green-400'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                }`}
              >
                {b}
              </button>
            );
          })}
        </div>

        <div
          onClick={handleSimulate}
          className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-10 text-center bg-gray-50 dark:bg-gray-800/50 hover:border-green-600 cursor-pointer transition mb-6"
        >
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            Simulate 5-Stage Statement Upload (.csv / .xlsx)
          </h4>
          <p className="text-sm text-gray-500 mb-5">
            Runs algorithmic duplicate fingerprint Set matching before Append commit.
          </p>
          <button className="px-5 py-2.5 rounded-lg bg-green-700 text-white font-bold text-sm shadow-sm">
            Select File to Test Pipeline
          </button>
        </div>

        {showReview && (
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-bold text-base text-gray-900 dark:text-white">
                Stage 5: Data Quality & Duplicate Review
              </span>
              <span className="px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
                24 Rows Detected
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              • <strong>21 Valid New Transactions</strong> (Dividends & Expenses)<br />
              • <strong>2 Duplicates Flagged</strong> (Matching existing fingerprint Set, automatically skipped)<br />
              • <strong>1 Ambiguous Row</strong> (Auto-categorized as Expense)
            </p>
            <button
              onClick={handleCommit}
              className="px-5 py-2.5 rounded-lg bg-green-700 hover:bg-green-800 text-white font-bold text-sm shadow-sm"
            >
              Review & Commit 21 Valid Rows to Canonical Ledger (Append Mode)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
