/**
 * Every value in the catalog is either DEFINED (with an official source) or an explicit PLACEHOLDER.
 * Rates, brackets and deductions are never typed from memory: until the tax responsibles provide
 * the value and its source, the parameter stays a placeholder and the rule cannot be approved.
 */
export interface Placeholder {
  readonly kind: 'placeholder';
  /** Stable key used to track what is still pending, e.g. `PLACEHOLDER_ANNEX_III_BRACKETS`. */
  readonly key: string;
  /** What is expected from the stakeholders to replace this placeholder. */
  readonly pending: string;
}

export interface Defined<T> {
  readonly kind: 'defined';
  readonly value: T;
}

export type Parameter<T> = Placeholder | Defined<T>;

export function placeholder(key: string, pending: string): Placeholder {
  if (!key.startsWith('PLACEHOLDER_')) {
    throw new Error(`Placeholder keys must start with PLACEHOLDER_: ${key}`);
  }
  return { kind: 'placeholder', key, pending };
}

export function defined<T>(value: T): Defined<T> {
  return { kind: 'defined', value };
}

export function isPlaceholder(candidate: unknown): candidate is Placeholder {
  return (
    typeof candidate === 'object' &&
    candidate !== null &&
    'kind' in candidate &&
    candidate.kind === 'placeholder'
  );
}

/** Collects every placeholder key found anywhere inside a value (deep scan). */
export function collectPlaceholderKeys(candidate: unknown): string[] {
  if (isPlaceholder(candidate)) return [candidate.key];
  if (Array.isArray(candidate)) return candidate.flatMap(collectPlaceholderKeys);
  if (typeof candidate === 'object' && candidate !== null) {
    return Object.values(candidate).flatMap(collectPlaceholderKeys);
  }
  return [];
}
