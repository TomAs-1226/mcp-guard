import { Finding, ToolDescriptor } from '../../mcp/types.js';

export function rawArgsRule(tools: ToolDescriptor[]): Finding[] {
  const findings: Finding[] = [];
  for (const tool of tools) {
    const schema = tool.inputSchema as Record<string, unknown>;
    const properties = (schema.properties ?? {}) as Record<string, unknown>;

    for (const [name, value] of Object.entries(properties)) {
      if (!/(argv|flags)/i.test(name)) continue;
      const prop = (value ?? {}) as Record<string, unknown>;
      const items = (prop.items ?? {}) as Record<string, unknown>;
      if (prop.type === 'array' && items.type === 'string' && !('enum' in items) && !('maxItems' in prop)) {
        findings.push({
          severity: 'medium',
          ruleId: 'security.raw_args',
          message: `Raw CLI args array ${name} on tool ${tool.name} is unbounded`,
          evidence: JSON.stringify(prop),
          remediation: 'Constrain allowed values and maxItems for argv/flags arrays.',
          toolName: tool.name
        });
      }
    }
  }
  return findings;
}
