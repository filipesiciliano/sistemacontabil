import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { describe, expect, it } from 'vitest';
import { handleHttp } from '../../src/entrypoints/http-handler.js';

function httpEvent(method: string, path: string): APIGatewayProxyEventV2 {
  return {
    version: '2.0',
    routeKey: '$default',
    rawPath: path,
    rawQueryString: '',
    headers: {},
    isBase64Encoded: false,
    requestContext: {
      accountId: 'test',
      apiId: 'test',
      domainName: 'localhost',
      domainPrefix: 'localhost',
      requestId: 'request-1',
      routeKey: '$default',
      stage: '$default',
      time: '03/Nov/2026:12:00:00 +0000',
      timeEpoch: 0,
      http: { method, path, protocol: 'HTTP/1.1', sourceIp: '127.0.0.1', userAgent: 'vitest' },
    },
  };
}

describe('handleHttp', () => {
  it('answers the health check', async () => {
    const response = await handleHttp(httpEvent('GET', '/health'));
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(JSON.stringify({ status: 'ok' }));
  });

  it('returns 404 for unknown routes', async () => {
    expect((await handleHttp(httpEvent('GET', '/unknown'))).statusCode).toBe(404);
  });
});
