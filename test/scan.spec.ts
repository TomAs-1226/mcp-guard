import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { scanConfigs } from '../src/scan/scanner.js';

describe('scan config parsing and redaction', () => {
  let dir = '';

  afterEach(async () => {
    if (dir) await rm(dir, { recursive: true, force: true });
  });

  it('redacts token-like values from command fields', async () => {
    dir = await mkdtemp(join(tmpdir(), 'mcp-guard-scan-'));
    const file = join(dir, 'cursor_mcp.json');
    await writeFile(file, JSON.stringify({ mcpServers: { demo: { command: 'node server.js --token=abc123' } } }), 'utf8');

    const result = await scanConfigs(undefined, file);
    expect(result.servers[0].command).toContain('<redacted>');
  });
});
