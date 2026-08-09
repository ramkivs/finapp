import React from 'react';
import { LayoutDashboard, TrendingUp, Wallet, ShieldCheck, Upload, Calculator, Sparkles, Settings, MessageSquare } from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'wealth', label: 'Wealth', icon: TrendingUp },
    { id: 'money', label: 'Money', icon: Wallet },
    { id: 'essentials', label: 'Essentials', icon: ShieldCheck },
  ];

  const toolItems = [
    { id: 'import', label: 'Import', icon: Upload },
    { id: 'calculators', label: 'Calculators', icon: Calculator },
  ];

  return (
    <aside className="w-[240px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen sticky top-0 flex-shrink-0 z-40">
      <div className="p-6 font-serif text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        FinBoom
      </div>

      <nav className="px-3 py-2 flex-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition mb-1 ${
                active
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-4 pt-5 pb-2">
          TOOLS
        </div>

        {toolItems.map(item => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition mb-1 ${
                active
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <button
          onClick={() => alert('What\'s New (v2.1.7): React 18 Production Build with 100% Zero-Literal Temporal Authority.')}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition mb-1"
        >
          <Sparkles size={19} />
          <span>What's New</span>
        </button>

        <button
          onClick={() => alert('Settings: Global privacy persistence enabled in localStorage (finapp.privacy.masked).')}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition mb-1"
        >
          <Settings size={19} />
          <span>Settings</span>
        </button>
      </nav>

      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={() => alert('Feedback: Thank you! We read every suggestion from our community.')}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <MessageSquare size={19} />
          <span>Feedback</span>
        </button>
      </div>
    </aside>
  );
};
