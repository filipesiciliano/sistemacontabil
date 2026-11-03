import { describe, expect, it } from 'vitest';
import {
  addMonths,
  compareCompetences,
  competence,
  competenceRange,
  CompetenceSchema,
} from '../src/index.js';

describe('Competence', () => {
  it('accepts only YYYY-MM', () => {
    expect(CompetenceSchema.safeParse('2026-01').success).toBe(true);
    expect(CompetenceSchema.safeParse('2026-13').success).toBe(false);
    expect(CompetenceSchema.safeParse('2026-1').success).toBe(false);
    expect(CompetenceSchema.safeParse('2026-01-01').success).toBe(false);
  });

  it('adds and subtracts months across year boundaries', () => {
    expect(addMonths(competence('2026-01'), -1)).toBe('2025-12');
    expect(addMonths(competence('2025-12'), 1)).toBe('2026-01');
    expect(addMonths(competence('2026-03'), -12)).toBe('2025-03');
    expect(addMonths(competence('2026-03'), 0)).toBe('2026-03');
  });

  it('compares chronologically', () => {
    expect(compareCompetences(competence('2025-12'), competence('2026-01'))).toBeLessThan(0);
    expect(compareCompetences(competence('2026-01'), competence('2026-01'))).toBe(0);
  });

  it('builds inclusive ranges', () => {
    expect(competenceRange(competence('2025-11'), competence('2026-02'))).toEqual([
      '2025-11',
      '2025-12',
      '2026-01',
      '2026-02',
    ]);
    expect(competenceRange(competence('2026-02'), competence('2026-01'))).toEqual([]);
  });
});
