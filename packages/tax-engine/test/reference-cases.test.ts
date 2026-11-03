import { describe, expect, it } from 'vitest';
import { ReferenceCaseSchema } from '../src/index.js';
import { loadReferenceCaseFiles } from './load-reference-cases.js';

const files = loadReferenceCaseFiles();
const cases = files.filter((file) => !file.isTemplate);

describe('reference case fixtures', () => {
  it.each(files.map((file) => [file.fileName, file] as const))(
    '%s follows the agreed format',
    (_name, file) => {
      const parsed = ReferenceCaseSchema.safeParse(file.content);
      expect(parsed.error?.issues ?? []).toEqual([]);
    },
  );

  it('uses the file name as case id', () => {
    for (const file of cases) {
      const parsed = ReferenceCaseSchema.parse(file.content);
      expect(file.fileName).toBe(`${parsed.caseId}.json`);
    }
  });

  it.todo(
    'engine reproduces every approved reference case (awaiting cases from the tax responsibles)',
  );
});
