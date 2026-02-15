import { writeFile } from 'node:fs/promises';
import { Finding } from '../mcp/types.js';

function levelForSeverity(severity: Finding['severity']): 'note' | 'warning' | 'error' {
  if (severity === 'high') return 'error';
  if (severity === 'medium') return 'warning';
  return 'note';
}

export async function writeSarif(findings: Finding[], outputFile: string): Promise<void> {
  const sarif = {
    version: '2.1.0',
    $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
    runs: [
      {
        tool: {
          driver: {
            name: 'mcp-guard',
            rules: findings.map((finding) => ({
              id: finding.ruleId,
              shortDescription: { text: finding.message }
            }))
          }
        },
        results: findings.map((finding) => ({
          ruleId: finding.ruleId,
          level: levelForSeverity(finding.severity),
          message: { text: `${finding.message} Remediation: ${finding.remediation}` }
        }))
      }
    ]
  };

  await writeFile(outputFile, JSON.stringify(sarif, null, 2), 'utf8');
}
