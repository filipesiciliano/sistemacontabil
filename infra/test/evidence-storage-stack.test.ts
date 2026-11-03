import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { describe, expect, it } from 'vitest';
import { resourceName } from '../src/naming/resource-name.js';
import { EvidenceStorageStack } from '../src/stacks/evidence-storage-stack.js';

describe('EvidenceStorageStack', () => {
  const template = Template.fromStack(
    new EvidenceStorageStack(new App(), 'test-stack', { stage: 'prod' }),
  );

  it('creates a private, encrypted and versioned evidence bucket', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketEncryption: {
        ServerSideEncryptionConfiguration: [
          { ServerSideEncryptionByDefault: { SSEAlgorithm: 'AES256' } },
        ],
      },
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
      VersioningConfiguration: { Status: 'Enabled' },
    });
  });

  it('retains evidence in production', () => {
    template.hasResource('AWS::S3::Bucket', { DeletionPolicy: 'Retain' });
  });
});

describe('resourceName', () => {
  it('uses the neutral platform prefix', () => {
    expect(resourceName('dev', 'evidence')).toBe('platform-dev-evidence');
  });
});
