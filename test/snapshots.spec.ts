import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { Finding } from '../src/mcp/types.js';
import { lintRegistry } from '../src/registry/validator.js';
import { writeSarif } from '../src/report/sarif.js';
import { scanConfigs } from '../src/scan/scanner.js';

function buildScanMarkdown(rows: Awaited<ReturnType<typeof scanConfigs>>['servers']): string {
  const lines = [
    '# Scan Report',
    '',
    '| Source | Name | Transport | Reachable | Findings | Command |',
    '| --- | --- | --- | --- | --- | --- |'
  ];
  for (const server of rows) {
    lines.push(`| ${server.source} | ${server.name} | ${server.transport} | false | - | ${server.command ?? ''} |`);
  }
  return `${lines.join('\n')}\n`;
}

describe('golden fixture snapshots', () => {
  let tempDir = '';

  afterEach(async () => {
    if (tempDir) await rm(tempDir, { recursive: true, force: true });
  });

  it('scan markdown snapshot remains stable', async () => {
    const scan = await scanConfigs('fixtures/configs/realistic');
    const actual = buildScanMarkdown(scan.servers);
    const expected = await readFile('fixtures/reports/golden/scan_report.md', 'utf8');
    expect(actual).toBe(expected);
  });

  it('registry SARIF snapshot remains stable', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'mcp-guard-snap-'));
    const output = join(tempDir, 'registry.sarif');

    const raw = `servers:\n  - name: missing\n    repo: local/x\n    transport: stdio\n`;
    const issues = lintRegistry(raw);
    const findings: Finding[] = issues.map((issue) => ({
      severity: issue.severity === 'error' ? 'high' : 'medium',
      ruleId: 'registry.lint',
      message: `${issue.message} (line ${issue.line})`,
      evidence: `line:${issue.line}`,
      remediation: 'Fix registry metadata fields.'
    }));

    await writeSarif(findings, output);
    const actual = JSON.parse(await readFile(output, 'utf8'));
    const expected = JSON.parse(await readFile('fixtures/reports/golden/registry_lint.sarif', 'utf8'));
    expect(actual).toEqual(expected);
  });
});
