import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Report } from '../mcp/types.js';

export async function writeMarkdownReport(report: Report, outDir: string, fileName = 'report.md'): Promise<string> {
  await mkdir(outDir, { recursive: true });
  const output = join(outDir, fileName);

  const passedTests = report.tests.filter((t) => t.passed).length;
  const passRate = report.tests.length === 0 ? 'n/a' : `${passedTests}/${report.tests.length}`;

  const lines: string[] = [];
  lines.push('# MCP Guard Report');
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- **Risk score:** ${report.score}/100`);
  lines.push(`- **Key findings:** ${report.findings.length}`);
  lines.push(`- **Contract tests:** ${passRate}`);
  lines.push(`- **Generated:** ${report.generatedAt}`);
  lines.push(`- **Target:** \`${report.server.target}\` (${report.server.transport})`);
  lines.push('');

  lines.push('## Tool Inventory');
  lines.push('');
  lines.push('| Name | Description |');
  lines.push('| --- | --- |');
  for (const tool of report.tools) {
    lines.push(`| ${tool.name} | ${tool.description ?? ''} |`);
  }
  lines.push('');

  lines.push('## Findings by Severity');
  lines.push('');
  for (const severity of ['high', 'medium', 'low'] as const) {
    const group = report.findings.filter((finding) => finding.severity === severity);
    lines.push(`### ${severity.toUpperCase()} (${group.length})`);
    if (group.length === 0) {
      lines.push('- None');
    } else {
      for (const finding of group) {
        lines.push(`- **${finding.ruleId}**: ${finding.message}`);
        lines.push(`  - Remediation: ${finding.remediation}`);
      }
    }
    lines.push('');
  }

  lines.push('## Contract Test Results');
  lines.push('');
  for (const test of report.tests) {
    lines.push(`- ${test.passed ? '✅' : '❌'} ${test.name} (${test.durationMs} ms): ${test.details ?? ''}`);
  }
  lines.push('');

  lines.push('## Explain Score');
  lines.push('');
  if (report.scoreBreakdown.length === 0) {
    lines.push('- No penalties applied.');
  } else {
    for (const item of report.scoreBreakdown) {
      lines.push(`- ${item}`);
    }
  }

  await writeFile(output, `${lines.join('\n')}\n`, 'utf8');
  return output;
}
