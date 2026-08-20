export class DateNormalizer {
  /**
   * Normalizes source date formats (DD/MM/YY, DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY, DD.MM.YYYY)
   * into canonical ISO string YYYY-MM-DD. Returns null if date is unparseable or invalid.
   */
  static normalize(rawDate: string): string | null {
    if (!rawDate) return null;
    const str = rawDate.trim();

    // Standard ISO format: YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      return str;
    }

    // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
    const ddmmyyyyMatch = str.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})$/);
    if (ddmmyyyyMatch) {
      const day = ddmmyyyyMatch[1].padStart(2, '0');
      const month = ddmmyyyyMatch[2].padStart(2, '0');
      const year = ddmmyyyyMatch[3];
      return `${year}-${month}-${day}`;
    }

    // DD/MM/YY or DD-MM-YY or DD.MM.YY
    const ddmmyyMatch = str.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{2})$/);
    if (ddmmyyMatch) {
      const day = ddmmyyMatch[1].padStart(2, '0');
      const month = ddmmyyMatch[2].padStart(2, '0');
      const yy = parseInt(ddmmyyMatch[3], 10);
      const year = yy >= 70 ? `19${ddmmyyMatch[3]}` : `20${ddmmyyMatch[3]}`;
      return `${year}-${month}-${day}`;
    }

    // YYYY/MM/DD
    const yyyymmddMatch = str.match(/^(\d{4})[\/\.-](\d{1,2})[\/\.-](\d{1,2})$/);
    if (yyyymmddMatch) {
      const year = yyyymmddMatch[1];
      const month = yyyymmddMatch[2].padStart(2, '0');
      const day = yyyymmddMatch[3].padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    return null;
  }
}
