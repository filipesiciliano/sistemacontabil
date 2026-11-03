/** Scope (abrangência) of a rule: which regime, annexes and situations it applies to. */
export interface RuleScope {
  readonly regime: 'simples_nacional';
  readonly annexes: readonly string[];
  readonly description: string;
}
