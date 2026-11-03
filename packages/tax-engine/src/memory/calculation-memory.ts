import type { CalculationStep } from './calculation-step.js';

export interface CalculationMemory {
  readonly steps: readonly CalculationStep[];
}
