import React, { useState } from 'react';
import { Asset, AssetType, GeographyType } from '../../domain/types';
import { AssetTable } from './AssetTable';
import { AddAssetModal } from './AddAssetModal';
import { CurrencyValue } from '../CurrencyValue';
import { Plus, Search } from 'lucide-react';

interface Props {
  assets: Asset[];
}

export const AssetsWorkspace: React.FC<Props> = ({ assets }) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | AssetType>('All');
  const [geoFilter, setGeoFilter] = useState<'All' | GeographyType>('All');
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = assets.filter(a => {
    if (typeFilter !== 'All' && a.type !== typeFilter) return false;
    if (geoFilter !== 'All' && a.geography !== geoFilter && !(geoFilter === 'India' && !a.geography)) return false;
    if (search) {
      const text = `${a.name} ${a.tag || ''} ${a.type || ''} ${a.currency || ''}`.toLowerCase();
      if (!text.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  const totVal = filtered.reduce((sum, a) => sum + a.amount, 0);

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 flex items-center gap-2 w-64">
            <Search size={15} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search asset name, tag, currency..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none text-xs text-gray-900 dark:text-white placeholder-gray-400 w-full outline-none"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white outline-none"
          >
            <option value="All">All Categories (8)</option>
            <option value="Equity">Equity</option>
            <option value="Debt">Debt</option>
            <option value="Real Estate">Real Estate</option>
            <option value="Commodities">Commodities</option>
            <option value="Cash & Savings">Cash & Savings</option>
            <option value="Crypto">Crypto</option>
            <option value="Alternatives">Alternatives</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={geoFilter}
            onChange={(e) => setGeoFilter(e.target.value as any)}
            className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white outline-none"
          >
            <option value="All">All Geographies</option>
            <option value="India">India (Domestic)</option>
            <option value="International">International</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-bold block uppercase">Total Valuation</span>
            <span className="text-base font-extrabold text-green-700 dark:text-green-400">
              <CurrencyValue value={totVal} />
            </span>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold text-xs transition shadow-sm"
          >
            <Plus size={15} />
            <span>Add Asset</span>
          </button>
        </div>
      </div>

      {assets.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center shadow-sm">
          <div className="text-base font-bold text-gray-900 dark:text-white">No assets added</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">
            Add an asset to build your wealth inventory. Track equities, real estate, fixed income, gold, and more.
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="mt-5 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white text-xs font-bold transition shadow-sm"
          >
            <Plus size={14} />
            <span>Add Asset</span>
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center text-xs text-gray-500 dark:text-gray-400 shadow-sm">
          No assets match your selected category or search filter.
        </div>
      ) : (
        <AssetTable assets={filtered} />
      )}

      <AddAssetModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};
