import type { ModuleDefinition } from '../../platform/module/module-definition.js';

/** Public API of the `reconciliation` module. Other modules import only from this file. */
export const reconciliationModule: ModuleDefinition = {
  name: 'reconciliation',
  responsibility:
    'Comparison between the manually typed PGDAS-D and the engine result, with principal and additions separated.',
  dependsOn: ['companies', 'periods', 'coverage'],
};
