import type { ModuleDefinition } from '../../platform/module/module-definition.js';

/** Public API of the `collaboration` module. Other modules import only from this file. */
export const collaborationModule: ModuleDefinition = {
  name: 'collaboration',
  responsibility:
    'Accountant invitation, company authorization and the review workflow with owner, dates, comments and conclusion.',
  dependsOn: ['identity', 'companies'],
};
