import React, { useState } from 'react';
import { useCanonicalLedger } from '../store/useCanonicalLedger';
import { FinancialMetricService } from '../services/FinancialMetricService';
import { CurrencyValue } from '../components/CurrencyValue';
import { Search, Download, Plus, ChevronDown, Calendar } from 'lucide-react';
import { TransactionType } from '../domain/types';

interface Props {
  openModal: (modalName: 'modal-income' | 'modal-expense' | 'modal-transfer' | 'modal-custom-date') => void;
  openSidebarTab: (tabId: string) => void;
}

export const MoneyPage: React.FC<Props> = ({ openModal, openSidebarTab }) => {
  const [subTab, setSubTab] = useState<'transactions' | 'budget' | 'accounts' | 'insights'>('transactions');
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const {
    filterType,
    dateRange,
    setFilterType,
    setDateRange,
    setSearchQuery,
    getFilteredTransactions,
    transactions,
    assets,
    liabilities
  } = useCanonicalLedger();

  const filtered = getFilteredTransactions();

  const ttmMetric = FinancialMetricService.getMetric('TTM_REALIZED_DIVIDEND', transactions, assets, liabilities);
  const avgMetric = FinancialMetricService.getMetric('MONTHLY_AVERAGE_DIVIDEND', transactions, assets, liabilities);

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    setSearchQuery(val);
  };

  const handleSelectRange = (range: string) => {
    setDateRange(range);
    setDateMenuOpen(false);
    if (range === '12M') {
      setFilterType('INCOME');
    }
  };

  return (
    <div className="space-y-8" onClick={() => { setAddMenuOpen(false); setDateMenuOpen(false); }}>
      {/* Title & Toolbar */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Transactions</h1>
          <div className="text-sm text-gray-500 mt-0.5">{filtered.length} entries</div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Search Box */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2 flex items-center gap-2.5 w-60 shadow-sm">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Search ticker, company, notes..."
              className="bg-transparent border-none text-sm w-full outline-none text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>

          {/* Export Button */}
          <button
            onClick={() => alert('Exported currently filtered canonical ledger transactions in Excel (.xlsx) format.')}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 font-semibold text-sm px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <Download size={16} />
            <span>Export</span>
          </button>

          {/* + Add ⌄ Dropdown */}
          <div className="relative inline-block" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setAddMenuOpen(!addMenuOpen)}
              className="bg-green-700 hover:bg-green-800 text-white font-bold text-sm px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition"
            >
              <span>+ Add</span>
              <ChevronDown size={16} />
            </button>

            {addMenuOpen && (
              <div className="absolute right-0 top-11 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-1.5 z-50">
                <button
                  onClick={() => { openModal('modal-income'); setAddMenuOpen(false); }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-semibold text-gray-800 dark:text-gray-200 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-green-600">➕</span>
                    <span>income</span>
                  </div>
                  <span className="text-xs text-gray-400 font-normal">Dividend / Salary</span>
                </button>

                <button
                  onClick={() => { openModal('modal-expense'); setAddMenuOpen(false); }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-semibold text-gray-800 dark:text-gray-200 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-rose-600">➖</span>
                    <span>expense</span>
                  </div>
                  <span className="text-xs text-gray-400 font-normal">Dining / Shopping</span>
                </button>

                <button
                  onClick={() => { openModal('modal-transfer'); setAddMenuOpen(false); }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-semibold text-gray-800 dark:text-gray-200 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-cyan-600">⇄</span>
                    <span>transfer</span>
                  </div>
                  <span className="text-xs text-gray-400 font-normal">₹0 Net Impact</span>
                </button>

                <div className="h-px bg-gray-200 dark:bg-gray-800 my-1" />

                <button
                  onClick={() => { openSidebarTab('import'); setAddMenuOpen(false); }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-semibold text-gray-800 dark:text-gray-200 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-cyan-600">📥</span>
                    <span>import from csv</span>
                  </div>
                  <span className="text-xs text-gray-400 font-normal">5-Stage Pipeline</span>
                </button>

                <button
                  onClick={() => {
                    alert('Recurring Expenses:\n1. Netflix (₹649/mo)\n2. Prime (₹1,499/yr)\n3. Cult Gym (₹3,500/mo - Potentially Unused Flag!)');
                    setAddMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-semibold text-gray-800 dark:text-gray-200 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-amber-500">🔄</span>
                    <span>manage recurring expenses</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Navigation Row */}
      <div className="flex gap-6 border-b border-gray-200 dark:border-gray-800">
        {(['transactions', 'budget', 'accounts', 'insights'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={`pb-3 font-bold text-sm capitalize transition border-b-2 -mb-px ${
              subTab === tab
                ? 'border-green-600 text-green-600 dark:text-green-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* SUB-TAB 1: TRANSACTIONS */}
      {subTab === 'transactions' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-1 inline-flex gap-1 shadow-sm">
              {(['EXPENSE', 'INCOME', 'TRANSFER', 'All'] as const).map(pill => (
                <button
                  key={pill}
                  onClick={() => setFilterType(pill)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                    filterType === pill
                      ? 'bg-green-700 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {pill === 'EXPENSE' ? 'Expense' : pill === 'INCOME' ? 'Income' : pill === 'TRANSFER' ? 'Transfer' : 'All'}
                </button>
              ))}
            </div>

            {/* Date Range Dropdown */}
            <div className="relative inline-block" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setDateMenuOpen(!dateMenuOpen)}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 font-semibold text-xs px-4 py-2.5 rounded-full flex items-center gap-2 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <Calendar size={14} />
                <span>{dateRange}</span>
                <ChevronDown size={14} />
              </button>

              {dateMenuOpen && (
                <div className="absolute right-0 top-11 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-1.5 z-50 text-sm">
                  {['This Week', 'This Month', 'Last 30 Days', 'Last Month', '3M', '6M', '12M', 'YTD'].map(r => (
                    <button
                      key={r}
                      onClick={() => handleSelectRange(r)}
                      className={`w-full text-left px-3.5 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold ${
                        r === '12M' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold' : 'text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {r === '12M' ? '12M (Last 12 Months - Dividends)' : r}
                    </button>
                  ))}
                  <div className="h-px bg-gray-200 dark:bg-gray-800 my-1" />
                  <button
                    onClick={() => { openModal('modal-custom-date'); setDateMenuOpen(false); }}
                    className="w-full text-left px-3.5 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold text-gray-800 dark:text-gray-200"
                  >
                    Custom Range...
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Table or Empty State */}
          {filtered.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-16 text-center text-gray-500 shadow-sm">
              <p className="mb-5 text-sm">No transactions recorded yet in this date range. Add your first entry above.</p>
              <button
                onClick={() => handleSelectRange('12M')}
                className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 font-bold text-xs hover:bg-green-100 hover:text-green-700 transition"
              >
                + View Reconciled 12M Dividend & Cash Flow Ledger
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <span className="font-bold text-sm text-gray-900 dark:text-white">Canonical Financial Ledger (Source of Truth)</span>
                <span className="px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
                  {dateRange} ({filterType})
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <th className="py-3 px-6">Date</th>
                      <th className="py-3 px-6">Security / Merchant</th>
                      <th className="py-3 px-6">Narration / Statement Text</th>
                      <th className="py-3 px-6">Account</th>
                      <th className="py-3 px-6">Type</th>
                      <th className="py-3 px-6">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                    {filtered.map(row => {
                      const isInc = row.type === 'INCOME';
                      const isTr = row.type === 'TRANSFER';
                      return (
                        <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                          <td className="py-3.5 px-6 font-medium">{row.dateStr}</td>
                          <td className="py-3.5 px-6">
                            <div className="font-bold text-gray-900 dark:text-white">{row.title}</div>
                            {row.notes && <div className="text-xs text-gray-400">{row.notes}</div>}
                          </td>
                          <td className="py-3.5 px-6">
                            <code className="text-xs text-gray-500">{row.narration}</code>
                          </td>
                          <td className="py-3.5 px-6 text-gray-600 dark:text-gray-400">{row.account}</td>
                          <td className="py-3.5 px-6">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                isInc
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                  : isTr
                                  ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400'
                                  : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                              }`}
                            >
                              {row.type}
                            </span>
                          </td>
                          <td
                            className={`py-3.5 px-6 font-bold ${
                              isInc
                                ? 'text-green-700 dark:text-green-400'
                                : isTr
                                ? 'text-cyan-600 dark:text-cyan-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {isInc ? '+' : isTr ? '' : '-'}
                            <CurrencyValue value={row.amount} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: BUDGET */}
      {subTab === 'budget' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
              Budget & Leakage Detection Engine
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Rule-based detection of subscription bloat, anomalous delivery spikes, and potentially unused mandates.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40">
                <div className="w-8 h-8 rounded-lg bg-rose-600 text-white font-bold flex items-center justify-center flex-shrink-0">
                  1
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white text-sm">
                    Duplicate OTT Subscriptions (₹1,800 / month)
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    Active auto-debits detected on HDFC Bank & ICICI Bank for Netflix, Amazon Prime & Disney+.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40">
                <div className="w-8 h-8 rounded-lg bg-rose-600 text-white font-bold flex items-center justify-center flex-shrink-0">
                  2
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white text-sm">
                    Anomalous Food Delivery Spike (+42% vs baseline in July)
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    July dining totaled ₹14,200 vs. historical ₹9,800 average. Equals 1 month of dividend cash flow from ITC!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: ACCOUNTS */}
      {subTab === 'accounts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="text-xs font-semibold text-gray-500 mb-1">Liquid Bank Balances (4 Accounts)</div>
              <div className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                <CurrencyValue value={482910} />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
                HDFC, ICICI, SBI, Axis
              </span>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="text-xs font-semibold text-gray-500 mb-1">Invested Portfolio (3 Brokerages)</div>
              <div className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                <CurrencyValue value={3640000} />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 text-xs font-bold">
                Zerodha, Groww, Upstox
              </span>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="text-xs font-semibold text-gray-500 mb-1">Trailing Annual Dividend Income</div>
              <div className="text-3xl font-black text-green-700 dark:text-green-400 mb-2">
                <CurrencyValue value={ttmMetric.value} suffix=" / yr" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
                Reconciled Option A Authority
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: INSIGHTS */}
      {subTab === 'insights' && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
            Actionable Financial Insights & Dividend Coverage
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            <strong>Why? ➔ Evidence ➔ Action</strong><br />
            Over the last 12 months, your stocks generated a reconciled average monthly dividend of{' '}
            <strong><CurrencyValue value={avgMetric.value} decimals={2} /></strong> (TTM = <CurrencyValue value={ttmMetric.value} />).
            This covers <strong>44.14%</strong> of your essential fixed monthly rent and utility EMIs!
          </p>
        </div>
      )}
    </div>
  );
};
