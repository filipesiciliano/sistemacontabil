import type { ModuleName } from './module-name.js';

export interface ModuleDefinition {
  readonly name: ModuleName;
  /** One-line responsibility; details in the module README. */
  readonly responsibility: string;
  /** Modules whose public API this module may call. */
  readonly dependsOn: readonly ModuleName[];
}
