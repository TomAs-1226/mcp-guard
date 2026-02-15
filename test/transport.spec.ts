import { afterEach, describe, expect, it } from 'vitest';
import { StdioJsonRpcClient } from '../src/mcp/jsonrpc.js';
import { StdioTransport } from '../src/mcp/transport_stdio.js';

const command = 'node fixtures/servers/hello-mcp-server/server.cjs';

describe('stdio transport', () => {
  const transport = new StdioTransport();

  afterEach(async () => {
    await transport.stop();
  });

  it('can initialize with fixture server', async () => {
    await transport.start({ stdioCommand: command });
    const client = new StdioJsonRpcClient(transport, 2000);
    const init = await client.request<{ protocolVersion: string }>('initialize', { clientInfo: { name: 'test', version: '0' } });
    expect(init.protocolVersion).toBeTruthy();
  });
});
