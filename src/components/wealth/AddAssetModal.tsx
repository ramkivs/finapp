import React, { useState } from 'react';
import { AssetType, GeographyType } from '../../domain/types';
import { useCanonicalLedger } from '../../store/useCanonicalLedger';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ASSET_CATEGORIES: Array<{ type: AssetType; desc: string }> = [
  { type: 'Equity', desc: 'Stocks, mutual funds & ETFs' },
  { type: 'Debt', desc: 'Bonds, FDs, PPF & liquid funds' },
  { type: 'Real Estate', desc: 'Physical properties & REITs' },
  { type: 'Commodities', desc: 'Gold, silver & sovereign bonds' },
  { type: 'Cash & Savings', desc: 'Checking, savings & wallets' },
  { type: 'Crypto', desc: 'Digital assets & tokens' },
  { type: 'Alternatives', desc: 'Private equity & venture' },
  { type: 'Other', desc: 'Other institutional assets' }
];

export const AddAssetModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState<AssetType>('Equity');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [tag, setTag] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [geography, setGeography] = useState<GeographyType>('India');

  const { addAssetWithMetadata } = useCanonicalLedger();

  if (!isOpen) return null;

  const handleSelectCategory = (type: AssetType) => {
    setSelectedType(type);
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;
    addAssetWithMetadata({
      name,
      amount: Number(amount),
      type: selectedType,
      tag: tag || undefined,
      currency: currency || 'INR',
      geography
    });
    setName('');
    setAmount('');
    setTag('');
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0D1824] border border-[#233548] rounded-2xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#233548]">
          <div>
            <h3 className="text-lg font-extrabold text-[#F5F8FC]">
              {step === 1 ? 'Step 1: Select Asset Category' : `Step 2: Add ${selectedType} Asset`}
            </h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              {step === 1 ? 'Choose an institutional asset class' : 'Enter asset valuation and metadata'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#111F2D] hover:bg-[#142333] border border-[#233548] flex items-center justify-center text-[#94A3B8] hover:text-[#F5F8FC] transition"
          >
            <X size={18} />
          </button>
        </div>

        {step === 1 ? (
          <div className="grid grid-cols-2 gap-3">
            {ASSET_CATEGORIES.map((cat) => (
              <button
                key={cat.type}
                onClick={() => handleSelectCategory(cat.type)}
                className="bg-[#111F2D] hover:bg-[#142333] border border-[#233548] hover:border-[#38BDF8] p-4 rounded-xl text-left transition flex flex-col justify-between h-24"
              >
                <span className="text-sm font-bold text-[#F5F8FC]">{cat.type}</span>
                <span className="text-[11px] text-[#94A3B8]">{cat.desc}</span>
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#94A3B8] mb-1">Asset Name *</label>
              <input
                type="text"
                placeholder="e.g. HDFC Savings, Zerodha Equity"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#111F2D] border border-[#233548] rounded-xl px-3.5 py-2.5 text-xs text-[#F5F8FC] outline-none focus:border-[#38BDF8]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#94A3B8] mb-1">Valuation (INR) *</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full bg-[#111F2D] border border-[#233548] rounded-xl px-3.5 py-2.5 text-xs text-[#F5F8FC] outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94A3B8] mb-1">Geography</label>
                <select
                  value={geography}
                  onChange={(e) => setGeography(e.target.value as GeographyType)}
                  className="w-full bg-[#111F2D] border border-[#233548] rounded-xl px-3.5 py-2.5 text-xs text-[#F5F8FC] outline-none focus:border-[#38BDF8]"
                >
                  <option value="India">India</option>
                  <option value="International">International</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#94A3B8] mb-1">Currency (Metadata)</label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-[#111F2D] border border-[#233548] rounded-xl px-3.5 py-2.5 text-xs text-[#F5F8FC] outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94A3B8] mb-1">Tag (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Core, High Growth"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full bg-[#111F2D] border border-[#233548] rounded-xl px-3.5 py-2.5 text-xs text-[#F5F8FC] outline-none focus:border-[#38BDF8]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#233548] mt-6">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#111F2D] hover:bg-[#142333] border border-[#233548] text-[#94A3B8] hover:text-[#F5F8FC] text-xs font-semibold transition"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-[#07111C] font-bold text-xs transition shadow-sm"
              >
                Save Asset
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
