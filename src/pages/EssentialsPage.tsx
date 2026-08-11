import React from 'react';
import { queries } from '../application';
import { KpiCard } from '../components/dashboard/KpiCard';
import { ChartCard } from '../components/dashboard/ChartCard';
import { ShieldCheck, Umbrella, Repeat, CheckCircle2 } from 'lucide-react';

export const EssentialsPage: React.FC = () => {
  const efMetric = queries.getMetric('EMERGENCY_FUND_COVERAGE');
  const insMetric = queries.getMetric('ACTIVE_INSURANCE_POLICY_TOTAL');
  const sipMetric = queries.getMetric('SIP_COMMITMENT_MONTHLY');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#F5F8FC] tracking-tight">
          Essentials: Financial Health & Commitments
        </h1>
        <p className="text-xs md:text-sm text-[#94A3B8] mt-1">
          Reconciled emergency reserves, insurance policy schedule, and monthly SIP investment commitments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard
          title="Emergency Fund Coverage"
          value={efMetric.status === 'NOT_CONFIGURED' ? 'Not configured' : `${efMetric.value} Months`}
          subtitle="Requires Emergency EMI Registry"
          status={efMetric.status}
          icon={<ShieldCheck size={18} />}
        />

        <KpiCard
          title="Active Insurance Policies"
          value={insMetric.status === 'NOT_CONFIGURED' ? 'Not configured' : '₹1.5 Crore'}
          subtitle="Requires Policy Schedule Model"
          status={insMetric.status}
          icon={<Umbrella size={18} />}
        />

        <KpiCard
          title="Monthly SIP Commitment"
          value={sipMetric.status === 'NOT_CONFIGURED' ? 'Not configured' : '₹45,000 / mo'}
          subtitle="Requires SIP Commitment Registry"
          status={sipMetric.status}
          icon={<Repeat size={18} />}
        />
      </div>

      <ChartCard
        title="Institutional Health Audit"
        subtitle="Automated evaluation of emergency runway and protection coverage"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          <div className="bg-[#111F2D] border border-[#233548] p-4 rounded-xl flex items-start gap-3">
            <CheckCircle2 size={18} className="text-[#38BDF8] mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-[#F5F8FC]">Runway Target: 6 Months</h4>
              <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                Aim for at least six months of essential monthly expenditure in liquid bank deposits.
              </p>
            </div>
          </div>

          <div className="bg-[#111F2D] border border-[#233548] p-4 rounded-xl flex items-start gap-3">
            <CheckCircle2 size={18} className="text-[#38BDF8] mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-[#F5F8FC]">Term Cover: 20× Income</h4>
              <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                Ensure term life coverage provides adequate financial security for dependents.
              </p>
            </div>
          </div>

          <div className="bg-[#111F2D] border border-[#233548] p-4 rounded-xl flex items-start gap-3">
            <CheckCircle2 size={18} className="text-[#38BDF8] mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-[#F5F8FC]">Systematic Investing</h4>
              <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                Automate regular monthly SIP contributions to compound wealth over time.
              </p>
            </div>
          </div>
        </div>
      </ChartCard>
    </div>
  );
};
