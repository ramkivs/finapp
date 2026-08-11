import React from 'react';
import { queries } from '../application';
import { KpiCard } from '../components/dashboard/KpiCard';
import { ChartCard } from '../components/dashboard/ChartCard';
import { Percent, ArrowUpRight, ShieldCheck } from 'lucide-react';

export const CalculatorsPage: React.FC = () => {
  const yieldMetric = queries.getMetric('DIVIDEND_YIELD_TTM');
  const cagrMetric = queries.getMetric('NET_WORTH_CAGR');
  const goalMetric = queries.getMetric('EMERGENCY_FUND_GOAL');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#F5F8FC] tracking-tight">
          Financial Calculators
        </h1>
        <p className="text-xs md:text-sm text-[#94A3B8] mt-1">
          Dividend Yield on Invested Capital, Net Worth CAGR, and Emergency EMI Target Planner.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard
          title="Dividend Yield Calculator"
          value={yieldMetric.status === 'NOT_CONFIGURED' ? 'Not configured' : `${yieldMetric.value}%`}
          subtitle="TTM Yield on Invested Capital"
          status={yieldMetric.status}
          icon={<Percent size={18} />}
        />

        <KpiCard
          title="Net Worth CAGR"
          value={cagrMetric.status === 'NOT_CONFIGURED' ? 'Not configured' : `+${cagrMetric.value}%`}
          subtitle="1-Year Compound Growth"
          status={cagrMetric.status}
          icon={<ArrowUpRight size={18} />}
        />

        <KpiCard
          title="Emergency Fund Goal"
          value={goalMetric.status === 'NOT_CONFIGURED' ? 'Not configured' : goalMetric.value}
          subtitle="Requires Target EMI Schedule"
          status={goalMetric.status}
          icon={<ShieldCheck size={18} />}
        />
      </div>

      <ChartCard
        title="Authoritative Calculation Methodology"
        subtitle="100% browser-based financial mathematics — nothing leaves your device"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          <div className="bg-[#111F2D] border border-[#233548] p-4 rounded-xl">
            <h4 className="text-xs font-bold text-[#38BDF8]">Dividend Yield on Invested Capital</h4>
            <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
              Calculates trailing 12-month realized dividend income divided by the total valuation of registered brokerage and wealth investment accounts.
            </p>
          </div>

          <div className="bg-[#111F2D] border border-[#233548] p-4 rounded-xl">
            <h4 className="text-xs font-bold text-[#38BDF8]">Net Worth 1-Year CAGR</h4>
            <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
              Computes annualized compound growth rate between canonical historical net worth snapshots: (EndingNetWorth / BeginningNetWorth) ^ (1 / years) - 1.
            </p>
          </div>

          <div className="bg-[#111F2D] border border-[#233548] p-4 rounded-xl">
            <h4 className="text-xs font-bold text-[#38BDF8]">Emergency Fund Goal Target</h4>
            <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
              Evaluates target 6-month liquid cash runway against essential monthly debt service and recurring expenditure commitments.
            </p>
          </div>
        </div>
      </ChartCard>
    </div>
  );
};
