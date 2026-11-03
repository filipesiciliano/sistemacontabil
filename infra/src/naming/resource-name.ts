/**
 * D11: no product name in infrastructure. Every AWS resource uses the neutral `platform` prefix.
 */
export const RESOURCE_PREFIX = 'platform';

export type DeploymentStage = 'dev' | 'staging' | 'prod';

export function resourceName(stage: DeploymentStage, name: string): string {
  return `${RESOURCE_PREFIX}-${stage}-${name}`;
}
