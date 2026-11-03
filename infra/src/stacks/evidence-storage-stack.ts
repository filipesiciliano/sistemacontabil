import { RemovalPolicy, Stack, type StackProps } from 'aws-cdk-lib';
import { BlockPublicAccess, Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import type { Construct } from 'constructs';
import { resourceName, type DeploymentStage } from '../naming/resource-name.js';

export interface EvidenceStorageStackProps extends StackProps {
  readonly stage: DeploymentStage;
}

/**
 * Evidence documents (PGDAS-D, DAS, receipts). Retention and deletion policy (LGPD) is a
 * [PENDING DECISION] in docs/02-arquitetura-proposta.md; lifecycle rules will be added then.
 */
export class EvidenceStorageStack extends Stack {
  readonly evidenceBucket: Bucket;

  constructor(scope: Construct, id: string, props: EvidenceStorageStackProps) {
    super(scope, id, props);

    this.evidenceBucket = new Bucket(this, 'EvidenceBucket', {
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      versioned: true,
      removalPolicy: props.stage === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      autoDeleteObjects: props.stage !== 'prod',
    });

    this.evidenceBucket.node.addMetadata('logicalName', resourceName(props.stage, 'evidence'));
  }
}
