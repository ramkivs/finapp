import React from 'react';
import { useCanonicalLedger } from '../store/useCanonicalLedger';
import { Moon, Eye, EyeOff, Bell } from 'lucide-react';

interface Props {
  toggleDark: () => void;
  isDark: boolean;
}

export const Header: React.FC<Props> = ({ toggleDark, isDark }) => {
  const { privacyMasked, togglePrivacy } = useCanonicalLedger();

  return (
    <header className="h-[64px] bg-[#07111C] border-b border-[#233548] flex items-center justify-between px-8 sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#111F2D] border border-[#233548] text-[#38BDF8]">
          LOCAL-FIRST INDEXEDDB
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleDark}
          className="w-[38px] h-[38px] rounded-xl bg-[#0D1824] hover:bg-[#111F2D] border border-[#233548] flex items-center justify-center text-[#94A3B8] hover:text-[#F5F8FC] transition shadow-sm"
          title="Toggle Light / Dark Mode"
        >
          <Moon size={18} />
        </button>

        <button
          onClick={togglePrivacy}
          className="w-[38px] h-[38px] rounded-xl bg-[#0D1824] hover:bg-[#111F2D] border border-[#233548] flex items-center justify-center text-[#94A3B8] hover:text-[#F5F8FC] transition shadow-sm"
          title="Mask / Unmask Balances (Persistent)"
        >
          {privacyMasked ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>

        <button
          onClick={() => alert('1 New Alert: August Dividend from ITC Ltd (₹2,100) credited to HDFC Bank (...4921).')}
          className="w-[38px] h-[38px] rounded-xl bg-[#0D1824] hover:bg-[#111F2D] border border-[#233548] flex items-center justify-center text-[#94A3B8] hover:text-[#F5F8FC] transition shadow-sm relative"
          title="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#38BDF8]" />
        </button>

        <div
          onClick={() => alert('Profile: Ramakrishnan VS (Pro Member) • React Production Architecture Active')}
          className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#0D1824] hover:bg-[#111F2D] border border-[#233548] cursor-pointer transition shadow-sm"
          title="User Profile"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#38BDF8] to-[#8B5CF6] flex items-center justify-center text-white font-bold text-xs">
            R
          </div>
          <span className="text-xs font-semibold text-[#F5F8FC] hidden sm:inline">
            Ramakrishnan VS
          </span>
        </div>
      </div>
    </header>
  );
};
