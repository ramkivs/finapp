import { repository } from '../repositories';
import { FinancialMetricService } from '../services/FinancialMetricService';
import { WealthIntelligenceService } from '../services/WealthIntelligenceService';
import {
  FinancialMetric,
  FinancialSeries,
  Transaction,
  NetWorthSnapshot,
  WealthHealthSummary,
  AssetConcentrationAnalysis,
  AllocationDiagnostics,
  LiabilityDiagnostics,
  NetWorthTrendIntelligence,
  WealthInsight,
  WealthDataQuality
} from '../domain/types';

export class FinancialQueries {
  static getMetric(metricName: string): FinancialMetric {
    const transactions = repository.transactions.findAllSync();
    const assets = repository.assets.findAllSync();
    const liabilities = repository.liabilities.findAllSync();
    return FinancialMetricService.getMetric(metricName, transactions, assets, liabilities);
  }

  static getSeries(seriesName: string): FinancialSeries | null {
    const transactions = repository.transactions.findAllSync();
    return FinancialMetricService.getSeries(seriesName, transactions);
  }

  static queryTransactions(params: {
    type?: 'Expense' | 'Income' | 'Transfer' | 'All';
    dateRange?: string;
    search?: string;
    customStart?: string | null;
    customEnd?: string | null;
  }): Transaction[] {
    return repository.transactions.findManySync(params);
  }

  static getSnapshots(): NetWorthSnapshot[] {
    return repository.snapshots.findAllSync();
  }

  /* WP-17 Phase C: Wealth Intelligence Queries */
  static getWealthHealthSummary(): WealthHealthSummary {
    const assets = repository.assets.findAllSync();
    const liabilities = repository.liabilities.findAllSync();
    const snapshots = repository.snapshots.findAllSync();
    return WealthIntelligenceService.getHealthSummary(assets, liabilities, snapshots);
  }

  static getAssetConcentration(): AssetConcentrationAnalysis {
    const assets = repository.assets.findAllSync();
    return WealthIntelligenceService.getAssetConcentration(assets);
  }

  static getAllocationDiagnostics(): AllocationDiagnostics {
    const assets = repository.assets.findAllSync();
    return WealthIntelligenceService.getAllocationDiagnostics(assets);
  }

  static getLiabilityDiagnostics(): LiabilityDiagnostics {
    const assets = repository.assets.findAllSync();
    const liabilities = repository.liabilities.findAllSync();
    return WealthIntelligenceService.getLiabilityDiagnostics(assets, liabilities);
  }

  static getTrendIntelligence(): NetWorthTrendIntelligence {
    const snapshots = repository.snapshots.findAllSync();
    return WealthIntelligenceService.getTrendIntelligence(snapshots);
  }

  static getDataQuality(): WealthDataQuality {
    const assets = repository.assets.findAllSync();
    const liabilities = repository.liabilities.findAllSync();
    const snapshots = repository.snapshots.findAllSync();
    return WealthIntelligenceService.getDataQuality(assets, liabilities, snapshots);
  }

  static getWealthInsights(): WealthInsight[] {
    const assets = repository.assets.findAllSync();
    const liabilities = repository.liabilities.findAllSync();
    const snapshots = repository.snapshots.findAllSync();
    return WealthIntelligenceService.generateInsights(assets, liabilities, snapshots);
  }
}
