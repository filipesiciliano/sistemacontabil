import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const REFERENCE_CASES_DIR = join(import.meta.dirname, 'reference-cases');

export interface ReferenceCaseFile {
  readonly fileName: string;
  readonly isTemplate: boolean;
  readonly content: unknown;
}

export function loadReferenceCaseFiles(): ReferenceCaseFile[] {
  return readdirSync(REFERENCE_CASES_DIR)
    .filter((fileName) => fileName.endsWith('.json'))
    .map((fileName) => {
      const content: unknown = JSON.parse(
        readFileSync(join(REFERENCE_CASES_DIR, fileName), 'utf8'),
      );
      return { fileName, isTemplate: fileName.startsWith('_'), content };
    });
}
