import { Finding, ToolDescriptor } from '../../mcp/types.js';

export function shellInjectionRule(tools: ToolDescriptor[]): Finding[] {
  const findings: Finding[] = [];
  for (const tool of tools) {
    const schema = tool.inputSchema as Record<string, unknown>;
    const properties = (schema.properties ?? {}) as Record<string, unknown>;

    for (const [name, value] of Object.entries(properties)) {
      if (!/(args|command|shell)/i.test(name)) continue;
      const prop = (value ?? {}) as Record<string, unknown>;
      if (prop.type === 'string' && !('enum' in prop)) {
        findings.push({
          severity: 'high',
          ruleId: 'security.shell_injection',
          message: `Potential command injection param ${name} on tool ${tool.name}`,
          evidence: JSON.stringify(prop),
          remediation: 'Use enum allowlists and never pass through raw shell commands.',
          toolName: tool.name
        });
      }
    }
  }
  return findings;
}
