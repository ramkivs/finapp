import { ParsedCsvRow } from '../ImportTypes';

export class CsvRecordParser {
  /**
   * Record-aware CSV parser capable of parsing multiline quoted strings,
   * formula call parentheses =HYPERLINK(...), escaped quotes (""), embedded commas, tabs, and UTF-8 BOM.
   * Automatically locates the table header row by detecting column keyword signatures.
   */
  static parse(csvText: string): { headers: string[]; rows: ParsedCsvRow[] } {
    let cleanText = csvText || '';
    // Strip UTF-8 BOM
    if (cleanText.charCodeAt(0) === 0xfeff) {
      cleanText = cleanText.slice(1);
    }

    const records: string[][] = [];
    let currentRecord: string[] = [];
    let currentField = '';
    let inQuotes = false;
    let inParens = 0;
    let i = 0;

    while (i < cleanText.length) {
      const char = cleanText[i];
      const nextChar = cleanText[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote ("")
          currentField += '"';
          i += 2;
          continue;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
          continue;
        }
      }

      if (char === '(' && !inQuotes) {
        inParens++;
      } else if (char === ')' && !inQuotes) {
        if (inParens > 0) inParens--;
      }

      if (!inQuotes && inParens === 0 && (char === ',' || char === '\t')) {
        currentRecord.push(currentField.trim());
        currentField = '';
        i++;
        continue;
      }

      if (!inQuotes && inParens === 0 && (char === '\r' || char === '\n')) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        currentRecord.push(currentField.trim());
        records.push(currentRecord);
        currentRecord = [];
        currentField = '';
        i++;
        continue;
      }

      // Normal character or character inside quotes / parens
      currentField += char;
      i++;
    }

    if (currentField.length > 0 || currentRecord.length > 0) {
      currentRecord.push(currentField.trim());
      records.push(currentRecord);
    }

    // Filter out completely empty line records
    const nonEmptyRecords = records.filter(rec => rec.some(f => f.length > 0));

    if (nonEmptyRecords.length === 0) {
      return { headers: [], rows: [] };
    }

    // Locate header row by inspecting column signatures (skip title/preamble rows)
    let headerIdx = 0;
    for (let r = 0; r < Math.min(10, nonEmptyRecords.length); r++) {
      const rowLower = nonEmptyRecords[r].map(c => c.toLowerCase());
      const hasDate = rowLower.some(c => c.includes('date'));
      const hasAmountCol = rowLower.some(
        c =>
          c.includes('amount') ||
          c.includes('debit') ||
          c.includes('credit') ||
          c.includes('withdrawal') ||
          c.includes('deposit') ||
          c.includes('balance') ||
          c.includes('val')
      );
      if (hasDate && hasAmountCol) {
        headerIdx = r;
        break;
      }
    }

    const rawHeaders = nonEmptyRecords[headerIdx];
    const headers = rawHeaders.map(h => h.toLowerCase().replace(/^["']|["']$/g, '').trim());

    const rows: ParsedCsvRow[] = [];
    for (let r = headerIdx + 1; r < nonEmptyRecords.length; r++) {
      const rawFields = nonEmptyRecords[r];
      const data: Record<string, string> = {};
      headers.forEach((h, idx) => {
        const val = rawFields[idx] !== undefined ? rawFields[idx].replace(/^["']|["']$/g, '').trim() : '';
        data[h] = val;
      });
      rows.push({
        rowNumber: r + 1,
        data,
        rawFields
      });
    }

    return { headers, rows };
  }
}
