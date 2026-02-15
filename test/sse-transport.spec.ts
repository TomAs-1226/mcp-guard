import { spawn } from 'node:child_process';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SseJsonRpcClient } from '../src/mcp/jsonrpc.js';
import { runListToolsTest } from '../src/tests/contract/list_tools.js';

describe('sse transport', () => {
  let proc: ReturnType<typeof spawn>;

  beforeEach(async () => {
    proc = spawn('node fixtures/servers/sse-mcp-server/server.cjs', {
      shell: true,
      env: { ...process.env, PORT: '4013' },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    await new Promise((resolve) => setTimeout(resolve, 150));
  });

  afterEach(async () => {
    proc.kill('SIGTERM');
    await new Promise((resolve) => setTimeout(resolve, 50));
  });

  it('can execute initialize and list tools over SSE', async () => {
    const client = new SseJsonRpcClient('http://127.0.0.1:4013/sse', 1500, 'http://127.0.0.1:4013/message');
    const init = await client.request<{ protocolVersion: string }>('initialize');
    expect(init.protocolVersion).toBeTruthy();
    const { result } = await runListToolsTest(client);
    expect(result.passed).toBe(true);
    await client.close();
  });
});
