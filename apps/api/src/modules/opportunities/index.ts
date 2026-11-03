import type { ModuleDefinition } from '../../platform/module/module-definition.js';

/** Public API of the `opportunities` module. Other modules import only from this file. */
export const opportunitiesModule: ModuleDefinition = {
  name: 'opportunities',
  responsibility:
    'Savings opportunities classified as potential, validated and realized; cash deferral kept apart from tax reduction.',
  dependsOn: ['companies', 'periods', 'coverage'],
};
