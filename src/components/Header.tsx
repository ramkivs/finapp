import React from 'react';
import { useCanonicalLedger } from '../store/useCanonicalLedger';
import { Moon, Eye, EyeOff, Bell, User } from 'lucide-react';

interface Props {
  toggleDark: () => void;
  isDark: boolean;
}

export const Header: React.FC<Props> = ({ toggleDark, isDark }) => {
  const { privacyMasked, togglePrivacy } = useCanonicalLedger();

  return (
    <header className="h-[60px] bg-[#faf9f5] dark:bg-[#0b0f19] border-b border-gray-200 dark:border-gray-800 flex items-center justify-end px-8 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleDark}
          className="w-[38px] h-[38px] rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 transition"
          title="Toggle Light / Dark Mode"
        >
          <Moon size={18} />
        </button>

        <button
          onClick={togglePrivacy}
          className="w-[38px] h-[38px] rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 transition"
          title="Mask / Unmask Balances (Persistent)"
        >
          {privacyMasked ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>

        <button
          onClick={() => alert('1 New Alert: August Dividend from ITC Ltd (₹2,100) credited to HDFC Bank (...4921).')}
          className="w-[38px] h-[38px] rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 transition relative"
          title="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
            1
          </span>
        </button>

        <div
          onClick={() => alert('Profile: Ramakrishnan VS (Pro Member) • React Production Architecture v2.1.7 Active')}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          <div className="w-7 h-7 rounded-full bg-cyan-600 text-white font-bold text-xs flex items-center justify-center">
            R
          </div>
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Ramakrishnan VS</span>
        </div>
      </div>
    </header>
  );
};
