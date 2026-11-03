import { describe, expect, it } from 'vitest';
import { mostRestrictiveCoverage } from '../src/index.js';

describe('mostRestrictiveCoverage', () => {
  it('is covered only when nothing restricts it', () => {
    expect(mostRestrictiveCoverage([])).toBe('covered');
    expect(mostRestrictiveCoverage(['covered', 'covered'])).toBe('covered');
  });

  it('returns the most restrictive status', () => {
    expect(mostRestrictiveCoverage(['covered', 'partially_covered'])).toBe('partially_covered');
    expect(
      mostRestrictiveCoverage(['specialist_review_required', 'partially_covered', 'covered']),
    ).toBe('specialist_review_required');
  });
});
