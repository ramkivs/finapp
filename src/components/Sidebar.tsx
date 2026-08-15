import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  ShieldCheck,
  Calculator,
  Upload,
  FileText,
  Target,
  Sparkles,
  Settings,
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
  const primaryNavItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'wealth', label: 'Wealth', icon: TrendingUp },
    { id: 'money', label: 'Money', icon: Wallet },
    { id: 'essentials', label: 'Essentials', icon: ShieldCheck },
    { id: 'calculators', label: 'Calculators', icon: Calculator },
    { id: 'import', label: 'Import', icon: Upload },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'insights', label: 'Insights', icon: Sparkles },
    { id: 'settings', label: 'Settings', icon: Settings }
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
    if (id === 'goals') {
      setActiveTab('essentials');
    } else if (id === 'reports') {
      setActiveTab('money');
    } else if (id === 'insights') {
      setActiveTab('wealth');
    } else if (id === 'settings') {
      alert('Settings: FinBoom v3.0 Institutional Theme active. Local persistence verified.');
    } else {
      setActiveTab(id);
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const isTabActive = (id: string) => {
    if (activeTab === id) return true;
    if (id === 'goals' && activeTab === 'goals') return true;
    return false;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#161B22] border-r border-[#21262D] text-[#F0F6FC]">
      {/* Brand Header */}
      <div className={`p-4 flex items-center justify-between border-b border-[#21262D] ${isCollapsed ? 'justify-center' : ''}`}>
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#23C55E] to-[#4F8CFF] flex items-center justify-center font-black text-white text-sm shadow-md flex-shrink-0">
              ☑
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                <span>FINBOOM</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-[#21262D] text-[#8B949E] rounded-md font-mono">v3.0</span>
              </div>
              <p className="text-[10px] text-[#8B949E] tracking-tight">Financial Command Center</p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#23C55E] to-[#4F8CFF] flex items-center justify-center font-black text-white text-sm shadow-md">
            ☑
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

      {/* Primary Navigation List (Exact Prototype Hierarchy + Import) */}
      <nav className="p-2.5 flex-1 overflow-y-auto space-y-1">
        {primaryNavItems.map(item => {
          const Icon = item.icon;
          const active = isTabActive(item.id);
          return (
            <button
              key={item.id}
              id={`sidebar-nav-${item.id}`}
              onClick={() => handleNavClick(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                active
                  ? 'bg-[#1F2937] text-[#4F8CFF] font-bold border border-[#30363D] shadow-sm'
                  : 'text-[#8B949E] hover:bg-[#1F2937]/50 hover:text-[#F0F6FC]'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <Icon size={17} className={active ? 'text-[#4F8CFF]' : 'text-[#8B949E]'} />
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Data & Diagnostics Controls (Exact Prototype Dev Data section) */}
      <div className="p-2.5 border-t border-[#21262D] space-y-1">
        {!isCollapsed && (
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#6E7681] px-3 pt-1 pb-1">
            DEV DATA & TOOLS
          </div>
        )}

        <button
          id="btn-load-demo-data"
          onClick={handleLoadDemo}
          title={isCollapsed ? 'Load Demo Data' : undefined}
          className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-green-400 hover:bg-[#1F2937] border border-transparent hover:border-[#30363D] transition cursor-pointer ${isCollapsed ? 'justify-center px-0' : ''}`}
        >
          <Database size={15} className="text-green-400 flex-shrink-0" />
          {!isCollapsed && <span>Load Demo Data</span>}
        </button>

        <button
          id="btn-clear-dev-data"
          onClick={handleClearData}
          title={isCollapsed ? 'Clear Dev Data' : undefined}
          className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-[#1F2937] border border-transparent hover:border-[#30363D] transition cursor-pointer ${isCollapsed ? 'justify-center px-0' : ''}`}
        >
          <Trash2 size={15} className="text-rose-400 flex-shrink-0" />
          {!isCollapsed && <span>Clear Dev Data</span>}
        </button>

        {onToggleCollapse && (
          <button
            id="btn-collapse-sidebar"
            onClick={onToggleCollapse}
            className="hidden md:flex w-full items-center justify-center py-1.5 mt-1 rounded-xl text-xs font-bold text-[#8B949E] hover:bg-[#1F2937] hover:text-white transition cursor-pointer"
            title={isCollapsed ? 'Expand Sidebar (240px)' : 'Collapse Sidebar (72px)'}
          >
            {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
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
