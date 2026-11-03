import type { ModuleDefinition } from '../../platform/module/module-definition.js';

/** Public API of the `companies` module. Other modules import only from this file. */
export const companiesModule: ModuleDefinition = {
  name: 'companies',
  responsibility:
    'Company registration, establishments, CNAEs with the description of the activity actually performed, and access grants per company.',
  dependsOn: ['identity'],
};
