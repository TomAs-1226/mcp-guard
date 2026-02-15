import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { StdioJsonRpcClient } from '../src/mcp/jsonrpc.js';
import { StdioTransport } from '../src/mcp/transport_stdio.js';
import { runCallToolTest } from '../src/tests/contract/call_tool.js';
import { runCancellationTest } from '../src/tests/contract/cancellation.js';
import { runErrorShapesTest } from '../src/tests/contract/error_shapes.js';
import { runLargePayloadTest } from '../src/tests/contract/large_payload.js';
import { runListToolsTest } from '../src/tests/contract/list_tools.js';
import { runTimeoutTest } from '../src/tests/contract/timeout.js';

describe('contract suite', () => {
  const transport = new StdioTransport();
  let client: StdioJsonRpcClient;

  beforeEach(async () => {
    await transport.start({ stdioCommand: 'node fixtures/servers/hello-mcp-server/server.cjs' });
    client = new StdioJsonRpcClient(transport, 2000);
    await client.request('initialize', { clientInfo: { name: 'contract', version: '0.1.0' } });
  });

  afterEach(async () => {
    await transport.stop();
  });

  it('passes list tools', async () => {
    const { result } = await runListToolsTest(client);
    expect(result.passed).toBe(true);
  });

  it('passes tool call', async () => {
    const result = await runCallToolTest(client);
    expect(result.passed).toBe(true);
  });

  it('checks error shapes', async () => {
    const result = await runErrorShapesTest(client);
    expect(result.passed).toBe(true);
  });

  it('accepts cancellation not supported behavior', async () => {
    const result = await runCancellationTest(client);
    expect(result.passed).toBe(true);
  });

  it('handles large payloads safely', async () => {
    const result = await runLargePayloadTest(client);
    expect(result.passed).toBe(true);
  });

  it('enforces deterministic timeouts', async () => {
    const result = await runTimeoutTest(client);
    expect(result.passed).toBe(true);
  });
});
