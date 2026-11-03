import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { jsonResponse } from '../platform/http/http-response.js';

/**
 * HTTP entrypoint. How modules map to Lambda functions (one handler per module vs. a single
 * handler with internal routing) is a [PENDING DECISION]: see docs/02-arquitetura-proposta.md.
 */
export function handleHttp(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyStructuredResultV2> {
  if (event.requestContext.http.method === 'GET' && event.rawPath === '/health') {
    return Promise.resolve(jsonResponse(200, { status: 'ok' }));
  }
  return Promise.resolve(jsonResponse(404, { error: 'not_found' }));
}
