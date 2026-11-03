import type { UserId } from '../primitives/entity-ids.js';

/**
 * Absence of data is never zero. Every input that feeds a calculation is a DataPoint:
 * - `missing`:   nobody has provided the value yet;
 * - `informed`:  a value exists but was not confirmed (typed, imported or extracted);
 * - `confirmed`: a responsible user confirmed the value; required for definitive conclusions.
 */
export type DataSource = 'manual_entry' | 'spreadsheet_import' | 'document_extraction';

export interface Missing {
  readonly state: 'missing';
}

export interface Informed<T> {
  readonly state: 'informed';
  readonly value: T;
  readonly source: DataSource;
  readonly informedAt: string;
}

export interface Confirmed<T> {
  readonly state: 'confirmed';
  readonly value: T;
  readonly source: DataSource;
  readonly informedAt: string;
  readonly confirmedBy: UserId;
  readonly confirmedAt: string;
}

export type DataPoint<T> = Missing | Informed<T> | Confirmed<T>;

export const MISSING: Missing = { state: 'missing' };

export function hasValue<T>(point: DataPoint<T>): point is Informed<T> | Confirmed<T> {
  return point.state !== 'missing';
}

export function isConfirmed<T>(point: DataPoint<T>): point is Confirmed<T> {
  return point.state === 'confirmed';
}
