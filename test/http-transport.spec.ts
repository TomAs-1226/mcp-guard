import { spawn } from 'node:child_process';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HttpJsonRpcClient } from '../src/mcp/jsonrpc.js';
import { runListToolsTest } from '../src/tests/contract/list_tools.js';

describe('http transport', () => {
  let proc: ReturnType<typeof spawn>;

  beforeEach(async () => {
    proc = spawn('node fixtures/servers/http-mcp-server/server.cjs', {
      shell: true,
      env: { ...process.env, PORT: '4012' },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    await new Promise((resolve) => setTimeout(resolve, 150));
  });

  afterEach(async () => {
    proc.kill('SIGTERM');
    await new Promise((resolve) => setTimeout(resolve, 50));
  });

  it('can execute initialize and list tools over HTTP', async () => {
    const client = new HttpJsonRpcClient('http://127.0.0.1:4012', 1500);
    const init = await client.request<{ protocolVersion: string }>('initialize');
    expect(init.protocolVersion).toBeTruthy();
    const { result } = await runListToolsTest(client);
    expect(result.passed).toBe(true);
  });
});
