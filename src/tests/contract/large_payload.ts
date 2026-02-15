import { RpcClient, TestResult } from '../../mcp/types.js';

export async function runLargePayloadTest(client: RpcClient): Promise<TestResult> {
  const start = Date.now();
  const text = 'x'.repeat(50_000);
  const response = await client.request<{ content: string }>('tools/call', {
    name: 'echo',
    arguments: { text }
  }, 3000);

  const passed = response.content.length === text.length;
  return {
    name: 'large_payload',
    passed,
    durationMs: Date.now() - start,
    details: `echoed_length=${response.content.length}`
  };
}
