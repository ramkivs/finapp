import React, { useState } from 'react';
import { useCanonicalLedger } from '../store/useCanonicalLedger';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IncomeModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [ticker, setTicker] = useState('ITC Limited');
  const [amount, setAmount] = useState(2100);
  const [account, setAccount] = useState('HDFC Bank (...4921)');
  const [type, setType] = useState('DIVIDEND');
  const [notes, setNotes] = useState('Quarterly Interim Dividend');

  const addIncome = useCanonicalLedger(s => s.addIncome);

  if (!isOpen) return null;

  const handleSave = () => {
    addIncome(ticker, Number(amount), account, type, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">+ Add Income (Canonical Ledger)</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Income Type</label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium"
            >
              <option value="DIVIDEND">Dividend (Realized Cash Credit)</option>
              <option value="SALARY">Salary</option>
              <option value="BONUS">Bonus / Interest</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Security / Company Ticker</label>
            <input
              type="text"
              value={ticker}
              onChange={e => setTicker(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Credited Bank Account</label>
            <select
              value={account}
              onChange={e => setAccount(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
            >
              <option value="HDFC Bank (...4921)">HDFC Bank (...4921)</option>
              <option value="SBI Bank (...1209)">SBI Bank (...1209)</option>
              <option value="ICICI Bank (...8834)">ICICI Bank (...8834)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Notes / Provenance</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
            />
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-bold shadow-sm"
          >
            Save to Canonical Ledger
          </button>
        </div>
      </div>
    </div>
  );
};

export const ExpenseModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('Swiggy Food Delivery');
  const [amount, setAmount] = useState(1450);
  const [category, setCategory] = useState('DINING');

  const addExpense = useCanonicalLedger(s => s.addExpense);

  if (!isOpen) return null;

  const handleSave = () => {
    addExpense(title, Number(amount), 'HDFC Bank (...4921)', category);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">- Add Expense</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Merchant / Description</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium"
            >
              <option value="DINING">Dining & Food</option>
              <option value="SUBSCRIPTION">Subscriptions & OTT</option>
              <option value="HOUSING">Housing & Rent EMIs</option>
            </select>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-bold shadow-sm"
          >
            Save Expense
          </button>
        </div>
      </div>
    </div>
  );
};

export const TransferModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [source, setSource] = useState('HDFC Bank (...4921)');
  const [dest, setDest] = useState('Zerodha Trading Account');
  const [amount, setAmount] = useState(50000);

  const addTransfer = useCanonicalLedger(s => s.addTransfer);

  if (!isOpen) return null;

  const handleSave = () => {
    addTransfer(source, dest, Number(amount));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">⇄ Add Bank-to-Bank Transfer (₹0 Impact)</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Source Account (Debit)</label>
            <select
              value={source}
              onChange={e => setSource(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
            >
              <option value="HDFC Bank (...4921)">HDFC Bank (...4921)</option>
              <option value="SBI Bank (...1209)">SBI Bank (...1209)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Destination Account (Credit)</label>
            <select
              value={dest}
              onChange={e => setDest(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
            >
              <option value="Zerodha Trading Account">Zerodha Trading Account</option>
              <option value="ICICI Bank (...8834)">ICICI Bank (...8834)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
            />
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-bold shadow-sm"
          >
            Record Transfer (₹0 Net Impact)
          </button>
        </div>
      </div>
    </div>
  );
};
