import { Finding, Profile, ToolDescriptor } from '../mcp/types.js';

function asObject(input: unknown): Record<string, unknown> {
  return typeof input === 'object' && input !== null ? (input as Record<string, unknown>) : {};
}

export function runSchemaLints(tools: ToolDescriptor[], profile: Profile): Finding[] {
  const findings: Finding[] = [];

  for (const tool of tools) {
    const schema = asObject(tool.inputSchema);
    const properties = asObject(schema.properties);

    if (!tool.description && profile !== 'default') {
      findings.push({
        severity: 'low',
        ruleId: 'schema.missing_description',
        message: `Tool ${tool.name} is missing a description`,
        evidence: tool.name,
        remediation: 'Add a concise description for tooling and reviewers.',
        toolName: tool.name
      });
    }

    if (Object.keys(properties).length === 0) {
      findings.push({
        severity: 'medium',
        ruleId: 'schema.empty_properties',
        message: `Tool ${tool.name} does not declare input properties`,
        evidence: JSON.stringify(tool.inputSchema),
        remediation: 'Add explicit JSON Schema properties and constraints.',
        toolName: tool.name
      });
    }

    for (const [name, raw] of Object.entries(properties)) {
      const prop = asObject(raw);
      if (prop.type === 'string' && !('maxLength' in prop) && !('enum' in prop) && !('pattern' in prop)) {
        const severity: Finding['severity'] = profile === 'strict' || profile === 'paranoid' ? 'medium' : 'low';
        findings.push({
          severity,
          ruleId: 'schema.unbounded_string',
          message: `Parameter ${name} on tool ${tool.name} is an unconstrained string`,
          evidence: JSON.stringify(prop),
          remediation: 'Add maxLength, enum, or pattern constraints.',
          toolName: tool.name
        });
      }
      if (prop.type === 'array' && !('maxItems' in prop)) {
        findings.push({
          severity: 'medium',
          ruleId: 'schema.unbounded_array',
          message: `Parameter ${name} on tool ${tool.name} is an unbounded array`,
          evidence: JSON.stringify(prop),
          remediation: 'Add maxItems and constrain item values.',
          toolName: tool.name
        });
      }

      if ((profile === 'strict' || profile === 'paranoid') && /(mode|type|kind|format)/i.test(name) && !('enum' in prop)) {
        findings.push({
          severity: 'low',
          ruleId: 'schema.categorical_missing_enum',
          message: `Categorical field ${name} on tool ${tool.name} should use enum`,
          evidence: JSON.stringify(prop),
          remediation: 'Declare explicit enum values for categorical fields.',
          toolName: tool.name
        });
      }
    }
  }

  return findings;
}
