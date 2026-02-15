import { RpcClient, TestResult } from '../../mcp/types.js';

export async function runTimeoutTest(client: RpcClient): Promise<TestResult> {
  const start = Date.now();
  try {
    await client.request('tools/call', {
      name: 'sleep',
      arguments: { ms: 300 }
    }, 30);
    return {
      name: 'deterministic_timeout',
      passed: false,
      durationMs: Date.now() - start,
      details: 'Expected timeout did not occur'
    };
  } catch (error) {
    const normalized = client.normalizeError(error);
    const passed = /timed out|aborted|abort/i.test(normalized.message);
    return {
      name: 'deterministic_timeout',
      passed,
      durationMs: Date.now() - start,
      details: normalized.message
    };
  }
}
