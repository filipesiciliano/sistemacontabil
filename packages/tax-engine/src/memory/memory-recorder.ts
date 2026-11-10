import type { CalculationMemory } from './calculation-memory.js';
import type { CalculationStep } from './calculation-step.js';

/** Collects calculation steps in order. Local to one calculation, so the engine stays pure. */
export class MemoryRecorder {
  private readonly steps: CalculationStep[] = [];

  record(step: CalculationStep): void {
    this.steps.push(step);
  }

  toMemory(): CalculationMemory {
    return { steps: [...this.steps] };
  }
}
