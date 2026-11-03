import { App, Tags } from 'aws-cdk-lib';
import {
  resourceName,
  RESOURCE_PREFIX,
  type DeploymentStage,
} from '../src/naming/resource-name.js';
import { EvidenceStorageStack } from '../src/stacks/evidence-storage-stack.js';

const app = new App();
const stage: DeploymentStage = 'dev';

Tags.of(app).add('project', RESOURCE_PREFIX);
Tags.of(app).add('stage', stage);

new EvidenceStorageStack(app, resourceName(stage, 'evidence-storage'), { stage });
