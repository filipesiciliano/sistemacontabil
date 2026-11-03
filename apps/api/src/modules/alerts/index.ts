import type { ModuleDefinition } from '../../platform/module/module-definition.js';

/** Public API of the `alerts` module. Other modules import only from this file. */
export const alertsModule: ModuleDefinition = {
  name: 'alerts',
  responsibility: 'Predictive alerts during the open competence, starting with Fator R.',
  dependsOn: ['companies', 'periods', 'coverage'],
};
