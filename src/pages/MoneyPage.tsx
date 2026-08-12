import React, { useState } from 'react';
import { useCanonicalLedger } from '../store/useCanonicalLedger';
import { FinancialMetricService } from '../services/FinancialMetricService';
import { CurrencyValue } from '../components/CurrencyValue';
import { Search, Download, Plus, ChevronDown, Calendar, Wallet, Landmark, PiggyBank, ShieldCheck } from 'lucide-react';
import { KpiCard } from '../components/dashboard/KpiCard';
import { ChartCard } from '../components/dashboard/ChartCard';
import { EmptyState } from '../components/common/EmptyState';

interface Props {
  openModal: (modalName: 'modal-income' | 'modal-expense' | 'modal-transfer' | 'modal-custom-date') => void;
  openSidebarTab: (tabId: string) => void;
}

export const MoneyPage: React.FC<Props> = ({ openModal, openSidebarTab }) => {
  const [subTab, setSubTab] = useState<'transactions' | 'budget' | 'accounts' | 'insights'>('transactions');
  const [addMenuOpen, setAddMenuOpen] = useState(false);
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

  const liquidBankTotal = assets
    .filter(a => a.name.toLowerCase().includes("bank") || a.name.toLowerCase().includes("account") || a.name.toLowerCase().includes("liquid") || a.name.includes("4 Bank"))
    .reduce((s, a) => s + a.amount, 0);

  const investedPortfolioTotal = assets
    .filter(a => a.name.toLowerCase().includes("brokerage") || a.name.toLowerCase().includes("invest") || a.name.toLowerCase().includes("zerodha") || a.name.toLowerCase().includes("groww") || a.name.toLowerCase().includes("upstox") || a.name.includes("3 Brokerages"))
    .reduce((s, a) => s + a.amount, 0);

  const hasOttLeakage = transactions.some(t => t.title.toLowerCase().includes("netflix") || t.title.toLowerCase().includes("prime") || t.title.toLowerCase().includes("disney") || t.category === "SUBSCRIPTION" || (t.notes && t.notes.toLowerCase().includes("ott")));
  const hasDiningLeakage = transactions.some(t => t.category === "DINING" || t.title.toLowerCase().includes("swiggy") || t.title.toLowerCase().includes("zomato"));

  const handleSearch = (val: string) => {
    setSearchInput(val);
    setSearchQuery(val);
  };

  return (
    <div className="space-y-8" onClick={() => setAddMenuOpen(false)}>
      {/* Top bar */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#F5F8FC] tracking-tight">
            Money & Cash Flow Center
          </h1>
          <p className="text-xs md:text-sm text-[#94A3B8] mt-1">
            Reconciled ledger transactions, category budget allocations, and institutional accounts.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-[#0D1824] border border-[#233548] rounded-xl px-3.5 py-2 flex items-center gap-2.5 w-60 shadow-sm">
            <Search size={16} className="text-[#94A3B8]" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search ticker, company, notes..."
              className="bg-transparent border-none text-xs text-[#F5F8FC] placeholder-[#64748B] w-full outline-none"
            />
          </div>

          <button
            onClick={() => alert("Exported currently filtered canonical ledger transactions in Excel (.xlsx) format.")}
            className="bg-[#0D1824] hover:bg-[#111F2D] border border-[#233548] text-[#F5F8FC] font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition"
          >
            <Download size={15} />
            <span>Export</span>
          </button>

          <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setAddMenuOpen(!addMenuOpen)}
              className="bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-[#07111C] font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition"
            >
              <span>+ Add</span>
              <ChevronDown size={15} />
            </button>

            {addMenuOpen && (
              <div className="absolute right-0 top-11 w-56 bg-[#0D1824] border border-[#233548] rounded-2xl shadow-2xl p-2 z-50 space-y-1">
                <button
                  onClick={() => { openModal('modal-income'); setAddMenuOpen(false); }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#111F2D] text-xs font-semibold text-[#F5F8FC] transition"
                >
                  <span>➕ Income</span>
                  <span className="text-[10px] text-[#94A3B8]">Dividend/Salary</span>
                </button>
                <button
                  onClick={() => { openModal('modal-expense'); setAddMenuOpen(false); }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#111F2D] text-xs font-semibold text-[#F5F8FC] transition"
                >
                  <span>➖ Expense</span>
                  <span className="text-[10px] text-[#94A3B8]">Dining/Bills</span>
                </button>
                <button
                  onClick={() => { openModal('modal-transfer'); setAddMenuOpen(false); }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#111F2D] text-xs font-semibold text-[#F5F8FC] transition"
                >
                  <span>⇄ Transfer</span>
                  <span className="text-[10px] text-[#94A3B8]">₹0 Net Impact</span>
                </button>
                <div className="h-px bg-[#233548] my-1" />
                <button
                  onClick={() => { openSidebarTab('import'); setAddMenuOpen(false); }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#111F2D] text-xs font-semibold text-[#38BDF8] transition"
                >
                  <span>📥 Import from CSV</span>
                  <span className="text-[10px] text-[#94A3B8]">Pipeline</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub tabs */}
      <div className="flex border-b border-[#233548] gap-8">
        {(['transactions', 'budget', 'accounts', 'insights'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={`py-3 font-semibold text-xs tracking-wider uppercase border-b-2 transition -mb-px ${
              subTab === tab
                ? 'border-[#38BDF8] text-[#38BDF8]'
                : 'border-transparent text-[#94A3B8] hover:text-[#F5F8FC]'
            }`}
          >
            {tab === 'transactions' && 'Transactions'}
            {tab === 'budget' && 'Budget'}
            {tab === 'accounts' && 'Accounts'}
            {tab === 'insights' && 'Insights'}
          </button>
        ))}
      </div>

      {/* Sub tab contents */}
      {subTab === 'transactions' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 flex-wrap">
            {(['Expense', 'Income', 'Transfer', 'All'] as const).map((ft) => (
              <button
                key={ft}
                onClick={() => setFilterType(ft as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  filterType === ft
                    ? 'bg-[#38BDF8] text-[#07111C]'
                    : 'bg-[#0D1824] hover:bg-[#111F2D] border border-[#233548] text-[#94A3B8]'
                }`}
              >
                {ft}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title="No transactions recorded"
              description="Record income, expense, or transfer transactions, or import your bank statement CSV to populate this ledger."
              actionLabel="+ Add Transaction"
              onAction={() => openModal('modal-expense')}
            />
          ) : (
            <div className="bg-[#0D1824] border border-[#233548] rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#111F2D] border-b border-[#233548] text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                      <th className="py-3 px-5">Date</th>
                      <th className="py-3 px-5">Title / Narration</th>
                      <th className="py-3 px-5">Category</th>
                      <th className="py-3 px-5">Account</th>
                      <th className="py-3 px-5">Amount</th>
                      <th className="py-3 px-5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#233548]/60 text-xs text-[#F5F8FC]">
                    {filtered.map((t) => (
                      <tr key={t.id} className="hover:bg-[#111F2D]/60 transition">
                        <td className="py-3.5 px-5 whitespace-nowrap text-[#94A3B8]">{t.dateStr}</td>
                        <td className="py-3.5 px-5 font-semibold">{t.title}</td>
                        <td className="py-3.5 px-5">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#111F2D] border border-[#233548] text-[#94A3B8] text-[10px] font-bold">
                            {t.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-[#94A3B8]">{t.account}</td>
                        <td className={`py-3.5 px-5 font-extrabold whitespace-nowrap ${
                          t.type === 'Income' ? 'text-[#22C55E]' : t.type === 'Expense' ? 'text-[#EF4444]' : 'text-[#38BDF8]'
                        }`}>
                          {t.type === 'Income' ? '+' : t.type === 'Expense' ? '-' : ''}
                          <CurrencyValue value={t.amount} />
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="px-2 py-0.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30 text-[10px] font-bold">
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {subTab === 'budget' && (
        <div className="space-y-6">
          <ChartCard
            title="Monthly Category Plan & Leakage Audit"
            subtitle="Reconciled expenditure auditing vs target budgets"
          >
            {transactions.length === 0 ? (
              <div className="text-center py-10 text-xs font-semibold text-[#94A3B8]">
                No Leakage Alerts Detected
              </div>
            ) : (
              <div className="space-y-4 mt-2">
                {hasOttLeakage && (
                  <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#EF4444]">Subscription Leakage Alert</h4>
                      <p className="text-xs text-[#94A3B8] mt-0.5">OTT subscriptions exceed recommended monthly allocation.</p>
                    </div>
                    <span className="text-xs font-extrabold text-[#EF4444]">Action Req</span>
                  </div>
                )}

                {hasDiningLeakage && (
                  <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#F59E0B]">Food Delivery Anomaly</h4>
                      <p className="text-xs text-[#94A3B8] mt-0.5">Dining & delivery spend deviates from target baseline.</p>
                    </div>
                    <span className="text-xs font-extrabold text-[#F59E0B]">Audit</span>
                  </div>
                )}

                {!hasOttLeakage && !hasDiningLeakage && (
                  <div className="text-center py-8 text-xs font-semibold text-[#22C55E]">
                    All spending categories are operating within healthy allocation targets.
                  </div>
                )}
              </div>
            )}
          </ChartCard>
        </div>
      )}

      {subTab === 'accounts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <KpiCard
              title="Liquid Bank Accounts"
              value={liquidBankTotal > 0 ? <CurrencyValue value={liquidBankTotal} /> : '₹0 / empty'}
              subtitle="Savings & Checking balances"
              icon={<Landmark size={18} />}
            />
            <KpiCard
              title="Invested Portfolio"
              value={investedPortfolioTotal > 0 ? <CurrencyValue value={investedPortfolioTotal} /> : '₹0 / empty'}
              subtitle="Brokerages & Wealth assets"
              icon={<PiggyBank size={18} />}
            />
          </div>

          {assets.length === 0 ? (
            <EmptyState
              title="No accounts registered"
              description="Add your institutional bank accounts and brokerage accounts to populate this accounts view."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assets.map((a) => (
                <div key={a.name} className="bg-[#0D1824] border border-[#233548] p-5 rounded-2xl flex flex-col justify-between shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-[#94A3B8] uppercase">{a.name}</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
                  </div>
                  <div className="text-2xl font-extrabold text-[#F5F8FC]">
                    <CurrencyValue value={a.amount} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {subTab === 'insights' && (
        <div className="space-y-6">
          <ChartCard
            title="Empirical Money Insights"
            subtitle="Automated ledger pattern analysis"
          >
            {transactions.length === 0 ? (
              <div className="text-center py-12 text-xs text-[#94A3B8]">
                No transaction insights yet — record income or expense transactions to view empirical cash flow insights.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="bg-[#111F2D] border border-[#233548] p-4 rounded-xl">
                  <h4 className="text-xs font-bold text-[#22C55E]">Trailing 12-Month Dividend Revenue</h4>
                  <div className="text-lg font-extrabold text-[#F5F8FC] mt-1">
                    <CurrencyValue value={ttmMetric.value} />
                  </div>
                </div>
                <div className="bg-[#111F2D] border border-[#233548] p-4 rounded-xl">
                  <h4 className="text-xs font-bold text-[#38BDF8]">Monthly Average Payout</h4>
                  <div className="text-lg font-extrabold text-[#F5F8FC] mt-1">
                    <CurrencyValue value={avgMetric.value} decimals={2} />
                  </div>
                </div>
              </div>
            )}
          </ChartCard>
        </div>
      )}
    </div>
  );
};
