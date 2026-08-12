import React, { useState } from 'react';
import { Asset } from '../../domain/types';
import { CurrencyValue } from '../CurrencyValue';
import { queries } from '../../application';
import { PieChart, Globe, Repeat } from 'lucide-react';

interface Props {
  assets: Asset[];
}

export const AllocationWorkspace: React.FC<Props> = ({ assets }) => {
  const [allocTab, setAllocTab] = useState<'class' | 'geography' | 'sip'>('class');

  const totAssets = assets.reduce((sum, a) => sum + a.amount, 0);
  const sipMetric = queries.getMetric('SIP_COMMITMENT_MONTHLY');

  // Derive actual class allocation from canonical assets
  const classBreakdown = assets.reduce<Record<string, number>>((acc, a) => {
    const key = a.type || 'Other';
    acc[key] = (acc[key] || 0) + a.amount;
    return acc;
  }, {});

  // Derive actual geography exposure strictly from explicit geography metadata (not currency)
  const geoBreakdown = assets.reduce<Record<string, number>>((acc, a) => {
    const key = a.geography || 'India';
    acc[key] = (acc[key] || 0) + a.amount;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex border-b border-[#233548] gap-8">
        {(['class', 'geography', 'sip'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setAllocTab(tab)}
            className={`py-3 font-semibold text-xs tracking-wider uppercase border-b-2 transition -mb-px flex items-center gap-2 ${
              allocTab === tab
                ? 'border-[#38BDF8] text-[#38BDF8]'
                : 'border-transparent text-[#94A3B8] hover:text-[#F5F8FC]'
            }`}
          >
            {tab === 'class' && (
              <>
                <PieChart size={15} />
                <span>Asset Allocation</span>
              </>
            )}
            {tab === 'geography' && (
              <>
                <Globe size={15} />
                <span>Geography</span>
              </>
            )}
            {tab === 'sip' && (
              <>
                <Repeat size={15} />
                <span>Monthly SIP Plan</span>
              </>
            )}
          </button>
        ))}
      </div>

 {assets.length === 0 ? (
  <div className="border rounded-xl p-8 text-center">
    <div className="text-sm font-semibold">No assets recorded</div>
    <div className="text-xs text-gray-500 mt-2">
      Add assets to inspect asset allocation and geography exposure.
    </div>
  </div>
) : allocTab === 'class' ? (
        <div className="space-y-6">
          <div className="bg-[#0D1824] border border-[#233548] p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-extrabold text-[#F5F8FC]">Target Allocation (Presentation Reference Default)</h4>
                <p className="text-xs text-[#94A3B8] mt-0.5">Recommended balanced portfolio exposure reference</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#111F2D] border border-[#233548] text-[#94A3B8] text-[10px] font-bold">
                Default Reference
              </span>
            </div>
            <div className="h-4 w-full bg-[#111F2D] rounded-full overflow-hidden flex border border-[#233548]">
              <div style={{ width: '55%' }} className="bg-[#38BDF8] h-full" title="Equity: 55%" />
              <div style={{ width: '20%' }} className="bg-[#22C55E] h-full" title="Debt: 20%" />
              <div style={{ width: '10%' }} className="bg-[#8B5CF6] h-full" title="Real Estate: 10%" />
              <div style={{ width: '10%' }} className="bg-[#F59E0B] h-full" title="Commodities: 10%" />
              <div style={{ width: '5%' }} className="bg-[#64748B] h-full" title="Cash: 5%" />
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-[#94A3B8] mt-3 font-semibold">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />Equity 55%</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />Debt 20%</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />Real Estate 10%</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />Commodities 10%</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#64748B]" />Cash 5%</span>
            </div>
          </div>

          <div className="bg-[#0D1824] border border-[#233548] p-6 rounded-2xl shadow-sm">
            <h4 className="text-sm font-extrabold text-[#F5F8FC] mb-4">Actual Canonical Portfolio Allocation</h4>
            <div className="space-y-3">
              {Object.entries(classBreakdown).map(([cls, amt]) => {
                const pct = totAssets > 0 ? Math.round((amt / totAssets) * 100) : 0;
                return (
                  <div key={cls} className="bg-[#111F2D] border border-[#233548] p-4 rounded-xl flex items-center justify-between">
                    <span className="text-sm font-bold text-[#F5F8FC]">{cls}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-[#94A3B8]">{pct}%</span>
                      <span className="text-sm font-extrabold text-[#22C55E]">
                        <CurrencyValue value={amt} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : allocTab === 'geography' ? (
        <div className="bg-[#0D1824] border border-[#233548] p-6 rounded-2xl shadow-sm">
          <h4 className="text-sm font-extrabold text-[#F5F8FC] mb-2">Explicit Geography Exposure</h4>
          <p className="text-xs text-[#94A3B8] mb-6">Derived strictly from explicit geography metadata on canonical assets (no currency inference)</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['India', 'International', 'Other'].map((geo) => {
              const amt = geoBreakdown[geo] || 0;
              const pct = totAssets > 0 ? Math.round((amt / totAssets) * 100) : 0;
              return (
                <div key={geo} className="bg-[#111F2D] border border-[#233548] p-5 rounded-xl flex flex-col justify-between">
                  <span className="text-xs font-bold text-[#94A3B8] uppercase">{geo}</span>
                  <div className="mt-4">
                    <div className="text-2xl font-extrabold text-[#F5F8FC]">
                      <CurrencyValue value={amt} />
                    </div>
                    <span className="text-xs font-bold text-[#38BDF8] mt-1 block">{pct}% of total valuation</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-[#0D1824] border border-[#233548] p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-extrabold text-[#F5F8FC]">Monthly SIP Commitment Plan</h4>
              <p className="text-xs text-[#94A3B8] mt-0.5">Systematic monthly investment contributions from canonical registry</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30 text-xs font-bold">
              {sipMetric.status}
            </span>
          </div>

          <div className="bg-[#111F2D] border border-[#233548] p-6 rounded-xl flex items-center justify-between">
            <span className="text-sm font-bold text-[#F5F8FC]">Total Monthly SIP Commitment</span>
            <span className="text-2xl font-extrabold text-[#22C55E]">
              {sipMetric.status === 'NOT_CONFIGURED' ? 'Not configured' : <CurrencyValue value={sipMetric.value} />}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
