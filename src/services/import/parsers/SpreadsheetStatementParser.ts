import { ParsedCsvRow } from '../ImportTypes';
import { CsvRecordParser } from './CsvRecordParser';
import * as XLSX from 'xlsx';

export class SpreadsheetStatementParser {
  /**
   * Parse a text string (HTML .xls, XML spreadsheet, or CSV fallback).
   * Handles HTML-table based spreadsheet exports (e.g. ICICI/SBI .xls statement downloads).
   */
  static parse(content: string): { headers: string[]; rows: ParsedCsvRow[] } {
    const trimmed = (content || '').trim();

    // Check if content is HTML-table spreadsheet download (contains <table> or <html>)
    if (/<table[^>]*>/i.test(trimmed) || /<html[^>]*>/i.test(trimmed)) {
      return this.parseHtmlTableSpreadsheet(trimmed);
    }

    // Fallback: Delegate to CsvRecordParser for text/csv based spreadsheet exports
    return CsvRecordParser.parse(trimmed);
  }

  /**
   * Parse a native binary XLS or XLSX workbook supplied as a Uint8Array.
   * Uses SheetJS Community Edition 0.20.3 (vendored at vendor/xlsx-0.20.3.tgz).
   * Accepts browser-produced Uint8Array without requiring Node Buffer or filesystem APIs.
   * Returns decoded ParsedCsvRow[] from the first worksheet containing transaction data.
   *
   * Detection is performed by the caller on the returned headers[] — no binary bytes
   * are inspected for content-signature matching.
   */
  static parseBytes(bytes: Uint8Array, fileName: string): { headers: string[]; rows: ParsedCsvRow[]; error?: string } {
    if (!bytes || bytes.length === 0) {
      return { headers: [], rows: [], error: 'Empty or missing binary content' };
    }

    let workbook: XLSX.WorkBook;
    try {
      // SheetJS 0.20.3 accepts Uint8Array directly with type: 'array'
      // This is the browser-safe path — no Node Buffer, no filesystem access
      workbook = XLSX.read(bytes, { type: 'array', cellText: true, cellDates: false });
    } catch (err) {
      return {
        headers: [],
        rows: [],
        error: `Binary workbook parse failed: ${err instanceof Error ? err.message : String(err)}`
      };
    }

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return { headers: [], rows: [], error: 'Workbook contains no worksheets' };
    }

    // Scan sheets for one with transaction-like headers; fall back to first sheet
    let targetSheetName = workbook.SheetNames[0];
    for (const sheetName of workbook.SheetNames) {
      const ws = workbook.Sheets[sheetName];
      if (!ws) continue;
      // Convert to array-of-arrays to inspect headers
      const aoa: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', blankrows: false, raw: false }) as string[][];
      if (aoa.length === 0) continue;
      // Look for a row with date + amount/debit/credit keywords
      for (const row of aoa.slice(0, 10)) {
        const lowerRow = row.map((c: unknown) => String(c).toLowerCase());
        const hasDate = lowerRow.some(c => c.includes('date'));
        const hasAmount = lowerRow.some(
          c =>
            c.includes('amount') ||
            c.includes('debit') ||
            c.includes('credit') ||
            c.includes('withdrawal') ||
            c.includes('deposit') ||
            c.includes('balance')
        );
        if (hasDate && hasAmount) {
          targetSheetName = sheetName;
          break;
        }
      }
    }

    const worksheet = workbook.Sheets[targetSheetName];
    if (!worksheet) {
      return { headers: [], rows: [], error: `Target worksheet "${targetSheetName}" not found` };
    }

    // Convert to array-of-arrays with all cells as strings
    const aoa: string[][] = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      blankrows: false,
      raw: false
    }) as string[][];

    if (aoa.length === 0) {
      return { headers: [], rows: [] };
    }

    // Locate the header row (skip preamble rows)
    let headerIdx = 0;
    for (let r = 0; r < Math.min(10, aoa.length); r++) {
      const rowLower = aoa[r].map(c => String(c).toLowerCase());
      const hasDate = rowLower.some(c => c.includes('date'));
      const hasAmount = rowLower.some(
        c =>
          c.includes('amount') ||
          c.includes('debit') ||
          c.includes('credit') ||
          c.includes('withdrawal') ||
          c.includes('deposit') ||
          c.includes('balance') ||
          c.includes('remarks')
      );
      if (hasDate && hasAmount) {
        headerIdx = r;
        break;
      }
    }

    const rawHeaders = aoa[headerIdx].map(h => String(h).toLowerCase().trim());
    const headers = rawHeaders;

    const rows: ParsedCsvRow[] = [];
    for (let r = headerIdx + 1; r < aoa.length; r++) {
      const rawFields = aoa[r].map(c => String(c));
      const data: Record<string, string> = {};
      headers.forEach((h, idx) => {
        data[h] = rawFields[idx] !== undefined ? rawFields[idx].trim() : '';
      });
      // Skip entirely empty data rows
      if (rawFields.every(f => f.trim() === '')) continue;
      rows.push({
        rowNumber: r + 1,
        data,
        rawFields
      });
    }

    return { headers, rows };
  }

  private static parseHtmlTableSpreadsheet(html: string): { headers: string[]; rows: ParsedCsvRow[] } {
    // Extract rows from <tr> tags
    const rowMatches = html.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
    if (!rowMatches || rowMatches.length === 0) {
      return { headers: [], rows: [] };
    }

    const parsedTable: string[][] = [];

    for (const trHtml of rowMatches) {
      // Extract cell values from <td> or <th>
      const cellMatches = trHtml.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi);
      if (!cellMatches || cellMatches.length === 0) continue;

      const cells = cellMatches.map(cellHtml => {
        return cellHtml
          .replace(/<[^>]+>/g, '')
          .replace(/&nbsp;/gi, ' ')
          .replace(/&amp;/gi, '&')
          .replace(/&lt;/gi, '<')
          .replace(/&gt;/gi, '>')
          .replace(/&quot;/gi, '"')
          .replace(/&#39;/gi, "'")
          .trim();
      });

      if (cells.some(c => c.length > 0)) {
        parsedTable.push(cells);
      }
    }

    if (parsedTable.length === 0) {
      return { headers: [], rows: [] };
    }

    // Locate header row by inspecting column signatures (strip title/preamble rows)
    let headerIdx = 0;
    for (let r = 0; r < Math.min(10, parsedTable.length); r++) {
      const rowLower = parsedTable[r].map(c => c.toLowerCase());
      const hasDate = rowLower.some(c => c.includes('date'));
      const hasAmountCol = rowLower.some(
        c =>
          c.includes('amount') ||
          c.includes('debit') ||
          c.includes('credit') ||
          c.includes('withdrawal') ||
          c.includes('deposit') ||
          c.includes('balance') ||
          c.includes('remarks')
      );
      if (hasDate && hasAmountCol) {
        headerIdx = r;
        break;
      }
    }

    const headers = parsedTable[headerIdx].map(h => h.toLowerCase().replace(/^["']|["']$/g, '').trim());

    const rows: ParsedCsvRow[] = [];
    for (let r = headerIdx + 1; r < parsedTable.length; r++) {
      const rawFields = parsedTable[r];
      const data: Record<string, string> = {};
      headers.forEach((h, idx) => {
        const val = rawFields[idx] !== undefined ? rawFields[idx].trim() : '';
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
