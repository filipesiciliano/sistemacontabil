/**
 * One step of the calculation memory: enough for an accountant to reproduce the value by hand.
 * All numeric values are decimal strings to keep the memory serializable without precision loss.
 */
export interface CalculationStep {
  readonly stepId: string;
  /** Human explanation key in the pt-BR dictionary. */
  readonly descriptionKey: string;
  /** Formula in readable notation, e.g. "(RBT12 × nominal rate − deduction) ÷ RBT12". */
  readonly formula: string;
  readonly inputs: Readonly<Record<string, string>>;
  readonly result: string;
  /** Rule version applied in this step, e.g. "simples-nacional.factor-r@v1". */
  readonly ruleRef?: string;
  readonly rounding?: string;
}
