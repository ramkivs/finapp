import React, { useState } from 'react';
import { ImportPipelineService, ImportReviewResult } from '../services/ImportPipelineService';
import { commands } from '../application';

export const ImportPage: React.FC = () => {
  const [selectedBroker, setSelectedBroker] = useState('Zerodha');
  const [reviewResult, setReviewResult] = useState<ImportReviewResult | null>(null);

  const brokers = [
    'Zerodha', 'Groww', 'INDmoney', 'Upstox', 'ICICI Direct',
    'CDSL', 'Angel One', 'HDFC Bank', 'SBI Bank', 'ICICI Bank'
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = ImportPipelineService.processCSV(content, selectedBroker, file.name);
        setReviewResult(res);
      }
    };
    reader.readAsText(file);
  };

  const handleCommit = () => {
    if (!reviewResult) return;
    commands.importTransactions(reviewResult.validRows);
    alert(`Committed ${reviewResult.validRows.length} non-duplicate rows to CanonicalLedger. Automatically excluded ${reviewResult.duplicateCount} duplicates.`);
    setReviewResult(null);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          5-Stage Bulk Import Engine
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          SELECT FILE ➔ UPLOAD ➔ DETECT ➔ PARSE ➔ NORMALIZE ➔ FINGERPRINT ➔ DUPLICATE ➔ REVIEW ➔ COMMIT
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

        <label className="block border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-10 text-center bg-gray-50 dark:bg-gray-800/50 hover:border-green-600 cursor-pointer transition mb-6">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            Upload CSV Statement File
          </h4>
          <p className="text-sm text-gray-500 mb-5">
            Select a real .csv statement file to parse, normalize, and test duplicate fingerprints against the repository.
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <span className="px-5 py-2.5 rounded-lg bg-green-700 text-white font-bold text-sm shadow-sm inline-block">
            Browse & Upload CSV File
          </span>
        </label>

        {reviewResult && (
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-bold text-base text-gray-900 dark:text-white">
                Stage 5: Data Quality & Duplicate Review ({reviewResult.batchId})
              </span>
              <span className="px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
                {reviewResult.totalDetected} Rows Detected
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              • <strong>{reviewResult.validRows.length} Valid New Transactions</strong><br />
              • <strong>{reviewResult.duplicateCount} Exact Duplicates Flagged</strong> (Matching existing fingerprint Set)<br />
              • <strong>{reviewResult.ambiguousCount} Ambiguous Rows</strong>
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setReviewResult(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCommit}
                className="px-5 py-2.5 rounded-lg bg-green-700 hover:bg-green-800 text-white font-bold text-sm shadow-sm"
              >
                Commit {reviewResult.validRows.length} Valid Rows to Repository
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
