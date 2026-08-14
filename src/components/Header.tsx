import React, { useState } from 'react';
import { useCanonicalLedger } from '../store/useCanonicalLedger';
import { Moon, Sun, Eye, EyeOff, Bell, Menu, ChevronDown, Calendar, Wallet } from 'lucide-react';

interface Props {
  toggleDark: () => void;
  isDark: boolean;
  onOpenMobile?: () => void;
}

export const Header: React.FC<Props> = ({ toggleDark, isDark, onOpenMobile }) => {
  const { privacyMasked, togglePrivacy, dateRange, setDateRange, accounts } = useCanonicalLedger();
  const [showDateMenu, setShowDateMenu] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const ranges = ['This Month', 'Last Month', '3M', '6M', '12M', 'YTD'];

  return (
    <header className="h-16 bg-white dark:bg-[#161B22] border-b border-gray-200 dark:border-[#21262D] flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 transition-colors duration-150">
      {/* Left Area: Mobile Hamburger Menu & Active Scope Indicators */}
      <div className="flex items-center gap-3">
        {onOpenMobile && (
          <button
            id="btn-mobile-menu-toggle"
            onClick={onOpenMobile}
            className="md:hidden p-2 rounded-xl text-gray-500 dark:text-[#8B949E] hover:bg-gray-100 dark:hover:bg-[#21262D] transition cursor-pointer"
            title="Open Menu"
          >
            <Menu size={20} />
          </button>
        )}

        {/* Account Context Pill */}
        <div className="relative hidden sm:inline-block">
          <button
            id="btn-account-context-dropdown"
            onClick={() => { setShowAccountMenu(!showAccountMenu); setShowDateMenu(false); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-[#0D1117] border border-gray-200 dark:border-[#21262D] text-xs font-bold text-gray-700 dark:text-[#F0F6FC] hover:border-gray-300 dark:hover:border-[#30363D] transition cursor-pointer"
          >
            <Wallet size={13} className="text-[#4F8CFF]" />
            <span>All Accounts</span>
            <span className="text-[10px] text-gray-400 font-mono">({accounts.length})</span>
            <ChevronDown size={12} className="text-gray-400" />
          </button>

          {showAccountMenu && (
            <div className="absolute left-0 top-10 w-52 bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#21262D] rounded-2xl shadow-2xl p-1.5 z-50 text-xs">
              <button
                onClick={() => setShowAccountMenu(false)}
                className="w-full text-left px-3 py-2 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold cursor-pointer"
              >
                All Accounts ({accounts.length})
              </button>
              {accounts.map(a => (
                <button
                  key={a.id}
                  onClick={() => setShowAccountMenu(false)}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#21262D] text-gray-700 dark:text-gray-300 font-medium truncate cursor-pointer"
                >
                  {a.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Global Date Range Context */}
        <div className="relative hidden sm:inline-block">
          <button
            id="btn-global-date-range-dropdown"
            onClick={() => { setShowDateMenu(!showDateMenu); setShowAccountMenu(false); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-[#0D1117] border border-gray-200 dark:border-[#21262D] text-xs font-bold text-gray-700 dark:text-[#F0F6FC] hover:border-gray-300 dark:hover:border-[#30363D] transition cursor-pointer"
          >
            <Calendar size={13} className="text-[#23C55E]" />
            <span>{dateRange}</span>
            <ChevronDown size={12} className="text-gray-400" />
          </button>

          {showDateMenu && (
            <div className="absolute left-0 top-10 w-44 bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#21262D] rounded-2xl shadow-2xl p-1.5 z-50 text-xs">
              {ranges.map(r => (
                <button
                  key={r}
                  onClick={() => { setDateRange(r); setShowDateMenu(false); }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                    dateRange === r
                      ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'hover:bg-gray-100 dark:hover:bg-[#21262D] text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Area: Utility Toggles & Profile Pill */}
      <div className="flex items-center gap-2.5">
        {/* Dark/Light Mode */}
        <button
          id="btn-theme-toggle"
          onClick={toggleDark}
          className="w-9 h-9 rounded-xl hover:bg-gray-100 dark:hover:bg-[#21262D] border border-transparent hover:border-gray-200 dark:hover:border-[#21262D] flex items-center justify-center text-gray-500 dark:text-[#8B949E] hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
          title="Toggle Light / Dark Theme"
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Privacy Balance Masking */}
        <button
          id="btn-privacy-toggle"
          onClick={togglePrivacy}
          className="w-9 h-9 rounded-xl hover:bg-gray-100 dark:hover:bg-[#21262D] border border-transparent hover:border-gray-200 dark:hover:border-[#21262D] flex items-center justify-center text-gray-500 dark:text-[#8B949E] hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
          title="Mask / Unmask Financial Figures (Persistent)"
        >
          {privacyMasked ? <EyeOff size={17} className="text-[#F59E0B]" /> : <Eye size={17} />}
        </button>

        {/* Notification Bell */}
        <button
          id="btn-notifications"
          onClick={() => alert('Notification: August Dividend from ITC Ltd (₹2,100) reconciled into canonical ledger.')}
          className="w-9 h-9 rounded-xl hover:bg-gray-100 dark:hover:bg-[#21262D] border border-transparent hover:border-gray-200 dark:hover:border-[#21262D] flex items-center justify-center text-gray-500 dark:text-[#8B949E] hover:text-gray-900 dark:hover:text-white transition relative cursor-pointer"
          title="Notifications"
        >
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-[#EF4444] text-white text-[9px] font-bold flex items-center justify-center">
            1
          </span>
        </button>

        {/* User Profile Badge */}
        <div
          id="btn-user-profile"
          onClick={() => alert('Profile: Ramakrishnan VS (Pro Member) • FinBoom v3.0 Production Active')}
          className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-gray-100 dark:bg-[#0D1117] border border-gray-200 dark:border-[#21262D] cursor-pointer hover:border-gray-300 dark:hover:border-[#30363D] transition"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#4F8CFF] to-[#06B6D4] text-white font-bold text-[11px] flex items-center justify-center shadow-sm">
            R
          </div>
          <span className="text-xs font-bold text-gray-800 dark:text-[#F0F6FC] hidden md:inline">
            Ramakrishnan VS
          </span>
        </div>
      </div>
    </header>
  );
};
