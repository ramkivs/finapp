import { useCanonicalLedger } from '../store/useCanonicalLedger';
import { FinancialMetricService } from '../services/FinancialMetricService';
import { FinancialMetric, FinancialSeries, Transaction, NetWorthSnapshot } from '../domain/types';

export class FinancialQueries {
  static getMetric(metricName: string): FinancialMetric {
    const { transactions, assets, liabilities } = useCanonicalLedger.getState();
    return FinancialMetricService.getMetric(metricName, transactions, assets, liabilities);
  }

  static getSeries(seriesName: string): FinancialSeries | null {
    const { transactions } = useCanonicalLedger.getState();
    return FinancialMetricService.getSeries(seriesName, transactions);
  }

  static queryTransactions(params: {
    type?: 'Expense' | 'Income' | 'Transfer' | 'All';
    dateRange?: string;
    search?: string;
    customStart?: string | null;
    customEnd?: string | null;
  }): Transaction[] {
    return useCanonicalLedger.getState().getFilteredTransactions(params);
  }

  static getSnapshots(): NetWorthSnapshot[] {
    return useCanonicalLedger.getState().snapshots;
  }
}
