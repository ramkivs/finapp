import { repository } from '../repositories';
import { FinancialMetricService } from '../services/FinancialMetricService';
import { FinancialMetric, FinancialSeries, Transaction, NetWorthSnapshot, TransactionQuery } from '../domain/types';

export class FinancialQueries {
  static getMetric(metricName: string): FinancialMetric {
    const transactions = repository.transactions.findManySync({});
    const assets = repository.assets.findAllSync();
    const liabilities = repository.liabilities.findAllSync();
    return FinancialMetricService.getMetric(metricName, transactions, assets, liabilities);
  }

  static getSeries(seriesName: string): FinancialSeries | null {
    const transactions = repository.transactions.findManySync({});
    return FinancialMetricService.getSeries(seriesName, transactions);
  }

  static queryTransactions(params: TransactionQuery): Transaction[] {
    return repository.transactions.findManySync(params);
  }

  static getSnapshots(): NetWorthSnapshot[] {
    return repository.snapshots.findAllSync();
  }
}
