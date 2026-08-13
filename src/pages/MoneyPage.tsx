import React, { useState } from 'react';
import { useCanonicalLedger } from '../store/useCanonicalLedger';
import { CurrencyValue } from '../components/CurrencyValue';
import { BudgetWorkspace } from '../components/money/BudgetWorkspace';
import { AccountsWorkspace } from '../components/money/AccountsWorkspace';
import { MoneyInsightsWorkspace } from '../components/money/MoneyInsightsWorkspace';
import { Search, Download, Plus, ChevronDown, Calendar, ArrowRight } from 'lucide-react';

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
    accounts,
    budgets
  } = useCanonicalLedger();

  const filtered = getFilteredTransactions();

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    setSearchQuery(val);
  };

  const handleSelectRange = (range: string) => {
    setDateRange(range);
    setDateMenuOpen(false);
    if (range === '12M') {
      setFilterType('Income');
    }
  };

  // Real Transaction CSV Export
  const handleExport = () => {
    if (filtered.length === 0) {
      alert('No transactions to export in currently filtered view.');
      return;
    }
    const header = ['Date', 'Title', 'Narration', 'Account', 'Type', 'Category', 'Amount', 'Status', 'Notes'];
    const rows = filtered.map(t => [
      t.date,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${(t.narration || '').replace(/"/g, '""')}"`,
      `"${(t.account || '').replace(/"/g, '""')}"`,
      t.type,
      t.category,
      t.amount,
      t.status,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `finboom_transactions_${dateRange.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8" onClick={() => { setAddMenuOpen(false); setDateMenuOpen(false); }}>
      {/* Title & Toolbar */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Money & Cash Flow Command
          </h1>
          <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Reconciled transaction ledger, monthly category budgets, registered accounts, and cash flow intelligence.
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Search Box (visible on transactions tab) */}
          {subTab === 'transactions' && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2 flex items-center gap-2.5 w-60 shadow-sm">
              <Search size={16} className="text-gray-400" />
              <input
                id="transaction-search-input"
                type="text"
                value={searchInput}
                onChange={e => handleSearchChange(e.target.value)}
                placeholder="Search ticker, company, notes..."
                className="bg-transparent border-none text-xs w-full outline-none text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
          )}

          {/* Real Export Button */}
          {subTab === 'transactions' && (
            <button
              id="btn-export-transactions"
              onClick={handleExport}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              <Download size={14} />
              <span>Export</span>
            </button>
          )}

          {/* + Add ⌄ Dropdown */}
          <div className="relative inline-block" onClick={e => e.stopPropagation()}>
            <button
              id="btn-add-menu-dropdown"
              onClick={() => setAddMenuOpen(!addMenuOpen)}
              className="bg-green-700 hover:bg-green-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition"
            >
              <span>+ Add</span>
              <ChevronDown size={14} />
            </button>

            {addMenuOpen && (
              <div className="absolute right-0 top-11 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-1.5 z-50">
                <button
                  id="btn-add-income-menu"
                  onClick={() => { openModal('modal-income'); setAddMenuOpen(false); }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold text-gray-800 dark:text-gray-200 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-green-600 font-bold">+</span>
                    <span>Income</span>
                  </div>
                  <span className="text-[11px] text-gray-400 font-normal">Dividend / Salary</span>
                </button>

                <button
                  id="btn-add-expense-menu"
                  onClick={() => { openModal('modal-expense'); setAddMenuOpen(false); }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold text-gray-800 dark:text-gray-200 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-rose-600 font-bold">-</span>
                    <span>Expense</span>
                  </div>
                  <span className="text-[11px] text-gray-400 font-normal">Dining / Shopping</span>
                </button>

                <button
                  id="btn-add-transfer-menu"
                  onClick={() => { openModal('modal-transfer'); setAddMenuOpen(false); }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold text-gray-800 dark:text-gray-200 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-cyan-600 font-bold">⇄</span>
                    <span>Transfer</span>
                  </div>
                  <span className="text-[11px] text-gray-400 font-normal">₹0 Net Impact</span>
                </button>

                <div className="h-px bg-gray-200 dark:bg-gray-800 my-1" />

                <button
                  id="btn-import-csv-menu"
                  onClick={() => { openSidebarTab('import'); setAddMenuOpen(false); }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold text-gray-800 dark:text-gray-200 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-cyan-600">📥</span>
                    <span>Import from CSV</span>
                  </div>
                  <span className="text-[11px] text-gray-400 font-normal">5-Stage Pipeline</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Navigation Row */}
      <div className="flex gap-6 border-b border-gray-200 dark:border-gray-800">
        {(
          [
            { id: 'transactions', label: `Transactions (${filtered.length})` },
            { id: 'budget', label: 'Budget' },
            { id: 'accounts', label: `Accounts (${accounts.length})` },
            { id: 'insights', label: 'Insights' }
          ] as const
        ).map(tab => (
          <button
            key={tab.id}
            id={`money-tab-${tab.id}`}
            onClick={() => setSubTab(tab.id)}
            className={`pb-3 font-bold text-xs tracking-wider uppercase transition border-b-2 -mb-px outline-none ${
              subTab === tab.id
                ? 'border-green-600 text-green-700 dark:text-green-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SUB-TAB 1: TRANSACTIONS */}
      {subTab === 'transactions' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-1 inline-flex gap-1 shadow-sm">
              {(['Expense', 'Income', 'Transfer', 'All'] as const).map(pill => (
                <button
                  key={pill}
                  id={`pill-filter-${pill.toLowerCase()}`}
                  onClick={() => setFilterType(pill)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                    filterType === pill
                      ? 'bg-green-700 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {pill}
                </button>
              ))}
            </div>

            {/* Date Range Dropdown */}
            <div className="relative inline-block" onClick={e => e.stopPropagation()}>
              <button
                id="btn-date-range-dropdown"
                onClick={() => setDateMenuOpen(!dateMenuOpen)}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
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
              <p className="mb-5 text-sm">No expenses recorded yet in this date range. Add your first entry above.</p>
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
                      <th className="py-3 px-6 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                    {filtered.map(row => {
                      const isInc = row.type === 'Income';
                      const isTr = row.type === 'Transfer';
                      return (
                        <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                          <td className="py-3.5 px-6 font-medium text-gray-900 dark:text-white">{row.dateStr}</td>
                          <td className="py-3.5 px-6">
                            <div className="font-bold text-gray-900 dark:text-white">{row.title}</div>
                            {row.notes && <div className="text-xs text-gray-400">{row.notes}</div>}
                          </td>
                          <td className="py-3.5 px-6">
                            <code className="text-xs text-gray-500 dark:text-gray-400">{row.narration}</code>
                          </td>
                          <td className="py-3.5 px-6 text-gray-600 dark:text-gray-400 text-xs">{row.account}</td>
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
                            className={`py-3.5 px-6 font-bold text-right ${
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

      {/* SUB-TAB 2: BUDGET (Workstream M2) */}
      {subTab === 'budget' && (
        <BudgetWorkspace transactions={transactions} budgets={budgets} />
      )}

      {/* SUB-TAB 3: ACCOUNTS (Workstream M3) */}
      {subTab === 'accounts' && (
        <AccountsWorkspace accounts={accounts} />
      )}

      {/* SUB-TAB 4: INSIGHTS (Workstream M4) */}
      {subTab === 'insights' && (
        <MoneyInsightsWorkspace />
      )}
    </div>
  );
};
