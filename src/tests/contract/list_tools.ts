import { RpcClient, ToolDescriptor, TestResult } from '../../mcp/types.js';

export async function runListToolsTest(client: RpcClient): Promise<{ result: TestResult; tools: ToolDescriptor[] }> {
  const start = Date.now();
  const listed = (await client.request<{ tools: ToolDescriptor[] }>('tools/list')).tools;
  const passed = Array.isArray(listed) && listed.length > 0;
  return {
    result: {
      name: 'list_tools',
      passed,
      durationMs: Date.now() - start,
      details: passed ? `Listed ${listed.length} tools` : 'No tools returned'
    },
    tools: listed
  };
}
