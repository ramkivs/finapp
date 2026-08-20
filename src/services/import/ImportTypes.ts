import { Transaction } from '../../domain/types';

export type ImportIssueSeverity = 'INVALID' | 'AMBIGUOUS';

export type ImportIssueCode =
  | 'INVALID_DATE'
  | 'INVALID_AMOUNT'
  | 'MISSING_AMOUNT'
  | 'BOTH_DEBIT_AND_CREDIT_PRESENT'
  | 'ZERO_TRANSACTION'
  | 'UNSUPPORTED_SCHEMA'
  | 'MALFORMED_ROW'
  | 'MULTILINE_RECORD_ERROR'
  | 'UNSUPPORTED_FORMAT'
  | 'BINARY_PARSE_ERROR';

export interface ImportRowIssue {
  rowNumber: number;
  severity: ImportIssueSeverity;
  code: ImportIssueCode;
  message: string;
  field?: string;
  rawValue?: string;
}

export interface BankStatementRecord {
  sourceBank: string;
  transactionDate: string;
  valueDate?: string;
  narration: string;
  referenceNumber?: string;
  debitAmount: number;
  creditAmount: number;
  closingBalance?: number;
  sourceRowNumber: number;
  sourceFile?: string;
  rawRecord?: Record<string, string>;
}

export interface NormalizedBankTransaction {
  candidate: Transaction | null;
  issue?: ImportRowIssue;
}

/**
 * Discriminated union for statement inputs.
 * 'text' carries a decoded string (CSV, TSV, fixed-width, HTML).
 * 'binary' carries raw Uint8Array bytes (actual XLS/XLSX binary workbooks).
 * The representation and kind cannot silently disagree.
 */
export type StatementInput =
  | {
      kind: 'text';
      content: string;
      fileName: string;
      selectedProvider?: string;
    }
  | {
      kind: 'binary';
      content: Uint8Array;
      fileName: string;
      selectedProvider?: string;
    };

export interface DetectionResult {
  matched: boolean;
  formatId: 'hdfc' | 'icici' | 'sbi' | 'generic_csv' | 'unsupported';
  displayName: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  reason: string;
}

export interface ParsedCsvRow {
  rowNumber: number;
  data: Record<string, string>;
  rawFields: string[];
}

export interface BankStatementAdapter {
  readonly id: string;
  readonly displayName: string;

  /**
   * Detect if this adapter can handle the given text-kind StatementInput.
   */
  canHandle(input: StatementInput): DetectionResult;

  /**
   * Detect if this adapter can handle the given binary-originated rows.
   * Eliminates the need for synthetic text reconstruction during format detection.
   */
  canHandleRows(headers: string[], rows: ParsedCsvRow[]): DetectionResult;

  /**
   * Parse a text-kind StatementInput into BankStatementRecords.
   */
  parse(input: StatementInput): BankStatementRecord[];

  /**
   * Parse pre-decoded ParsedCsvRow[] (from binary workbook decoding) into BankStatementRecords.
   * Used by the binary ingestion path so no synthetic CSV reconstruction is needed.
   */
  parseRows(rows: ParsedCsvRow[], fileName: string): BankStatementRecord[];

  normalize(record: BankStatementRecord, context: { provider: string; fileName: string; batchId: string }): NormalizedBankTransaction;
}

export interface CSVImportResult {
  batchId: string;
  totalDetected: number;
  validRows: Transaction[];
  duplicateCount: number;
  ambiguousCount: number;
  invalidCount: number;
  detectedFormatId: string;
  formatDisplayName: string;
  invalidRows: ImportRowIssue[];
  ambiguousRows: ImportRowIssue[];
  unsupportedFormat?: boolean;
}
