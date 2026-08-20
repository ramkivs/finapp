import { ImportPipelineService } from '../../ImportPipelineService';

export class NarrationNormalizer {
  /**
   * Normalizes narration strings by merging continuation lines, collapsing internal spaces,
   * trimming whitespace, and applying formula injection security sanitization.
   */
  static normalize(rawNarration: string): string {
    if (!rawNarration) return 'Imported Transaction';

    // Collapse multiple internal spaces / newlines into a single space
    const clean = rawNarration.replace(/\s+/g, ' ').trim();

    // Pass through security sanitization
    return ImportPipelineService.sanitizeCell(clean);
  }
}
