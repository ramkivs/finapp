import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewPage } from './pages/OverviewPage';
import { WealthPage } from './pages/WealthPage';
import { MoneyPage } from './pages/MoneyPage';
import { EssentialsPage } from './pages/EssentialsPage';
import { ImportPage } from './pages/ImportPage';
import { CalculatorsPage } from './pages/CalculatorsPage';
import { IncomeModal, ExpenseModal, TransferModal } from './components/Modals';
import { CustomDateModal } from './components/CustomDateModal';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('money');
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('finapp.theme') === 'dark' ||
        (!localStorage.getItem('finapp.theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  const [activeModal, setActiveModal] = useState<
    null | 'modal-income' | 'modal-expense' | 'modal-transfer' | 'modal-custom-date'
  >(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('finapp.theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('finapp.theme', 'light');
    }
  }, [isDark]);

  const toggleDark = () => {
    setIsDark(prev => !prev);
  };

  return (
    <div className={`flex min-h-screen w-full font-sans antialiased ${isDark ? 'dark bg-[#0D1117] text-[#F0F6FC]' : 'bg-[#faf9f5] text-gray-900'}`}>
      {/* Responsive Sidebar with Collapse & Mobile Off-Canvas Drawer */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        isMobileOpen={isMobileDrawerOpen}
        onCloseMobile={() => setIsMobileDrawerOpen(false)}
      />

      {/* Main Workspace Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          toggleDark={toggleDark}
          isDark={isDark}
          onOpenMobile={() => setIsMobileDrawerOpen(true)}
        />

        <main className="p-4 md:p-6 lg:p-8 max-w-[1440px] w-full mx-auto flex-1">
          {activeTab === 'overview' && <OverviewPage />}
          {activeTab === 'wealth' && <WealthPage />}
          {activeTab === 'money' && (
            <MoneyPage openModal={(m) => setActiveModal(m)} openSidebarTab={setActiveTab} />
          )}
          {activeTab === 'essentials' && <EssentialsPage />}
          {activeTab === 'import' && <ImportPage />}
          {activeTab === 'calculators' && <CalculatorsPage />}
        </main>
      </div>

      {/* Reusable Modals (Preserving All Certified Contracts) */}
      <IncomeModal isOpen={activeModal === 'modal-income'} onClose={() => setActiveModal(null)} />
      <ExpenseModal isOpen={activeModal === 'modal-expense'} onClose={() => setActiveModal(null)} />
      <TransferModal isOpen={activeModal === 'modal-transfer'} onClose={() => setActiveModal(null)} />
      <CustomDateModal isOpen={activeModal === 'modal-custom-date'} onClose={() => setActiveModal(null)} />
    </div>
  );
}

export default App;
