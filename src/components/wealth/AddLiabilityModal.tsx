import React, { useState } from 'react';
import { LiabilityType } from '../../domain/types';
import { useCanonicalLedger } from '../../store/useCanonicalLedger';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const LOAN_CATEGORIES: Array<{ type: LiabilityType; desc: string }> = [
  { type: 'Home Loan', desc: 'Mortgages & home equity' },
  { type: 'Vehicle Loan', desc: 'Car & two-wheeler financing' },
  { type: 'Personal Loan', desc: 'Unsecured personal credit' },
  { type: 'Education Loan', desc: 'Student & tuition financing' },
  { type: 'Credit Card', desc: 'Revolving card balances' },
  { type: 'Gold Loan', desc: 'Pledged jewelry & bullion' },
  { type: 'Business Loan', desc: 'Working capital & equipment' },
  { type: 'Friends / Family', desc: 'Informal private borrowing' },
  { type: 'Other', desc: 'Other institutional debt' }
];

export const AddLiabilityModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState<LiabilityType>('Home Loan');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('INR');

  const { addLiabilityWithMetadata } = useCanonicalLedger();

  if (!isOpen) return null;

  const handleSelectCategory = (type: LiabilityType) => {
    setSelectedType(type);
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;
    addLiabilityWithMetadata({
      name,
      amount: Number(amount),
      type: selectedType,
      currency: currency || 'INR'
    });
    setName('');
    setAmount('');
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0D1824] border border-[#233548] rounded-2xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#233548]">
          <div>
            <h3 className="text-lg font-extrabold text-[#F5F8FC]">
              {step === 1 ? 'Step 1: Select Loan Type' : `Step 2: Add ${selectedType}`}
            </h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              {step === 1 ? 'Choose an institutional liability class' : 'Enter liability obligation and metadata'}
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
          <div className="grid grid-cols-3 gap-3">
            {LOAN_CATEGORIES.map((cat) => (
              <button
                key={cat.type}
                onClick={() => handleSelectCategory(cat.type)}
                className="bg-[#111F2D] hover:bg-[#142333] border border-[#233548] hover:border-[#EF4444] p-3 rounded-xl text-left transition flex flex-col justify-between h-24"
              >
                <span className="text-xs font-bold text-[#F5F8FC]">{cat.type}</span>
                <span className="text-[10px] text-[#94A3B8]">{cat.desc}</span>
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#94A3B8] mb-1">Liability Name *</label>
              <input
                type="text"
                placeholder="e.g. HDFC Mortgage, ICICI Credit Card"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#111F2D] border border-[#233548] rounded-xl px-3.5 py-2.5 text-xs text-[#F5F8FC] outline-none focus:border-[#EF4444]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#94A3B8] mb-1">Obligation (INR) *</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full bg-[#111F2D] border border-[#233548] rounded-xl px-3.5 py-2.5 text-xs text-[#F5F8FC] outline-none focus:border-[#EF4444]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94A3B8] mb-1">Currency (Metadata)</label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-[#111F2D] border border-[#233548] rounded-xl px-3.5 py-2.5 text-xs text-[#F5F8FC] outline-none focus:border-[#EF4444]"
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
                className="px-5 py-2 rounded-xl bg-[#EF4444] hover:bg-[#EF4444]/90 text-white font-bold text-xs transition shadow-sm"
              >
                Save Liability
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
