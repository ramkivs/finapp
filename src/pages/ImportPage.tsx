import React, { useState, useRef } from 'react';
import { useCanonicalLedger } from '../store/useCanonicalLedger';
import { ImportPipelineService, CSVImportResult } from '../services/ImportPipelineService';
import { Upload, FileText, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

const SAMPLE_DEFAULT_CSV = `Date,Title,Narration,Amount,Type,Account
2026-08-06,ITC Limited,ACH/C-/ITC LTD DIVIDEND/NSE0098,2100,INCOME,HDFC Bank
2026-08-04,Coal India Ltd,ECS/C/COAL INDIA INT DIVIDEND,1500,INCOME,SBI Bank
2026-08-01,Imported Payout 1,ACH/C/DIVIDEND-CREDIT-ROW-1,1000,INCOME,HDFC Bank (...4921)
2026-08-01,Imported Payout 2,ACH/C/DIVIDEND-CREDIT-ROW-2,1000,INCOME,HDFC Bank (...4921)
2026-08-01,=HYPERLINK("https://evil.com","Click"),HOSTILE-PAYLOAD,100,INCOME,HDFC Bank`;

export const ImportPage: React.FC = () => {
  const [selectedBroker, setSelectedBroker] = useState('Zerodha');
  const [showReview, setShowReview] = useState(false);
  const [importResult, setImportResult] = useState<CSVImportResult | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('Simulated_Statement.csv');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { transactions, commitImportedRows } = useCanonicalLedger();

  const brokers = [
    'Zerodha', 'Groww', 'INDmoney', 'Upstox', 'ICICI Direct',
    'CDSL', 'Angel One', 'HDFC Bank', 'SBI Bank', 'ICICI Bank'
  ];

  const runPipeline = (csvText: string, fileName: string) => {
    const result = ImportPipelineService.processCSV(csvText, transactions, selectedBroker, fileName);
    setImportResult(result);
    setSelectedFileName(fileName);
    setShowReview(true);
  };

  const handleSimulate = () => {
    runPipeline(SAMPLE_DEFAULT_CSV, `${selectedBroker}_Statement_Aug2026.csv`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        runPipeline(text, file.name);
      }
    };
    reader.readAsText(file);
  };

  const handleCommit = () => {
    if (!importResult) return;
    const { appended, duplicates } = commitImportedRows(importResult.validRows);
    setShowReview(false);
    setImportResult(null);
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

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".csv,.txt"
          className="hidden"
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-10 text-center bg-gray-50 dark:bg-gray-800/50 hover:border-green-600 cursor-pointer transition mb-4"
        >
          <Upload className="mx-auto mb-2 text-gray-400" size={32} />
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            Upload Statement File (.csv)
          </h4>
          <p className="text-sm text-gray-500 mb-5">
            Real CSV uploader with canonical SHA-256 / fingerprint deduplication and formula injection rejection.
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="px-5 py-2.5 rounded-lg bg-green-700 hover:bg-green-800 text-white font-bold text-sm shadow-sm mr-3"
          >
            Select File (.csv)
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSimulate();
            }}
            className="px-5 py-2.5 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-bold text-sm shadow-sm"
          >
            Simulate Upload
          </button>
        </div>

        {showReview && importResult && (
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <FileText size={18} /> Stage 5: Data Quality & Duplicate Review ({selectedFileName})
              </span>
              <span className="px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
                {importResult.totalDetected} Rows Detected
              </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-600" />
                <span><strong>{importResult.validRows.length} Valid New Transactions</strong> (Unique canonical fingerprints)</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-600" />
                <span><strong>{importResult.duplicateCount} Duplicates Flagged</strong> (Matching existing fingerprint Set, automatically skipped)</span>
              </div>
              {importResult.invalidCount > 0 && (
                <div className="flex items-center gap-2">
                  <XCircle size={16} className="text-red-600" />
                  <span><strong>{importResult.invalidCount} Invalid/Malformed Rows</strong> (Rejected)</span>
                </div>
              )}
            </div>
            <button
              onClick={handleCommit}
              disabled={importResult.validRows.length === 0}
              className={`px-5 py-2.5 rounded-lg font-bold text-sm shadow-sm transition ${
                importResult.validRows.length === 0
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-green-700 hover:bg-green-800 text-white'
              }`}
            >
              Review & Commit {importResult.validRows.length} Valid Rows to Canonical Ledger (Append Mode)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
