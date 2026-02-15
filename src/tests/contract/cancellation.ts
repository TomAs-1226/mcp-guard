import { RpcClient, TestResult } from '../../mcp/types.js';

export async function runCancellationTest(client: RpcClient): Promise<TestResult> {
  const start = Date.now();
  try {
    const result = await client.request<{ status?: string }>('tools/cancel', { requestId: 42 });
    return {
      name: 'cancellation_behavior',
      passed: result.status === 'cancelled',
      durationMs: Date.now() - start,
      details: JSON.stringify(result)
    };
  } catch (error) {
    const normalized = client.normalizeError(error);
    const isNotSupported = normalized.code === -32601 || /not supported/i.test(normalized.message);
    return {
      name: 'cancellation_behavior',
      passed: isNotSupported,
      durationMs: Date.now() - start,
      details: isNotSupported ? 'Cancellation not supported by fixture server (accepted)' : JSON.stringify(normalized)
    };
  }
}
