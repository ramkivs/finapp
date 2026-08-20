export class AmountNormalizer {
  /**
   * Normalizes numeric financial values.
   * Handles Indian comma formatting (1,38,311.58), currency symbols (₹, Rs),
   * whitespace, and coerces blank values to 0.
   */
  static parseAmount(rawVal: string | number | undefined | null): number {
    if (rawVal === undefined || rawVal === null) return 0;
    if (typeof rawVal === 'number') {
      return isNaN(rawVal) ? 0 : rawVal;
    }

    let s = rawVal.trim();
    if (s === '' || s === '-' || s === '0.00' || s === '0') return 0;

    // Remove currency symbols (₹, Rs., INR, Rs)
    s = s.replace(/^(₹|Rs\.?|INR)\s*/i, '');
    s = s.replace(/\s*(₹|Rs\.?|INR)$/i, '');

    // Remove commas (Indian or standard thousands separators: 1,38,311.58 -> 138311.58)
    s = s.replace(/,/g, '');

    const num = parseFloat(s);
    return isNaN(num) ? 0 : num;
  }
}
