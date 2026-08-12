import React from 'react';
import { useCanonicalLedger } from '../store/useCanonicalLedger';
import { FinancialMetricService } from '../services/FinancialMetricService';
import { CurrencyValue } from '../components/CurrencyValue';
import { KpiCard } from '../components/dashboard/KpiCard';
import { ChartCard } from '../components/dashboard/ChartCard';
import { EmptyState } from '../components/common/EmptyState';
import { TrendingUp, BarChart2, Calendar } from 'lucide-react';

export const WealthPage: React.FC = () => {
  const { transactions, assets, liabilities } = useCanonicalLedger();

  const ttmMetric = FinancialMetricService.getMetric('TTM_REALIZED_DIVIDEND', transactions, assets, liabilities);
  const avgMetric = FinancialMetricService.getMetric('MONTHLY_AVERAGE_DIVIDEND', transactions, assets, liabilities);
  const mtdMetric = FinancialMetricService.getMetric('MTD_REALIZED_DIVIDEND', transactions, assets, liabilities);
  const histogramSeries = FinancialMetricService.getSeries('MONTHLY_DIVIDEND_HISTOGRAM', transactions);

  const buckets = histogramSeries?.points || [];
  const maxAmt = Math.max(...buckets.map(b => b.amount), 100);

  const isEmpty = transactions.length === 0 && assets.length === 0 && liabilities.length === 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#F5F8FC] tracking-tight">
          Wealth & Dividend Cash Flow
        </h1>
        <p className="text-xs md:text-sm text-[#94A3B8] mt-1">
          Reconciled trailing 12-month dividend income, monthly averages, and cash flow histogram.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard
          title="12-Month Total Dividend"
          value={<CurrencyValue value={ttmMetric.value} />}
          subtitle="Option A Reconciled Authority"
          status={ttmMetric.status}
          icon={<TrendingUp size={18} />}
        />

        <KpiCard
          title="Monthly Average"
          value={<CurrencyValue value={avgMetric.value} decimals={2} />}
          subtitle="12M Total / 12 Months"
          status={avgMetric.status}
          icon={<BarChart2 size={18} />}
        />

        <KpiCard
          title="Ongoing Month (MTD)"
          value={<CurrencyValue value={mtdMetric.value} />}
          subtitle="Current Month Payouts"
          status={mtdMetric.status}
          icon={<Calendar size={18} />}
        />
      </div>

      {isEmpty ? (
        <EmptyState
          title="No dividend transactions yet"
          description="Record dividend transactions or load canonical demo data to visualize your 12-month cash flow histogram."
        />
      ) : (
        <ChartCard
          title="Month-by-Month Reconciled 12M Dividend Cash Flow"
          subtitle="Reconciled ledger cash flow across trailing 12 months"
        >
          <div className="h-[260px] flex items-end gap-3 pb-4 border-b border-[#233548] mt-4">
            {buckets.map((b) => {
              const heightPct = Math.round((b.amount / maxAmt) * 100);
              return (
                <div key={b.month} className="flex-1 flex flex-col items-center h-full justify-end">
                  <div
                    title={`${b.month}: ₹${b.amount.toLocaleString()} (${b.payoutCount} payouts)`}
                    style={{ height: `${Math.max(heightPct, 4)}%` }}
                    className={`w-full rounded-t-lg transition-all ${
                      b.amount === maxAmt
                        ? 'bg-[#38BDF8]'
                        : b.isMtd
                        ? 'bg-[#F59E0B] border-2 border-dashed border-[#F5F8FC]'
                        : 'bg-[#22C55E]'
                    }`}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-[#94A3B8] mt-3 font-medium">
            {buckets.map(b => (
              <span key={b.month}>{b.month}</span>
            ))}
          </div>
        </ChartCard>
      )}
    </div>
  );
};
