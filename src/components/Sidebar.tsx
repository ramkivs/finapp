import React from 'react';
import { LayoutDashboard, TrendingUp, Wallet, ShieldCheck, Upload, Calculator, Database, Trash2 } from 'lucide-react';
import { FinancialCommands } from '../application/commands';

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

  const handleLoadDemo = async () => {
    await FinancialCommands.loadDemoData();
    alert('Demo dataset loaded successfully into canonical runtime and IndexedDB storage!');
  };

  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to clear all local financial data? This will clear transactions, assets, liabilities, snapshots, and import metadata.')) {
      await FinancialCommands.clearLocalDevelopmentData();
      alert('All local financial data cleared! Empty state persisted across browser reload.');
    }
  };

  return (
    <aside className="w-[240px] bg-[#07111C] border-r border-[#233548] flex flex-col h-screen sticky top-0 flex-shrink-0 z-40 text-[#F5F8FC]">
      <div className="p-6 flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#38BDF8] to-[#8B5CF6] flex items-center justify-center font-black text-[#07111C] text-lg shadow-sm">
          F
        </div>
        <div className="font-sans text-xl font-extrabold tracking-tight text-[#F5F8FC]">
          FINBOOM
        </div>
      </div>

      <nav className="px-3 py-2 flex-1 overflow-y-auto space-y-6">
        <div>
          <div className="px-3 text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2">
            Command Center
          </div>
          <div className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    active
                      ? 'bg-[#38BDF8] text-[#07111C] shadow-sm'
                      : 'text-[#94A3B8] hover:bg-[#0D1824] hover:text-[#F5F8FC]'
                  }`}
                >
                  <Icon size={18} className={active ? 'text-[#07111C]' : 'text-[#94A3B8]'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="px-3 text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2">
            Tools & Ingestion
          </div>
          <div className="space-y-1">
            {toolItems.map(item => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    active
                      ? 'bg-[#38BDF8] text-[#07111C] shadow-sm'
                      : 'text-[#94A3B8] hover:bg-[#0D1824] hover:text-[#F5F8FC]'
                  }`}
                >
                  <Icon size={18} className={active ? 'text-[#07111C]' : 'text-[#94A3B8]'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-[#233548] space-y-2 bg-[#0D1824]/50">
        <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1 px-1">
          Data Management
        </div>

        <button
          onClick={handleLoadDemo}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-[#111F2D] hover:bg-[#142333] border border-[#233548] text-[#94A3B8] hover:text-[#F5F8FC] transition"
        >
          <Database size={15} className="text-[#38BDF8]" />
          <span>Load Demo Data</span>
        </button>

        <button
          onClick={handleClearData}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/30 text-[#EF4444] transition"
        >
          <Trash2 size={15} />
          <span>Clear Dev Data</span>
        </button>
      </div>
    </aside>
  );
};
