import type { ModuleDefinition } from '../../platform/module/module-definition.js';

/** Public API of the `projections` module. Other modules import only from this file. */
export const projectionsModule: ModuleDefinition = {
  name: 'projections',
  responsibility:
    'Basic tax projection with explicit assumptions and horizon; every future competence is recalculated.',
  dependsOn: ['companies', 'periods', 'coverage'],
};
