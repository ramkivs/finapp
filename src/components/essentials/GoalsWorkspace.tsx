import React, { useState } from 'react';
import { FinancialGoal } from '../../domain/types';
import { CurrencyValue } from '../CurrencyValue';
import { AddGoalModal } from './AddGoalModal';
import { InflationCalculatorModal } from './InflationCalculatorModal';
import { EssentialsService } from '../../services/EssentialsService';
import { useCanonicalLedger } from '../../store/useCanonicalLedger';
import { Target, Calculator, Plus, Trash2, Calendar, CheckCircle2 } from 'lucide-react';

interface Props {
  goals: FinancialGoal[];
}

export const GoalsWorkspace: React.FC<Props> = ({ goals }) => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [calcModalOpen, setCalcModalOpen] = useState(false);
  const { removeGoal } = useCanonicalLedger();

  const totalTargetCorpus = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSavedAmount = goals.reduce((sum, g) => sum + (Number(g.currentSavedAmount) || 0), 0);
  const totalMonthlyContribution = goals
    .filter(g => g.status === 'In Progress')
    .reduce((sum, g) => sum + (Number(g.monthlyContribution) || 0), 0);

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove goal "${name}"?`)) {
      removeGoal(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-sm">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Financial Goals & Milestone Planning ({goals.length})
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Corpus targets, progress tracking, and monthly systematic contributions across 8 templates
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            id="btn-open-inflation-calc"
            onClick={() => setCalcModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-xs transition border border-gray-200 dark:border-gray-700"
          >
            <Calculator size={14} className="text-cyan-600 dark:text-cyan-400" />
            <span>Inflation Calculator</span>
          </button>

          <button
            id="btn-add-goal"
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold text-xs transition shadow-sm"
          >
            <Plus size={15} />
            <span>+ Add Goal</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
            Total Target Corpus
          </span>
          <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
            <CurrencyValue value={totalTargetCorpus} />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
            {goals.length} Active Financial Milestones
          </span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
            Accumulated Corpus
          </span>
          <div className="text-2xl font-black text-green-700 dark:text-green-400 mt-1">
            <CurrencyValue value={totalSavedAmount} />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
            {totalTargetCorpus > 0 ? `${Math.round((totalSavedAmount / totalTargetCorpus) * 100)}% of total target achieved` : 'No goals defined'}
          </span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
            Monthly SIP Allocation
          </span>
          <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-1">
            <CurrencyValue value={totalMonthlyContribution} />
            <span className="text-xs font-bold text-gray-500"> / mo</span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
            Systematic monthly goal commitments
          </span>
        </div>
      </div>

      {/* Goals List / Cards */}
      {goals.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center shadow-sm">
          <div className="text-base font-bold text-gray-900 dark:text-white">
            No financial goals configured
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
            Define corpus targets for retirement, home down-payment, education, vacations, and wedding funds to track milestone progress.
          </p>
          <button
            onClick={() => setAddModalOpen(true)}
            className="mt-5 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white text-xs font-bold transition shadow-sm"
          >
            <Plus size={14} />
            <span>+ Add Goal</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map(g => {
            const { progressPct } = EssentialsService.calculateGoalProgress(g);
            return (
              <div
                key={g.id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-4 hover:border-gray-300 dark:hover:border-gray-700 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 text-[10px] font-bold">
                        {g.template}
                      </span>
                      <span className="text-xs text-gray-400">{g.targetDate ? `Target: ${g.targetDate}` : ''}</span>
                    </div>
                    <h4 className="font-extrabold text-base text-gray-900 dark:text-white mt-1">
                      {g.name}
                    </h4>
                  </div>

                  <button
                    onClick={() => handleDelete(g.id, g.name)}
                    className="p-1 text-gray-400 hover:text-rose-600 transition"
                    title="Delete goal"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block font-medium">Target Corpus:</span>
                    <span className="text-sm font-black text-gray-900 dark:text-white mt-0.5 block">
                      <CurrencyValue value={g.targetAmount} />
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block font-medium">Monthly SIP:</span>
                    <span className="text-sm font-black text-cyan-600 dark:text-cyan-400 mt-0.5 block">
                      {g.monthlyContribution > 0 ? <CurrencyValue value={g.monthlyContribution} /> : <span className="italic text-gray-400">—</span>}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                    <span>Progress: {progressPct}%</span>
                    <span>Saved: <CurrencyValue value={g.currentSavedAmount} /></span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div
                      style={{ width: `${progressPct}%` }}
                      className={`h-full ${progressPct >= 100 ? 'bg-green-600' : progressPct >= 50 ? 'bg-cyan-500' : 'bg-green-600'}`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddGoalModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} />
      <InflationCalculatorModal isOpen={calcModalOpen} onClose={() => setCalcModalOpen(false)} />
    </div>
  );
};
