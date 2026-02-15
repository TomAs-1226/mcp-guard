import { RpcClient, TestResult } from '../../mcp/types.js';

export async function runCallToolTest(client: RpcClient): Promise<TestResult> {
  const start = Date.now();
  const response = await client.request<{ content: string }>('tools/call', {
    name: 'hello',
    arguments: { name: 'guard' }
  });
  const passed = typeof response.content === 'string' && response.content.includes('guard');
  return {
    name: 'call_tool',
    passed,
    durationMs: Date.now() - start,
    details: passed ? response.content : 'Unexpected response format'
  };
}
