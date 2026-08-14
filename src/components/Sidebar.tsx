import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  ShieldCheck,
  Upload,
  Calculator,
  Sparkles,
  Settings,
  MessageSquare,
  Database,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { FinancialCommands } from '../application/commands';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile
}) => {
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

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#161B22] border-r border-[#21262D] text-[#F0F6FC]">
      {/* Brand Header */}
      <div className={`p-5 flex items-center justify-between border-b border-[#21262D] ${isCollapsed ? 'justify-center' : ''}`}>
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#23C55E] to-[#4F8CFF] flex items-center justify-center font-black text-white text-sm shadow-md">
              F
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                <span>FINBOOM</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-[#21262D] text-[#8B949E] rounded-md font-mono">v3.0</span>
              </div>
              <p className="text-[10px] text-[#8B949E] tracking-tight">Financial Command Center</p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#23C55E] to-[#4F8CFF] flex items-center justify-center font-black text-white text-sm shadow-md">
            F
          </div>
        )}

        {/* Mobile close button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-[#8B949E] hover:text-white rounded-lg hover:bg-[#21262D] transition cursor-pointer"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation list */}
      <nav className="p-3 flex-1 overflow-y-auto space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-nav-${item.id}`}
              onClick={() => handleNavClick(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                active
                  ? 'bg-gradient-to-r from-green-900/40 to-green-800/20 text-[#23C55E] border border-green-800/50 shadow-sm'
                  : 'text-[#8B949E] hover:bg-[#21262D]/70 hover:text-[#F0F6FC]'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <Icon size={18} className={active ? 'text-[#23C55E]' : 'text-[#8B949E]'} />
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          );
        })}

        {/* Tools Section */}
        {!isCollapsed && (
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#6E7681] px-3.5 pt-5 pb-1.5">
            TOOLS
          </div>
        )}

        {toolItems.map(item => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-nav-${item.id}`}
              onClick={() => handleNavClick(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                active
                  ? 'bg-gradient-to-r from-green-900/40 to-green-800/20 text-[#23C55E] border border-green-800/50 shadow-sm'
                  : 'text-[#8B949E] hover:bg-[#21262D]/70 hover:text-[#F0F6FC]'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <Icon size={18} className={active ? 'text-[#23C55E]' : 'text-[#8B949E]'} />
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          );
        })}

        {/* Data & Diagnostics Buttons */}
        {!isCollapsed && (
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#6E7681] px-3.5 pt-5 pb-1.5">
            DATA & SETTINGS
          </div>
        )}

        <button
          id="btn-load-demo-data"
          onClick={handleLoadDemo}
          title={isCollapsed ? 'Load Demo Data' : undefined}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-green-400 bg-green-950/20 hover:bg-green-900/40 border border-green-900/30 transition-all duration-150 cursor-pointer ${isCollapsed ? 'justify-center px-0' : ''}`}
        >
          <Database size={17} />
          {!isCollapsed && <span>Load Demo Data</span>}
        </button>

        <button
          id="btn-clear-dev-data"
          onClick={handleClearData}
          title={isCollapsed ? 'Clear Dev Data' : undefined}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-400 bg-rose-950/20 hover:bg-rose-900/40 border border-rose-900/30 transition-all duration-150 cursor-pointer ${isCollapsed ? 'justify-center px-0' : ''}`}
        >
          <Trash2 size={17} />
          {!isCollapsed && <span>Clear Dev Data</span>}
        </button>

        <button
          onClick={() => alert('What\'s New (v3.0): Next-Gen Unified Dark Financial Intelligence Dashboard with zero-dependency responsive charts.')}
          title={isCollapsed ? "What's New" : undefined}
          className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#8B949E] hover:bg-[#21262D]/70 hover:text-white transition cursor-pointer ${isCollapsed ? 'justify-center px-0' : ''}`}
        >
          <Sparkles size={17} />
          {!isCollapsed && <span>What's New</span>}
        </button>

        <button
          onClick={() => alert('Settings: Global privacy persistence enabled in localStorage (finapp.privacy.masked).')}
          title={isCollapsed ? 'Settings' : undefined}
          className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#8B949E] hover:bg-[#21262D]/70 hover:text-white transition cursor-pointer ${isCollapsed ? 'justify-center px-0' : ''}`}
        >
          <Settings size={17} />
          {!isCollapsed && <span>Settings</span>}
        </button>
      </nav>

      {/* Footer & Collapse Toggle */}
      <div className="p-3 border-t border-[#21262D] space-y-1">
        <button
          onClick={() => alert('Feedback: Thank you! We read every suggestion from our community.')}
          title={isCollapsed ? 'Feedback' : undefined}
          className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#8B949E] hover:bg-[#21262D] hover:text-white transition cursor-pointer ${isCollapsed ? 'justify-center px-0' : ''}`}
        >
          <MessageSquare size={17} />
          {!isCollapsed && <span>Feedback</span>}
        </button>

        {onToggleCollapse && (
          <button
            id="btn-collapse-sidebar"
            onClick={onToggleCollapse}
            className="hidden md:flex w-full items-center justify-center py-2 rounded-xl text-xs font-bold text-[#8B949E] hover:bg-[#21262D] hover:text-white transition cursor-pointer"
            title={isCollapsed ? 'Expand Sidebar (240px)' : 'Collapse Sidebar (72px)'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block h-screen sticky top-0 flex-shrink-0 z-40 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-[72px]' : 'w-[240px]'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Off-Canvas Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity cursor-pointer"
            onClick={onCloseMobile}
          />
          <div className="relative w-[260px] max-w-[80vw] h-full shadow-2xl z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
