import {
  Asset,
  Liability,
  NetWorthSnapshot,
  WealthHealthSummary,
  AssetConcentrationAnalysis,
  AllocationDiagnostics,
  LiabilityDiagnostics,
  NetWorthTrendIntelligence,
  WealthInsight,
  WealthDataQuality
} from '../domain/types';

export class WealthIntelligenceService {
  /** Target allocation reference defaults (presentation benchmark) */
  public static readonly TARGET_ALLOCATION_REFERENCE: Record<string, number> = {
    'Equity': 55,
    'Debt': 20,
    'Real Estate': 10,
    'Commodities': 10,
    'Cash & Savings': 5
  };

  /** Compute Wealth Health Summary (Workstream C1) */
  public static getHealthSummary(
    assets: Asset[],
    liabilities: Liability[],
    snapshots: NetWorthSnapshot[]
  ): WealthHealthSummary {
    const totalAssets = assets.reduce((s, a) => s + a.amount, 0);
    const totalLiabilities = liabilities.reduce((s, l) => s + l.amount, 0);
    const netWorth = totalAssets - totalLiabilities;

    if (assets.length === 0 && liabilities.length === 0) {
      return {
        netWorth: 0,
        totalAssets: 0,
        totalLiabilities: 0,
        debtToAssetRatio: 0,
        liquidReserve: 0,
        liquidRatio: 0,
        topAssetConcentration: 0,
        status: 'NOT_CONFIGURED'
      };
    }

    const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : (totalLiabilities > 0 ? 100 : 0);

    // Liquid assets: strictly assets explicitly classified as 'Cash & Savings'
    const liquidReserve = assets
      .filter(a => a.type === 'Cash & Savings')
      .reduce((s, a) => s + a.amount, 0);

    const liquidRatio = totalAssets > 0 ? (liquidReserve / totalAssets) * 100 : 0;

    const maxAssetAmt = assets.length > 0 ? Math.max(...assets.map(a => a.amount)) : 0;
    const topAssetConcentration = totalAssets > 0 ? (maxAssetAmt / totalAssets) * 100 : 0;

    return {
      netWorth,
      totalAssets,
      totalLiabilities,
      debtToAssetRatio,
      liquidReserve,
      liquidRatio,
      topAssetConcentration,
      status: 'RECONCILED'
    };
  }

  /** Compute Asset Concentration Analysis (Workstream C2) */
  public static getAssetConcentration(assets: Asset[]): AssetConcentrationAnalysis {
    const total = assets.reduce((s, a) => s + a.amount, 0);
    if (assets.length === 0 || total === 0) {
      return {
        byType: [],
        byGeography: [],
        byCurrency: [],
        isConcentrated: false,
        unclassifiedPct: 0
      };
    }

    // Largest individual asset
    const sorted = [...assets].sort((a, b) => b.amount - a.amount);
    const top = sorted[0];
    const topAsset = top
      ? {
          name: top.name,
          amount: top.amount,
          pct: Math.round((top.amount / total) * 100)
        }
      : undefined;

    // Concentration by Type
    const typeMap: Record<string, number> = {};
    let unclassifiedAmt = 0;
    for (const a of assets) {
      const t = a.type || 'Other';
      typeMap[t] = (typeMap[t] || 0) + a.amount;
      if (!a.type || a.type === 'Other') {
        unclassifiedAmt += a.amount;
      }
    }
    const byType = Object.entries(typeMap)
      .map(([type, amount]) => ({
        type,
        amount,
        pct: Math.round((amount / total) * 100)
      }))
      .sort((a, b) => b.amount - a.amount);

    // Concentration by Geography (explicit metadata only, no currency inference)
    const geoMap: Record<string, number> = {};
    for (const a of assets) {
      const g = a.geography || 'India';
      geoMap[g] = (geoMap[g] || 0) + a.amount;
    }
    const byGeography = Object.entries(geoMap)
      .map(([geography, amount]) => ({
        geography,
        amount,
        pct: Math.round((amount / total) * 100)
      }))
      .sort((a, b) => b.amount - a.amount);

    // Concentration by Currency (explicit metadata only)
    const currMap: Record<string, number> = {};
    for (const a of assets) {
      const c = a.currency || 'INR';
      currMap[c] = (currMap[c] || 0) + a.amount;
    }
    const byCurrency = Object.entries(currMap)
      .map(([currency, amount]) => ({
        currency,
        amount,
        pct: Math.round((amount / total) * 100)
      }))
      .sort((a, b) => b.amount - a.amount);

    const isConcentrated = (topAsset?.pct || 0) > 40 || (byType[0]?.pct || 0) > 60;
    const unclassifiedPct = Math.round((unclassifiedAmt / total) * 100);

    return {
      topAsset,
      byType,
      byGeography,
      byCurrency,
      isConcentrated,
      unclassifiedPct
    };
  }

  /** Compute Allocation Diagnostics & Target Drift (Workstream C3) */
  public static getAllocationDiagnostics(assets: Asset[]): AllocationDiagnostics {
    const total = assets.reduce((s, a) => s + a.amount, 0);
    if (assets.length === 0 || total === 0) {
      return {
        underrepresentedCategories: [],
        targetDrift: [],
        hasConcentrationWarning: false,
        metadataCompletenessPct: 0
      };
    }

    const typeMap: Record<string, number> = {};
    let classifiedCount = 0;
    for (const a of assets) {
      const t = a.type || 'Other';
      typeMap[t] = (typeMap[t] || 0) + a.amount;
      if (a.type && a.type !== 'Other') classifiedCount++;
    }

    const dominantCategory = Object.entries(typeMap).sort((a, b) => b[1] - a[1])[0]?.[0];
    const dominantPct = total > 0 && dominantCategory ? (typeMap[dominantCategory] / total) * 100 : 0;
    const hasConcentrationWarning = dominantPct > 60;

    const underrepresentedCategories: string[] = [];
    const targetDrift: Array<{
      category: string;
      targetPct: number;
      actualPct: number;
      driftPct: number;
    }> = [];

    for (const [cat, targetPct] of Object.entries(this.TARGET_ALLOCATION_REFERENCE)) {
      const actualAmt = typeMap[cat] || 0;
      const actualPct = total > 0 ? Math.round((actualAmt / total) * 100) : 0;
      const driftPct = actualPct - targetPct;
      targetDrift.push({ category: cat, targetPct, actualPct, driftPct });
      if (actualPct < targetPct / 2) {
        underrepresentedCategories.push(cat);
      }
    }

    const metadataCompletenessPct = Math.round((classifiedCount / assets.length) * 100);

    return {
      dominantCategory,
      underrepresentedCategories,
      targetDrift,
      hasConcentrationWarning,
      metadataCompletenessPct
    };
  }

  /** Compute Liquidity & Liability Health (Workstream C4) */
  public static getLiabilityDiagnostics(assets: Asset[], liabilities: Liability[]): LiabilityDiagnostics {
    const totalAssets = assets.reduce((s, a) => s + a.amount, 0);
    const totalDebt = liabilities.reduce((s, l) => s + l.amount, 0);

    if (assets.length === 0 && liabilities.length === 0) {
      return {
        totalDebt: 0,
        debtToAssetRatio: 0,
        burdenLevel: 'NOT_CONFIGURED'
      };
    }

    const debtToAssetRatio = totalAssets > 0 ? (totalDebt / totalAssets) * 100 : (totalDebt > 0 ? 100 : 0);

    let burdenLevel: 'LOW' | 'MODERATE' | 'ELEVATED' | 'NOT_CONFIGURED';
    if (totalAssets === 0 && totalDebt === 0) {
      burdenLevel = 'NOT_CONFIGURED';
    } else if (debtToAssetRatio > 40) {
      burdenLevel = 'ELEVATED';
    } else if (debtToAssetRatio > 20) {
      burdenLevel = 'MODERATE';
    } else {
      burdenLevel = 'LOW';
    }

    const sorted = [...liabilities].sort((a, b) => b.amount - a.amount);
    const top = sorted[0];
    const largestLiability = top
      ? {
          name: top.name,
          amount: top.amount,
          type: top.type || 'Other',
          pct: totalDebt > 0 ? Math.round((top.amount / totalDebt) * 100) : 0
        }
      : undefined;

    return {
      totalDebt,
      debtToAssetRatio,
      largestLiability,
      burdenLevel
    };
  }

  /** Compute Net-Worth Trend Intelligence (Workstream C5) */
  public static getTrendIntelligence(snapshots: NetWorthSnapshot[]): NetWorthTrendIntelligence {
    if (!snapshots || snapshots.length === 0) {
      return {
        status: 'NOT_CONFIGURED',
        snapshotCount: 0,
        latestNetWorth: 0,
        direction: 'NONE'
      };
    }

    const sorted = [...snapshots].sort((a, b) => {
      const tA = new Date(a.dateStr.replace(' (Today)', '')).getTime();
      const tB = new Date(b.dateStr.replace(' (Today)', '')).getTime();
      return (isNaN(tA) ? 0 : tA) - (isNaN(tB) ? 0 : tB);
    });

    const count = sorted.length;
    const latest = sorted[count - 1];

    if (count === 1) {
      return {
        status: 'BASELINE_SET',
        snapshotCount: 1,
        latestNetWorth: latest.netWorth,
        direction: 'NONE'
      };
    }

    const previous = sorted[count - 2];
    const absoluteChange = latest.netWorth - previous.netWorth;
    const percentageChange = previous.netWorth !== 0 ? (absoluteChange / Math.abs(previous.netWorth)) * 100 : 0;
    const direction: 'UP' | 'DOWN' | 'FLAT' =
      absoluteChange > 0 ? 'UP' : absoluteChange < 0 ? 'DOWN' : 'FLAT';

    const status = count >= 3 ? 'COMPOUNDING_ACTIVE' : 'TREND_ACTIVE';

    return {
      status,
      snapshotCount: count,
      latestNetWorth: latest.netWorth,
      previousNetWorth: previous.netWorth,
      absoluteChange,
      percentageChange,
      direction
    };
  }

  /** Compute Wealth Data Quality (Workstream C7) */
  public static getDataQuality(
    assets: Asset[],
    liabilities: Liability[],
    snapshots: NetWorthSnapshot[]
  ): WealthDataQuality {
    const totalRecords = assets.length + liabilities.length;
    if (totalRecords === 0) {
      return {
        status: 'NOT_CONFIGURED',
        completenessScore: 0,
        missingAssetTypeCount: 0,
        missingGeographyCount: 0,
        missingCurrencyCount: 0,
        missingLiabilityTypeCount: 0,
        totalRecords: 0
      };
    }

    let missingAssetTypeCount = 0;
    let missingGeographyCount = 0;
    let missingCurrencyCount = 0;
    for (const a of assets) {
      if (!a.type || a.type === 'Other') missingAssetTypeCount++;
      if (!a.geography) missingGeographyCount++;
      if (!a.currency) missingCurrencyCount++;
    }

    let missingLiabilityTypeCount = 0;
    for (const l of liabilities) {
      if (!l.type || l.type === 'Other') missingLiabilityTypeCount++;
    }

    const totalFields = assets.length * 3 + liabilities.length * 1;
    const missingFields =
      missingAssetTypeCount + missingGeographyCount + missingCurrencyCount + missingLiabilityTypeCount;
    const completenessScore =
      totalFields > 0 ? Math.round(((totalFields - missingFields) / totalFields) * 100) : 100;

    let status: 'COMPLETE' | 'PARTIAL' | 'NEEDS_ATTENTION' | 'NOT_CONFIGURED';
    if (completenessScore >= 80) {
      status = 'COMPLETE';
    } else if (completenessScore >= 40) {
      status = 'PARTIAL';
    } else {
      status = 'NEEDS_ATTENTION';
    }

    return {
      status,
      completenessScore: Math.max(0, completenessScore),
      missingAssetTypeCount,
      missingGeographyCount,
      missingCurrencyCount,
      missingLiabilityTypeCount,
      totalRecords
    };
  }

  /** Deterministic Insights Engine (Workstream C6) */
  public static generateInsights(
    assets: Asset[],
    liabilities: Liability[],
    snapshots: NetWorthSnapshot[]
  ): WealthInsight[] {
    const insights: WealthInsight[] = [];

    if (assets.length === 0 && liabilities.length === 0) {
      insights.push({
        id: 'wi-empty',
        severity: 'INFO',
        title: 'Wealth Ledger Initial Setup',
        explanation: 'Add your first asset and liability to initialize portfolio concentration and wealth health metrics.',
        sourceMetric: 'PORTFOLIO_STATE',
        deterministicReason: '0 canonical assets and 0 liabilities recorded'
      });
      return insights;
    }

    const health = this.getHealthSummary(assets, liabilities, snapshots);
    const concentration = this.getAssetConcentration(assets);
    const liabDiag = this.getLiabilityDiagnostics(assets, liabilities);
    const trend = this.getTrendIntelligence(snapshots);
    const dataQuality = this.getDataQuality(assets, liabilities, snapshots);

    // 1. Debt Burden Insight
    if (liabDiag.burdenLevel === 'ELEVATED') {
      insights.push({
        id: 'wi-debt-elevated',
        severity: 'ACTION',
        title: 'Elevated Debt-to-Asset Ratio',
        explanation: `Total liabilities represent ${Math.round(liabDiag.debtToAssetRatio)}% of total asset valuation. Prioritize high-interest debt amortisation.`,
        sourceMetric: 'DEBT_TO_ASSET_RATIO',
        deterministicReason: `Debt ratio (${Math.round(liabDiag.debtToAssetRatio)}%) exceeds 40% threshold`
      });
    } else if (liabDiag.burdenLevel === 'MODERATE') {
      insights.push({
        id: 'wi-debt-moderate',
        severity: 'WATCH',
        title: 'Moderate Debt Obligation',
        explanation: `Total liabilities represent ${Math.round(liabDiag.debtToAssetRatio)}% of assets. Debt schedule is manageable but warrants monitoring.`,
        sourceMetric: 'DEBT_TO_ASSET_RATIO',
        deterministicReason: `Debt ratio (${Math.round(liabDiag.debtToAssetRatio)}%) is between 20% and 40%`
      });
    } else if (liabDiag.totalDebt > 0 && liabDiag.burdenLevel === 'LOW') {
      insights.push({
        id: 'wi-debt-low',
        severity: 'INFO',
        title: 'Conservative Debt Profile',
        explanation: `Total liabilities represent only ${Math.round(liabDiag.debtToAssetRatio)}% of assets, indicating strong leverage solvency.`,
        sourceMetric: 'DEBT_TO_ASSET_RATIO',
        deterministicReason: `Debt ratio (${Math.round(liabDiag.debtToAssetRatio)}%) is below 20% threshold`
      });
    }

    // 2. Single-Asset Concentration Insight
    if (concentration.topAsset && concentration.topAsset.pct > 40) {
      insights.push({
        id: 'wi-asset-concentration',
        severity: 'WATCH',
        title: 'Single-Asset Concentration Risk',
        explanation: `"${concentration.topAsset.name}" constitutes ${concentration.topAsset.pct}% of total portfolio value. Consider diversification across uncorrelated asset classes.`,
        sourceMetric: 'ASSET_CONCENTRATION',
        deterministicReason: `Top asset "${concentration.topAsset.name}" represents ${concentration.topAsset.pct}% (> 40% threshold) of total assets`
      });
    }

    // 3. Liquid Reserve Health
    if (health.totalAssets > 0 && health.liquidRatio < 5) {
      insights.push({
        id: 'wi-liquidity-low',
        severity: 'WATCH',
        title: 'Low Liquid Cash Reserves',
        explanation: `Liquid reserves (Cash & Savings) represent ${Math.round(health.liquidRatio)}% of total assets. Ensure adequate buffer for short-term obligations.`,
        sourceMetric: 'LIQUIDITY_RATIO',
        deterministicReason: `Liquid cash ratio (${Math.round(health.liquidRatio)}%) is below 5% recommended minimum`
      });
    } else if (health.liquidRatio >= 5 && health.liquidReserve > 0) {
      insights.push({
        id: 'wi-liquidity-healthy',
        severity: 'INFO',
        title: 'Healthy Liquid Cushion',
        explanation: `Cash & liquid savings represent ${Math.round(health.liquidRatio)}% of portfolio assets, providing reliable operational liquidity.`,
        sourceMetric: 'LIQUIDITY_RATIO',
        deterministicReason: `Liquid cash ratio is ${Math.round(health.liquidRatio)}% (>= 5%)`
      });
    }

    // 4. Net Worth Trend Insight
    if (trend.status === 'TREND_ACTIVE' || trend.status === 'COMPOUNDING_ACTIVE') {
      if (trend.direction === 'UP') {
        insights.push({
          id: 'wi-nw-growth',
          severity: 'INFO',
          title: 'Positive Net Worth Trajectory',
          explanation: `Net worth expanded by ${trend.percentageChange ? (trend.percentageChange > 0 ? '+' : '') + trend.percentageChange.toFixed(1) + '%' : 'growth'} compared to previous historical anchor.`,
          sourceMetric: 'NET_WORTH_TREND',
          deterministicReason: `Latest snapshot net worth is greater than previous snapshot`
        });
      } else if (trend.direction === 'DOWN') {
        insights.push({
          id: 'wi-nw-contraction',
          severity: 'WATCH',
          title: 'Net Worth Contraction Detected',
          explanation: `Net worth contracted by ${trend.percentageChange ? trend.percentageChange.toFixed(1) + '%' : 'delta'} compared to previous historical anchor.`,
          sourceMetric: 'NET_WORTH_TREND',
          deterministicReason: `Latest snapshot net worth is lower than previous snapshot`
        });
      }
    } else if (trend.status === 'BASELINE_SET') {
      insights.push({
        id: 'wi-nw-baseline',
        severity: 'INFO',
        title: 'Single Milestone Recorded',
        explanation: 'Initial net worth snapshot is anchored. Capture periodic snapshots or add past entries to measure compounding velocity.',
        sourceMetric: 'SNAPSHOT_COUNT',
        deterministicReason: '1 snapshot recorded; 2+ needed for multi-point trajectory'
      });
    }

    // 5. Data Quality Insight
    if (dataQuality.status === 'NEEDS_ATTENTION') {
      insights.push({
        id: 'wi-data-quality',
        severity: 'WATCH',
        title: 'Incomplete Asset / Liability Metadata',
        explanation: `${dataQuality.missingAssetTypeCount + dataQuality.missingGeographyCount} asset/liability records have missing classification or geography metadata.`,
        sourceMetric: 'DATA_QUALITY_SCORE',
        deterministicReason: `Data quality score (${dataQuality.completenessScore}%) is below 40%`
      });
    }

    return insights;
  }
}
