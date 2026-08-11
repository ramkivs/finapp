import React, { useState } from 'react';
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
  const [isDark, setIsDark] = useState<boolean>(true);
  const [activeModal, setActiveModal] = useState<
    null | 'modal-income' | 'modal-expense' | 'modal-transfer' | 'modal-custom-date'
  >(null);

  const toggleDark = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#07111C] text-[#F5F8FC] font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header toggleDark={toggleDark} isDark={isDark} />
        <main className="p-8 max-w-[1400px] w-full mx-auto flex-1">
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

      <IncomeModal isOpen={activeModal === 'modal-income'} onClose={() => setActiveModal(null)} />
      <ExpenseModal isOpen={activeModal === 'modal-expense'} onClose={() => setActiveModal(null)} />
      <TransferModal isOpen={activeModal === 'modal-transfer'} onClose={() => setActiveModal(null)} />
      <CustomDateModal isOpen={activeModal === 'modal-custom-date'} onClose={() => setActiveModal(null)} />
    </div>
  );
}
export default App;
