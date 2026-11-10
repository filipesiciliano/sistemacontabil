import { describe, expect, it } from 'vitest';
import {
  calculateAssessment,
  type AssessmentInput,
  type CurrentRevenueEntry,
} from '../src/index.js';
import { buildInput, entry, NO_TREATMENTS, revenueFrom } from './support/assessment-builder.js';
import { amount, confirmed, informed } from './support/data-points.js';
import { cnae, competence, money } from '@platform/shared-types';
import { draftRules } from './support/rules.js';

const FULL_HISTORY = revenueFrom(
  '2025-01',
  Array.from({ length: 12 }, () => 50),
);

function assess(entries: readonly CurrentRevenueEntry[], overrides: Partial<AssessmentInput> = {}) {
  return calculateAssessment(
    buildInput(
      {
        competence: '2026-01',
        activityStart: '2020-01',
        taxation: 'annex_iii',
        revenueHistory: FULL_HISTORY,
        currentRevenue: entries,
      },
      overrides,
    ),
    draftRules(),
  );
}

describe('coverage diagnosis', () => {
  it('a plain Annex III service is covered, but not conclusive while rules are under review', () => {
    const result = assess([entry(amount('50000'))]);
    expect(result.coverage.status).toBe('covered');
    expect(result.coverage.missingInputs).toEqual([]);
    expect(result.rulesApproved).toBe(false);
    expect(result.conclusive).toBe(false);
  });

  it('cash regime requires specialist review', () => {
    const result = assess([entry(amount('50000'))], {
      company: {
        activityStart: confirmed(competence('2020-01')),
        simplesNacionalOptant: confirmed(true),
        recognitionRegime: confirmed('cash'),
      },
    });
    expect(result.coverage.status).toBe('specialist_review_required');
  });

  it('Annex IV revenue is partially covered and that entry is not calculated', () => {
    const result = assess(
      [entry(amount('50000')), entry(amount('10000'), { entryId: 'E2', activityId: 'A2' })],
      {
        activities: [
          { activityId: 'A1', cnae: cnae('6201-5/01'), taxation: confirmed('annex_iii') },
          { activityId: 'A2', cnae: cnae('4120-4/00'), taxation: confirmed('annex_iv') },
        ],
      },
    );
    expect(result.coverage.status).toBe('partially_covered');
    expect(result.entries.map((e) => e.outcome)).toEqual(['calculated', 'not_calculated']);
    expect(result.principalComplete).toBe(false);
  });

  it('ISS withheld requires specialist review and the entry is not calculated', () => {
    const result = assess([
      entry(amount('50000'), { treatments: { ...NO_TREATMENTS, issWithheld: true } }),
    ]);
    expect(result.coverage.status).toBe('specialist_review_required');
    expect(result.entries[0]?.outcome).toBe('not_calculated');
  });

  it('ISS due outside the establishment is calculated but only partially covered', () => {
    const result = assess([
      entry(amount('50000'), {
        treatments: { ...NO_TREATMENTS, issDueOutsideEstablishment: true },
      }),
    ]);
    expect(result.coverage.status).toBe('partially_covered');
    expect(result.entries[0]?.outcome).toBe('calculated');
  });

  it('revenue above the sublimit requires specialist review', () => {
    const result = calculateAssessment(
      buildInput({
        competence: '2026-01',
        activityStart: '2020-01',
        taxation: 'annex_iii',
        revenueHistory: revenueFrom(
          '2025-01',
          Array.from({ length: 12 }, () => 310),
        ),
        currentRevenue: [entry(amount('300000'))],
      }),
      draftRules(),
    );
    expect(result.coverage.findings.map((f) => f.operation)).toContain(
      'limit_or_sublimit_exceeded',
    );
    expect(result.coverage.status).toBe('specialist_review_required');
  });

  it('in the start year the proportional sublimit is not covered', () => {
    const result = calculateAssessment(
      buildInput({
        competence: '2026-03',
        activityStart: '2026-01',
        taxation: 'annex_iii',
        revenueHistory: revenueFrom('2026-01', [10, 10]),
        currentRevenue: [entry(amount('10000'))],
      }),
      draftRules('2026-03'),
    );
    expect(result.coverage.status).toBe('partially_covered');
  });

  it('missing activity classification and revenue are listed, never assumed', () => {
    const result = assess([entry({ state: 'missing' })], {
      activities: [{ activityId: 'A1', cnae: cnae('6201-5/01'), taxation: { state: 'missing' } }],
    });
    expect(result.coverage.missingInputs).toContain('activities.A1.taxation');
    expect(result.coverage.missingInputs).toContain('currentRevenue 2026-01');
    expect(result.entries[0]?.outcome).toBe('not_calculated');
  });

  it('informed but unconfirmed data keeps the result provisional', () => {
    const result = assess([entry(informed(money('50000')))]);
    expect(result.unconfirmedInputs).toContain('currentRevenue.E1');
    expect(result.conclusive).toBe(false);
  });
});
