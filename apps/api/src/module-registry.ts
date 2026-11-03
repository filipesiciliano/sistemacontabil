import { alertsModule } from './modules/alerts/index.js';
import { collaborationModule } from './modules/collaboration/index.js';
import { companiesModule } from './modules/companies/index.js';
import { coverageModule } from './modules/coverage/index.js';
import { identityModule } from './modules/identity/index.js';
import { opportunitiesModule } from './modules/opportunities/index.js';
import { periodsModule } from './modules/periods/index.js';
import { projectionsModule } from './modules/projections/index.js';
import { reconciliationModule } from './modules/reconciliation/index.js';
import type { ModuleDefinition } from './platform/module/module-definition.js';

export const MODULES: readonly ModuleDefinition[] = [
  identityModule,
  companiesModule,
  periodsModule,
  coverageModule,
  reconciliationModule,
  alertsModule,
  opportunitiesModule,
  collaborationModule,
  projectionsModule,
];
