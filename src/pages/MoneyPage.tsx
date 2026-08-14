import React, { useState } from 'react';
import { useCanonicalLedger } from '../store/useCanonicalLedger';
import { FinancialQueries } from '../application/queries';
import { KpiCard } from '../components/ui/KpiCard';
import { ChartCard } from '../components/ui/ChartCard';
import { EmptyState } from '../components/ui/EmptyState';
import { CurrencyValue } from '../components/CurrencyValue';
import { BudgetWorkspace } from '../components/money/BudgetWorkspace';
import { AccountsWorkspace } from '../components/money/AccountsWorkspace';
import { MoneyInsightsWorkspace } from '../components/money/MoneyInsightsWorkspace';
import { Search, Download, ChevronDown, Calendar, TrendingUp, TrendingDown, Wallet, PieChart } from 'lucide-react';

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
  const insights = FinancialQueries.getMoneyInsights(dateRange);

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

  // Sparkline data sequences from monthly trends
  const incomeSparkline = insights.monthlyTrends.map(t => t.income);
  const expenseSparkline = insights.monthlyTrends.map(t => t.expense);
  const netSparkline = insights.monthlyTrends.map(t => t.net);
  const savingsRateSparkline = insights.monthlyTrends.map(t => (t.income > 0 ? ((t.income - t.expense) / t.income) * 100 : 0));

  // Category palette
  const categoryColors = [
    '#10B981', '#06B6D4', '#6366F1', '#F59E0B', '#EC4899', '#8B5CF6', '#F97316', '#14B8A6'
  ];

  return (
    <div className="space-y-8" onClick={() => { setAddMenuOpen(false); setDateMenuOpen(false); }}>
      {/* Title & Action Toolbar */}
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
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
            >
              <Download size={14} />
              <span>Export</span>
            </button>
          )}

          {/* + Add Dropdown */}
          <div className="relative inline-block" onClick={e => e.stopPropagation()}>
            <button
              id="btn-add-menu-dropdown"
              onClick={() => setAddMenuOpen(!addMenuOpen)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition cursor-pointer"
            >
              <span>+ Add</span>
              <ChevronDown size={14} />
            </button>

            {addMenuOpen && (
              <div className="absolute right-0 top-11 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-1.5 z-50">
                <button
                  id="btn-add-income-menu"
                  onClick={() => { openModal('modal-income'); setAddMenuOpen(false); }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold text-gray-800 dark:text-gray-200 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-emerald-500 font-bold">+</span>
                    <span>Income</span>
                  </div>
                  <span className="text-[11px] text-gray-400 font-normal">Dividend / Salary</span>
                </button>

                <button
                  id="btn-add-expense-menu"
                  onClick={() => { openModal('modal-expense'); setAddMenuOpen(false); }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold text-gray-800 dark:text-gray-200 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-rose-500 font-bold">-</span>
                    <span>Expense</span>
                  </div>
                  <span className="text-[11px] text-gray-400 font-normal">Dining / Shopping</span>
                </button>

                <button
                  id="btn-add-transfer-menu"
                  onClick={() => { openModal('modal-transfer'); setAddMenuOpen(false); }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold text-gray-800 dark:text-gray-200 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-cyan-500 font-bold">⇄</span>
                    <span>Transfer</span>
                  </div>
                  <span className="text-[11px] text-gray-400 font-normal">₹0 Net Impact</span>
                </button>

                <div className="h-px bg-gray-200 dark:bg-gray-800 my-1" />

                <button
                  id="btn-import-csv-menu"
                  onClick={() => { openSidebarTab('import'); setAddMenuOpen(false); }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold text-gray-800 dark:text-gray-200 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-cyan-500">📥</span>
                    <span>Import from CSV</span>
                  </div>
                  <span className="text-[11px] text-gray-400 font-normal">5-Stage Pipeline</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modern FinBoom Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Income"
          value={<CurrencyValue value={insights.totalIncome} />}
          change={insights.status === 'RECONCILED' ? `${dateRange}` : undefined}
          changeType="neutral"
          status={insights.status}
          sparklineData={incomeSparkline.length > 1 ? incomeSparkline : undefined}
          accentColor="emerald"
          icon={<TrendingUp size={18} className="text-emerald-400" />}
          tooltip="Total realized income (dividends, salary, yield) for the selected period"
        />

        <KpiCard
          label="Total Expenses"
          value={<CurrencyValue value={insights.totalExpenses} />}
          change={insights.status === 'RECONCILED' ? `${dateRange}` : undefined}
          changeType="neutral"
          status={insights.status}
          sparklineData={expenseSparkline.length > 1 ? expenseSparkline : undefined}
          accentColor="rose"
          icon={<TrendingDown size={18} className="text-rose-400" />}
          tooltip="Total recorded living and operational expenditures for the selected period"
        />

        <KpiCard
          label="Net Cash Flow"
          value={<CurrencyValue value={insights.netCashFlow} />}
          change={insights.status === 'RECONCILED' ? (insights.netCashFlow >= 0 ? 'Surplus' : 'Deficit') : undefined}
          changeType={insights.netCashFlow >= 0 ? 'positive' : 'negative'}
          status={insights.status}
          sparklineData={netSparkline.length > 1 ? netSparkline : undefined}
          accentColor="cyan"
          icon={<Wallet size={18} className="text-cyan-400" />}
          tooltip="Net cash savings (Total Income minus Total Expenses)"
        />

        <KpiCard
          label="Savings Rate"
          value={insights.status === 'NOT_CONFIGURED' ? '0.0%' : `${insights.savingsRate.toFixed(1)}%`}
          change={insights.status === 'RECONCILED' ? (insights.savingsRate >= 20 ? 'Target Met (>=20%)' : 'Below 20% Target') : undefined}
          changeType={insights.savingsRate >= 20 ? 'positive' : 'neutral'}
          status={insights.status}
          sparklineData={savingsRateSparkline.length > 1 ? savingsRateSparkline : undefined}
          accentColor="indigo"
          icon={<PieChart size={18} className="text-indigo-400" />}
          tooltip="Percentage of incoming cash flow retained after all recorded expenditures"
        />
      </div>

      {/* Middle Visual Chart Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Cash Flow Overview (Monthly bar representation) */}
        <div className="lg:col-span-8">
          <ChartCard
            title="Cash Flow Dynamics"
            subtitle="Trailing monthly distribution of income, expenses, and net surplus"
            badgeText={dateRange}
          >
            {insights.status === 'NOT_CONFIGURED' || insights.monthlyTrends.length === 0 ? (
              <EmptyState
                title="No Cash Flow Records"
                description="Record income or expense transactions to visualize monthly cash flow dynamics and trends."
                actionLabel="+ Record Income"
                onAction={() => openModal('modal-income')}
              />
            ) : (
              <div className="h-64 flex flex-col justify-between pt-4">
                {/* Visual Bar Chart */}
                <div className="flex-1 flex items-end justify-around gap-4 pb-2 border-b border-gray-800">
                  {insights.monthlyTrends.map((trend, idx) => {
                    const maxVal = Math.max(
                      ...insights.monthlyTrends.map(t => Math.max(t.income, t.expense, Math.abs(t.net))),
                      1
                    );
                    const incomeH = Math.min(100, Math.max(4, (trend.income / maxVal) * 100));
                    const expenseH = Math.min(100, Math.max(4, (trend.expense / maxVal) * 100));
                    const netH = Math.min(100, Math.max(4, (Math.abs(trend.net) / maxVal) * 100));

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                        {/* Tooltip on hover */}
                        <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-[10px] text-white px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap z-20 border border-gray-700">
                          <div>Inc: ₹{trend.income.toLocaleString('en-IN')}</div>
                          <div>Exp: ₹{trend.expense.toLocaleString('en-IN')}</div>
                          <div>Net: ₹{trend.net.toLocaleString('en-IN')}</div>
                        </div>

                        {/* Bars cluster */}
                        <div className="w-full flex items-end justify-center gap-1.5 h-44">
                          {/* Income Bar */}
                          <div
                            style={{ height: `${incomeH}%` }}
                            className="w-1/3 max-w-[16px] bg-emerald-500 rounded-t transition-all hover:brightness-125"
                            title={`Income: ₹${trend.income.toLocaleString('en-IN')}`}
                          />
                          {/* Expense Bar */}
                          <div
                            style={{ height: `${expenseH}%` }}
                            className="w-1/3 max-w-[16px] bg-rose-500 rounded-t transition-all hover:brightness-125"
                            title={`Expense: ₹${trend.expense.toLocaleString('en-IN')}`}
                          />
                          {/* Net Bar */}
                          <div
                            style={{ height: `${netH}%` }}
                            className={`w-1/3 max-w-[16px] ${trend.net >= 0 ? 'bg-cyan-500' : 'bg-amber-500'} rounded-t transition-all hover:brightness-125`}
                            title={`Net: ₹${trend.net.toLocaleString('en-IN')}`}
                          />
                        </div>
                        <span className="text-[11px] font-medium text-gray-400 truncate mt-2">{trend.month}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 pt-3 text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-emerald-500" />
                    <span>Income</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-rose-500" />
                    <span>Expenses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-cyan-500" />
                    <span>Net Savings</span>
                  </div>
                </div>
              </div>
            )}
          </ChartCard>
        </div>

        {/* Chart 2: Category Breakdown */}
        <div className="lg:col-span-4">
          <ChartCard
            title="Expense Categories"
            subtitle="Categorical spending breakdown"
            badgeText={insights.expenseCategoryBreakdown.length > 0 ? `${insights.expenseCategoryBreakdown.length} Categories` : undefined}
          >
            {insights.status === 'NOT_CONFIGURED' || insights.expenseCategoryBreakdown.length === 0 ? (
              <EmptyState
                title="No Expense Categories"
                description="Categorized expenditures will be aggregated and visualized here."
                actionLabel="+ Add Expense"
                onAction={() => openModal('modal-expense')}
              />
            ) : (
              <div className="space-y-4 pt-2">
                {/* Top categories breakdown bars */}
                <div className="space-y-3">
                  {insights.expenseCategoryBreakdown.slice(0, 5).map((cat, idx) => {
                    const color = categoryColors[idx % categoryColors.length];
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                            <span className="font-semibold text-gray-800 dark:text-gray-200 truncate">{cat.category}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="font-bold text-gray-900 dark:text-white"><CurrencyValue value={cat.amount} /></span>
                            <span className="text-gray-400 text-[11px]">({cat.pct.toFixed(0)}%)</span>
                          </div>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, Math.max(2, cat.pct))}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {insights.expenseCategoryBreakdown.length > 5 && (
                  <div className="text-center pt-1 text-[11px] text-gray-400">
                    + {insights.expenseCategoryBreakdown.length - 5} additional categories in ledger
                  </div>
                )}
              </div>
            )}
          </ChartCard>
        </div>
      </div>

      {/* Sub-Navigation Tabs Bar */}
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
            className={`pb-3 font-bold text-xs tracking-wider uppercase transition border-b-2 -mb-px outline-none cursor-pointer ${
              subTab === tab.id
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
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
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    filterType === pill
                      ? 'bg-emerald-600 text-white shadow-sm'
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
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
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
                      className={`w-full text-left px-3.5 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold cursor-pointer ${
                        r === '12M' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold' : 'text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {r === '12M' ? '12M (Last 12 Months - Dividends)' : r}
                    </button>
                  ))}
                  <div className="h-px bg-gray-200 dark:bg-gray-800 my-1" />
                  <button
                    onClick={() => { openModal('modal-custom-date'); setDateMenuOpen(false); }}
                    className="w-full text-left px-3.5 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold text-gray-800 dark:text-gray-200 cursor-pointer"
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
                className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 font-bold text-xs hover:bg-emerald-100 hover:text-emerald-700 dark:hover:bg-emerald-900/40 dark:hover:text-emerald-400 transition cursor-pointer"
              >
                + View Reconciled 12M Dividend & Cash Flow Ledger
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <span className="font-bold text-sm text-gray-900 dark:text-white">Canonical Financial Ledger (Source of Truth)</span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                  {dateRange} ({filterType})
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
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
                        <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
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
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                                  : isTr
                                  ? 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400'
                                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {row.type}
                            </span>
                          </td>
                          <td
                            className={`py-3.5 px-6 font-bold text-right ${
                              isInc
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : isTr
                                ? 'text-cyan-500 dark:text-cyan-400'
                                : 'text-rose-500 dark:text-rose-400'
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
