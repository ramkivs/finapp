import { StatementInput, DetectionResult, BankStatementAdapter, ParsedCsvRow } from './ImportTypes';
import { HdfcStatementAdapter } from './adapters/HdfcStatementAdapter';
import { IciciStatementAdapter } from './adapters/IciciStatementAdapter';
import { SbiStatementAdapter } from './adapters/SbiStatementAdapter';
import { GenericCsvAdapter } from './adapters/GenericCsvAdapter';

export class ImportFormatDetector {
  private static adapters: BankStatementAdapter[] = [
    new HdfcStatementAdapter(),
    new IciciStatementAdapter(),
    new SbiStatementAdapter(),
    new GenericCsvAdapter()
  ];

  /**
   * Text-path detection: evaluates text StatementInput content against registered adapters.
   * Performs deterministic content-based multi-indicator signature matching.
   */
  static detect(input: StatementInput): { adapter: BankStatementAdapter | null; detection: DetectionResult } {
    for (const adapter of this.adapters) {
      const detection = adapter.canHandle(input);
      if (detection.matched && detection.confidence !== 'NONE') {
        return { adapter, detection };
      }
    }

    return { adapter: null, detection: this.unsupportedDetection() };
  }

  /**
   * Binary-path detection: evaluates decoded ParsedCsvRow headers against registered adapters.
   * Used after SpreadsheetStatementParser.parseBytes() decodes a native XLS/XLSX binary.
   * Detection operates directly on the decoded column headers via canHandleRows()
   * (no synthetic text reconstruction).
   */
  static detectFromRows(
    headers: string[],
    rows: ParsedCsvRow[],
    fileName: string,
    selectedProvider?: string
  ): { adapter: BankStatementAdapter | null; detection: DetectionResult } {
    for (const adapter of this.adapters) {
      // Skip GenericCsvAdapter for binary — binary XLS/XLSX must be a bank statement
      if (adapter.id === 'generic_csv') continue;

      const detection = adapter.canHandleRows(headers, rows);
      if (detection.matched && detection.confidence !== 'NONE') {
        return { adapter, detection };
      }
    }

    return { adapter: null, detection: this.unsupportedDetection() };
  }

  static getAdapterById(id: string): BankStatementAdapter | null {
    return this.adapters.find(a => a.id === id) || null;
  }

  private static unsupportedDetection(): DetectionResult {
    return {
      matched: false,
      formatId: 'unsupported',
      displayName: 'Unsupported / Unrecognized Statement Format',
      confidence: 'NONE',
      reason: 'File content does not match any recognized bank or generic CSV header signature.'
    };
  }
}
