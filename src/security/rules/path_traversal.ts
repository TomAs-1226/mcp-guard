import { Finding, ToolDescriptor } from '../../mcp/types.js';

export function pathTraversalRule(tools: ToolDescriptor[]): Finding[] {
  const findings: Finding[] = [];

  for (const tool of tools) {
    const schema = tool.inputSchema as Record<string, unknown>;
    const properties = (schema.properties ?? {}) as Record<string, unknown>;

    for (const [name, value] of Object.entries(properties)) {
      if (!/(path|file)/i.test(name)) continue;
      const prop = (value ?? {}) as Record<string, unknown>;
      const hasConstraint = 'pattern' in prop || 'enum' in prop;
      if (!hasConstraint) {
        findings.push({
          severity: 'high',
          ruleId: 'security.path_traversal',
          message: `Path-like parameter ${name} on tool ${tool.name} lacks constraints`,
          evidence: JSON.stringify(prop),
          remediation: 'Add strict pattern (allowlist base path) or enum constraints.',
          toolName: tool.name
        });
      }
    }
  }

  return findings;
}
