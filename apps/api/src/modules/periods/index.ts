import type { ModuleDefinition } from '../../platform/module/module-definition.js';

/** Public API of the `periods` module. Other modules import only from this file. */
export const periodsModule: ModuleDefinition = {
  name: 'periods',
  responsibility:
    'Revenue and payroll history, open competence with partial entries and confirmation of informed data.',
  dependsOn: ['companies'],
};
