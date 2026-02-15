import { RpcClient, TestResult } from '../../mcp/types.js';

export async function runErrorShapesTest(client: RpcClient): Promise<TestResult> {
  const start = Date.now();
  try {
    await client.request('tools/call', {
      name: 'hello',
      arguments: {}
    });
    return {
      name: 'error_shapes',
      passed: false,
      durationMs: Date.now() - start,
      details: 'Expected an error but call succeeded'
    };
  } catch (error) {
    const normalized = client.normalizeError(error);
    const passed = Number.isInteger(normalized.code) && typeof normalized.message === 'string';
    return {
      name: 'error_shapes',
      passed,
      durationMs: Date.now() - start,
      details: JSON.stringify(normalized)
    };
  }
}
