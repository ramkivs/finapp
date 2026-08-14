import {
  CashFlowEntry,
  XirrCalculationResult,
  SipCalculationResult,
  SipBreakdownYear,
  LumpsumCalculationResult,
  LumpsumBreakdownYear,
  CagrCalculationResult,
  LoanEmiCalculationResult,
  AmortizationScheduleRow
} from '../domain/types';

export class CalculatorsService {
  /**
   * Calculate Extended Internal Rate of Return (XIRR) using Newton-Raphson with bisection fallback.
   */
  static calculateXirr(cashFlows: CashFlowEntry[]): XirrCalculationResult {
    const validFlows = cashFlows.filter(cf => cf.date && !isNaN(cf.amount) && cf.amount !== 0);

    const totalInvested = validFlows.filter(cf => cf.amount < 0).reduce((s, cf) => s + Math.abs(cf.amount), 0);
    const totalWithdrawn = validFlows.filter(cf => cf.amount > 0).reduce((s, cf) => s + cf.amount, 0);
    const netGain = totalWithdrawn - totalInvested;

    if (validFlows.length < 2) {
      return {
        xirr: 0,
        totalInvested,
        totalWithdrawn,
        currentValue: totalWithdrawn,
        netGain,
        isValid: false,
        error: 'Requires at least two valid cash flows (investment and terminal value).'
      };
    }

    const hasNegative = validFlows.some(cf => cf.amount < 0);
    const hasPositive = validFlows.some(cf => cf.amount > 0);

    if (!hasNegative || !hasPositive) {
      return {
        xirr: 0,
        totalInvested,
        totalWithdrawn,
        currentValue: totalWithdrawn,
        netGain,
        isValid: false,
        error: 'Cash flows must contain both outflows (negative) and inflows/terminal value (positive).'
      };
    }

    // Sort cash flows by date ascending
    const sorted = [...validFlows].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const d0 = new Date(sorted[0].date).getTime();

    const flows = sorted.map(cf => ({
      amount: cf.amount,
      years: (new Date(cf.date).getTime() - d0) / (1000 * 60 * 60 * 24 * 365.25)
    }));

    const npv = (rate: number): number => {
      let sum = 0;
      for (const f of flows) {
        sum += f.amount / Math.pow(1 + rate, f.years);
      }
      return sum;
    };

    const npvDerivative = (rate: number): number => {
      let sum = 0;
      for (const f of flows) {
        sum -= (f.years * f.amount) / Math.pow(1 + rate, f.years + 1);
      }
      return sum;
    };

    // Newton-Raphson Solver
    let rate = 0.1; // initial guess 10%
    const maxIterations = 100;
    const tolerance = 1e-5;
    let converged = false;

    for (let i = 0; i < maxIterations; i++) {
      const fVal = npv(rate);
      const fPrime = npvDerivative(rate);

      if (Math.abs(fVal) < tolerance) {
        converged = true;
        break;
      }

      if (Math.abs(fPrime) < 1e-12) {
        break;
      }

      const nextRate = rate - fVal / fPrime;
      if (nextRate <= -0.9999) {
        rate = (rate - 0.9999) / 2;
      } else {
        rate = nextRate;
      }

      if (Math.abs(rate) > 100) break; // Diverged
    }

    // Fallback: Bisection if Newton-Raphson did not converge
    if (!converged || isNaN(rate)) {
      let low = -0.99;
      let high = 10.0;
      let fLow = npv(low);
      let fHigh = npv(high);

      if (fLow * fHigh <= 0) {
        for (let j = 0; j < 100; j++) {
          const mid = (low + high) / 2;
          const fMid = npv(mid);
          if (Math.abs(fMid) < tolerance) {
            rate = mid;
            converged = true;
            break;
          }
          if (fLow * fMid < 0) {
            high = mid;
            fHigh = fMid;
          } else {
            low = mid;
            fLow = fMid;
          }
        }
      }
    }

    if (!converged || isNaN(rate) || !isFinite(rate)) {
      return {
        xirr: 0,
        totalInvested,
        totalWithdrawn,
        currentValue: totalWithdrawn,
        netGain,
        isValid: false,
        error: 'Unable to converge on a valid annualized rate of return for provided dates and amounts.'
      };
    }

    const roundedXirr = Math.round(rate * 10000) / 100;

    return {
      xirr: roundedXirr,
      totalInvested,
      totalWithdrawn,
      currentValue: totalWithdrawn,
      netGain,
      isValid: true
    };
  }

  /**
   * Calculate Systematic Investment Plan (SIP) returns with optional annual percentage step-up.
   */
  static calculateSip(
    monthlyInvestment: number,
    annualRate: number,
    years: number,
    stepUpPct: number = 0
  ): SipCalculationResult {
    const P0 = Math.max(0, monthlyInvestment);
    const r = Math.max(0, annualRate) / 100;
    const i = r / 12;
    const totalYears = Math.max(1, Math.min(50, Math.round(years)));
    const totalMonths = totalYears * 12;
    const stepUp = Math.max(0, stepUpPct) / 100;

    let currentValue = 0;
    let totalInvested = 0;
    const yearlyBreakdown: SipBreakdownYear[] = [];

    let currentMonthlyP = P0;
    let yearInvested = 0;

    for (let m = 1; m <= totalMonths; m++) {
      const yearIndex = Math.floor((m - 1) / 12) + 1;

      // Apply annual step-up at beginning of new year (m > 1 and month % 12 == 1)
      if (m > 1 && (m - 1) % 12 === 0) {
        currentMonthlyP = currentMonthlyP * (1 + stepUp);
      }

      totalInvested += currentMonthlyP;
      yearInvested += currentMonthlyP;

      // Compounding: monthly investment earns monthly return
      currentValue = (currentValue + currentMonthlyP) * (1 + i);

      // Record year-end snapshot
      if (m % 12 === 0 || m === totalMonths) {
        yearlyBreakdown.push({
          year: yearIndex,
          invested: Math.round(totalInvested),
          value: Math.round(currentValue),
          interestEarned: Math.round(Math.max(0, currentValue - totalInvested)),
          monthlyInstallment: Math.round(currentMonthlyP)
        });
      }
    }

    const finalTotalValue = Math.round(currentValue);
    const finalTotalInvested = Math.round(totalInvested);
    const estimatedReturns = Math.max(0, finalTotalValue - finalTotalInvested);

    return {
      totalInvested: finalTotalInvested,
      estimatedReturns,
      totalValue: finalTotalValue,
      yearlyBreakdown
    };
  }

  /**
   * Calculate Lumpsum Investment compound growth and inflation-adjusted purchasing power.
   */
  static calculateLumpsum(
    principal: number,
    annualRate: number,
    years: number,
    expectedInflation: number = 6.0
  ): LumpsumCalculationResult {
    const P = Math.max(0, principal);
    const r = Math.max(0, annualRate) / 100;
    const t = Math.max(1, Math.min(50, Math.round(years)));
    const infl = Math.max(0, expectedInflation) / 100;

    const yearlyBreakdown: LumpsumBreakdownYear[] = [];

    for (let y = 1; y <= t; y++) {
      const valueAtYear = P * Math.pow(1 + r, y);
      yearlyBreakdown.push({
        year: y,
        invested: Math.round(P),
        value: Math.round(valueAtYear),
        interestEarned: Math.round(Math.max(0, valueAtYear - P))
      });
    }

    const finalValue = Math.round(P * Math.pow(1 + r, t));
    const estimatedReturns = Math.max(0, finalValue - Math.round(P));
    const realPurchasingPower = Math.round(finalValue / Math.pow(1 + infl, t));
    const absoluteGrowthMultiple = P > 0 ? Math.round((finalValue / P) * 100) / 100 : 0;

    return {
      investedAmount: Math.round(P),
      estimatedReturns,
      totalValue: finalValue,
      realPurchasingPower,
      absoluteGrowthMultiple,
      yearlyBreakdown
    };
  }

  /**
   * Calculate Compound Annual Growth Rate (CAGR).
   */
  static calculateCagr(
    initialValue: number,
    finalValue: number,
    years: number
  ): CagrCalculationResult {
    if (initialValue <= 0 || years <= 0 || finalValue < 0) {
      return {
        cagr: 0,
        absoluteGrowthPct: 0,
        multiplier: 0,
        isValid: false,
        error: 'Initial value and period must be greater than zero, and final value must be non-negative.'
      };
    }

    const multiplier = finalValue / initialValue;
    const cagrFraction = Math.pow(multiplier, 1 / years) - 1;
    const cagr = Math.round(cagrFraction * 10000) / 100;
    const absoluteGrowthPct = Math.round(((finalValue - initialValue) / initialValue) * 10000) / 100;

    return {
      cagr,
      absoluteGrowthPct,
      multiplier: Math.round(multiplier * 100) / 100,
      isValid: true
    };
  }

  /**
   * Calculate Loan EMI and generate full monthly & yearly amortization schedule.
   */
  static calculateLoanEmi(
    principal: number,
    annualRate: number,
    tenureMonths: number
  ): LoanEmiCalculationResult {
    const P = Math.max(0, principal);
    const rAnnual = Math.max(0, annualRate);
    const n = Math.max(1, Math.round(tenureMonths));

    if (P === 0 || n === 0) {
      return {
        monthlyEmi: 0,
        totalInterest: 0,
        totalAmount: 0,
        interestPrincipalRatio: 0,
        schedule: []
      };
    }

    const r = rAnnual / (12 * 100);

    let monthlyEmi = 0;
    if (r === 0) {
      monthlyEmi = Math.round(P / n);
    } else {
      monthlyEmi = Math.round(P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
    }

    let balance = P;
    const schedule: AmortizationScheduleRow[] = [];

    for (let m = 1; m <= n; m++) {
      const openingBalance = Math.round(balance);
      const interestComponent = r === 0 ? 0 : Math.round(balance * r);
      const principalComponent = m === n ? openingBalance : Math.min(openingBalance, Math.max(0, monthlyEmi - interestComponent));
      const closingBalance = Math.max(0, openingBalance - principalComponent);

      schedule.push({
        month: m,
        year: Math.floor((m - 1) / 12) + 1,
        openingBalance,
        emi: principalComponent + interestComponent,
        principalComponent,
        interestComponent,
        closingBalance
      });

      balance = closingBalance;
    }

    const totalInterest = schedule.reduce((sum, row) => sum + row.interestComponent, 0);
    const totalAmount = Math.round(P + totalInterest);
    const interestPrincipalRatio = P > 0 ? Math.round((totalInterest / P) * 100) / 100 : 0;

    return {
      monthlyEmi,
      totalInterest,
      totalAmount,
      interestPrincipalRatio,
      schedule
    };
  }
}
