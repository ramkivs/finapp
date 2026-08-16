import React, { useState } from 'react';
import { CashFlowEntry } from '../../domain/types';
import { FinancialQueries } from '../../application/queries';
import { CurrencyValue } from '../CurrencyValue';
import { ProvenanceBadge } from '../ui/ProvenanceBadge';
import { Calculator, Plus, Trash2, RotateCcw, AlertTriangle, ShieldCheck, ArrowDownRight, ArrowUpRight } from 'lucide-react';

const DEFAULT_CASH_FLOWS: CashFlowEntry[] = [
  { id: 'cf-1', date: '2024-01-01', amount: -50000, description: 'Initial Mutual Fund Investment' },
  { id: 'cf-2', date: '2024-06-01', amount: -25000, description: 'Top-Up Investment' },
  { id: 'cf-3', date: '2025-01-01', amount: -25000, description: 'Year 2 SIP Installment' },
  { id: 'cf-4', date: '2025-08-01', amount: 5000, description: 'Dividend / Partial Withdrawal' },
  { id: 'cf-5', date: '2026-08-01', amount: 125000, description: 'Current Portfolio Market Value' }
];

export const XirrCalculator: React.FC = () => {
  const [cashFlows, setCashFlows] = useState<CashFlowEntry[]>(DEFAULT_CASH_FLOWS);
  const [mode, setMode] = useState<'custom' | 'sip'>('custom');

  // SIP Generator parameters
  const [sipAmount, setSipAmount] = useState<number>(10000);
  const [sipStartDate, setSipStartDate] = useState<string>('2025-01-01');
  const [sipMonths, setSipMonths] = useState<number>(12);
  const [sipTerminalValue, setSipTerminalValue] = useState<number>(135000);

  const calcResult = FinancialQueries.calculateXirr(cashFlows);
  const isCalculated = calcResult.state === 'VALID' && calcResult.data !== null;
  const result = calcResult.data || {
    effectiveAnnualRate: 0,
    displayRate: '0.00%',
    totalInvested: 0,
    totalWithdrawn: 0,
    netGain: 0,
    rootStatus: 'NONE' as const
  };

  const handleAddFlow = (isOutflow: boolean) => {
    const newEntry: CashFlowEntry = {
      id: 'cf-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      date: new Date().toISOString().slice(0, 10),
      amount: isOutflow ? -10000 : 15000,
      description: isOutflow ? 'New Investment (Outflow)' : 'New Inflow / Redemption'
    };
    setCashFlows([...cashFlows, newEntry]);
  };

  const handleUpdateFlow = (id: string, field: keyof CashFlowEntry, value: any) => {
    setCashFlows(cashFlows.map(cf => {
      if (cf.id !== id) return cf;
      if (field === 'amount') {
        return { ...cf, amount: Number(value) || 0 };
      }
      return { ...cf, [field]: value };
    }));
  };

  const handleDeleteFlow = (id: string) => {
    setCashFlows(cashFlows.filter(cf => cf.id !== id));
  };

  const handleReset = () => {
    setCashFlows(DEFAULT_CASH_FLOWS);
  };

  const handleGenerateSipFlows = () => {
    const flows: CashFlowEntry[] = [];
    const [startYear, startMonth, startDay] = sipStartDate.split('-').map(Number);

    for (let i = 0; i < sipMonths; i++) {
      const d = new Date(startYear, (startMonth - 1) + i, startDay || 1);
      const dateStr = d.toISOString().slice(0, 10);
      flows.push({
        id: `sip-cf-${i + 1}`,
        date: dateStr,
        amount: -Math.abs(sipAmount),
        description: `Monthly SIP Installment #${i + 1}`
      });
    }

    // Terminal value at end of period
    const terminalDate = new Date(startYear, (startMonth - 1) + sipMonths, startDay || 1);
    flows.push({
      id: 'sip-cf-terminal',
      date: terminalDate.toISOString().slice(0, 10),
      amount: Math.abs(sipTerminalValue),
      description: 'Terminal Valuation'
    });

    setCashFlows(flows);
    setMode('custom');
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2.5">
            <Calculator className="text-cyan-600 dark:text-cyan-400" size={20} />
            <div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                Extended Internal Rate of Return (XIRR) Engine
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Exact annualized return calculation for irregular cash flows, staggered SIPs, and dividend payouts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex gap-1 border border-gray-200 dark:border-gray-700">
              <button
                type="button"
                id="btn-xirr-mode-custom"
                onClick={() => setMode('custom')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  mode === 'custom'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Custom Cash Flows
              </button>
              <button
                type="button"
                id="btn-xirr-mode-sip"
                onClick={() => setMode('sip')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  mode === 'sip'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                SIP Generator Mode
              </button>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
              title="Reset to default cash flows"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* SIP Generator Form Drawer */}
        {mode === 'sip' && (
          <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl space-y-4">
            <h4 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
              Quick SIP Timeline Generator
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Monthly Installment (₹)
                </label>
                <input
                  type="number"
                  value={sipAmount}
                  onChange={e => setSipAmount(Number(e.target.value) || 0)}
                  className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={sipStartDate}
                  onChange={e => setSipStartDate(e.target.value)}
                  className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Duration (Months)
                </label>
                <input
                  type="number"
                  value={sipMonths}
                  onChange={e => setSipMonths(Number(e.target.value) || 1)}
                  className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Terminal Portfolio Value (₹)
                </label>
                <input
                  type="number"
                  value={sipTerminalValue}
                  onChange={e => setSipTerminalValue(Number(e.target.value) || 0)}
                  className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                id="btn-generate-sip-flows"
                onClick={handleGenerateSipFlows}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition shadow-sm"
              >
                <span>Populate Cash Flows Table</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* XIRR Results Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
            Annualized XIRR
          </span>
          <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-1">
            {isCalculated ? result.displayRate : 'Invalid Flow'}
          </div>
          <span className={`text-[10px] font-bold mt-1 block ${isCalculated ? 'text-green-600 dark:text-green-400' : 'text-rose-600'}`}>
            {isCalculated ? 'Converged via Hardened Newton-Raphson Solver' : calcResult.error?.message || 'Error calculating XIRR'}
          </span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
            Total Capital Invested
          </span>
          <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
            <CurrencyValue value={result.totalInvested} />
          </div>
          <span className="text-[10px] text-gray-400 mt-1 block">
            Sum of all negative outflows
          </span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
            Total Inflows / Terminal
          </span>
          <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
            <CurrencyValue value={result.totalWithdrawn} />
          </div>
          <span className="text-[10px] text-gray-400 mt-1 block">
            Redemptions + Final Market Value
          </span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
            Net Absolute Gain
          </span>
          <div className={`text-2xl font-black mt-1 ${result.netGain >= 0 ? 'text-green-700 dark:text-green-400' : 'text-rose-600'}`}>
            {result.netGain >= 0 ? '+' : ''}<CurrencyValue value={result.netGain} />
          </div>
          <span className="text-[10px] text-gray-400 mt-1 block">
            Absolute return: {result.totalInvested > 0 ? `${Math.round((result.netGain / result.totalInvested) * 100)}%` : '0%'}
          </span>
        </div>
      </div>

      {/* Cash Flow Timeline Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
              Cash Flow Schedule ({cashFlows.length} Entries)
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Negative values indicate investments/outflows; positive values indicate withdrawals or terminal valuation
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-add-outflow"
              onClick={() => handleAddFlow(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-800 dark:text-gray-200 text-xs font-bold border border-gray-200 dark:border-gray-700"
            >
              <ArrowDownRight size={13} className="text-rose-500" />
              <span>+ Outflow (Invest)</span>
            </button>

            <button
              type="button"
              id="btn-add-inflow"
              onClick={() => handleAddFlow(false)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-100 text-cyan-800 dark:text-cyan-300 text-xs font-bold border border-cyan-200 dark:border-cyan-800"
            >
              <ArrowUpRight size={13} className="text-green-500" />
              <span>+ Inflow / Valuation</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Description / Narration</th>
                <th className="py-2.5 px-3">Cash Flow Amount (₹)</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {cashFlows.map((cf) => {
                const isOutflow = cf.amount < 0;
                return (
                  <tr key={cf.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <td className="py-2 px-3">
                      <input
                        type="date"
                        value={cf.date}
                        onChange={e => handleUpdateFlow(cf.id, 'date', e.target.value)}
                        className="bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-xs text-gray-900 dark:text-white font-semibold outline-none focus:border-cyan-500"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={cf.description || ''}
                        onChange={e => handleUpdateFlow(cf.id, 'description', e.target.value)}
                        placeholder="Investment or Dividend"
                        className="w-full bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-xs text-gray-900 dark:text-white outline-none focus:border-cyan-500"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        value={cf.amount}
                        onChange={e => handleUpdateFlow(cf.id, 'amount', e.target.value)}
                        className={`w-36 bg-transparent border rounded-lg px-2 py-1 text-xs font-black outline-none ${
                          isOutflow
                            ? 'text-rose-600 border-rose-200 dark:border-rose-900/50'
                            : 'text-green-600 border-green-200 dark:border-green-900/50'
                        }`}
                      />
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isOutflow
                          ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      }`}>
                        {isOutflow ? 'Outflow (Invest)' : 'Inflow (Return)'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteFlow(cf.id)}
                        className="p-1 text-gray-400 hover:text-rose-600 transition"
                        title="Delete cash flow"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Institutional Provenance Badge */}
      {calcResult.provenance && (
        <ProvenanceBadge provenance={calcResult.provenance} />
      )}
    </div>
  );
};
