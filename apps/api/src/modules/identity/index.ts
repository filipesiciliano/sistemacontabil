import type { ModuleDefinition } from '../../platform/module/module-definition.js';

/** Public API of the `identity` module. Other modules import only from this file. */
export const identityModule: ModuleDefinition = {
  name: 'identity',
  responsibility:
    'Users, the four roles, MFA enforcement for privileged roles and the authorization context of each request.',
  dependsOn: [],
};
