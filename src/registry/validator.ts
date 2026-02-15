import yaml from 'js-yaml';

export interface RegistryIssue {
  severity: 'error' | 'warning';
  message: string;
  line: number;
}

export interface RegistryEntry {
  name?: string;
  repo?: string;
  transport?: string;
  install?: string;
  run?: string;
  tags?: string[];
  permissions?: string[];
  riskNotes?: string;
  securityNotes?: string;
  [key: string]: unknown;
}

function lineOf(raw: string, needle: string, fromLine = 1): number {
  const lines = raw.split('\n');
  for (let i = Math.max(0, fromLine - 1); i < lines.length; i += 1) {
    if (lines[i].includes(needle)) return i + 1;
  }
  return 1;
}

export function parseRegistry(raw: string): RegistryEntry[] {
  const parsed = yaml.load(raw) as Record<string, unknown>;
  return (parsed?.servers ?? []) as RegistryEntry[];
}

function validRepo(value: string): boolean {
  if (!value.includes(' ')) {
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return /^https?:\/\/[^\s]+$/.test(value);
    }
    return true;
  }
  return false;
}

export function lintRegistry(raw: string): RegistryIssue[] {
  const entries = parseRegistry(raw);
  const issues: RegistryIssue[] = [];
  const seenNames = new Set<string>();
  const allowedFields = new Set(['name', 'repo', 'transport', 'install', 'run', 'tags', 'permissions', 'riskNotes', 'securityNotes']);

  entries.forEach((entry, index) => {
    const anchor = `- name: ${entry.name ?? ''}`;
    const baseLine = lineOf(raw, anchor);
    const required: Array<keyof RegistryEntry> = ['name', 'repo', 'transport', 'install', 'run', 'tags', 'permissions'];
    for (const field of required) {
      if (!entry[field] || (Array.isArray(entry[field]) && (entry[field] as Array<unknown>).length === 0)) {
        issues.push({
          severity: 'error',
          message: `Entry #${index + 1} missing required field: ${field}`,
          line: lineOf(raw, `${String(field)}:`, baseLine)
        });
      }
    }

    if (typeof entry.name === 'string') {
      if (seenNames.has(entry.name)) {
        issues.push({
          severity: 'error',
          message: `Duplicate server name: ${entry.name}`,
          line: baseLine
        });
      }
      seenNames.add(entry.name);
    }

    if (typeof entry.repo === 'string' && !validRepo(entry.repo)) {
      issues.push({
        severity: 'error',
        message: `Entry #${index + 1} has invalid repo value: ${entry.repo}`,
        line: lineOf(raw, 'repo:', baseLine)
      });
    }

    for (const key of Object.keys(entry)) {
      if (!allowedFields.has(key)) {
        issues.push({
          severity: 'warning',
          message: `Entry #${index + 1} has unknown field: ${key}`,
          line: lineOf(raw, `${key}:`, baseLine)
        });
      }
    }

    if (entry.run && /(rm -rf|curl\s+.*\|\s*sh)/i.test(String(entry.run))) {
      issues.push({
        severity: 'warning',
        message: `Entry #${index + 1} run command appears unsafe`,
        line: lineOf(raw, 'run:', baseLine)
      });
    }
  });

  return issues;
}

export function verifyRegistry(raw: string, sample: number): RegistryIssue[] {
  const entries = parseRegistry(raw).slice(0, sample);
  const issues: RegistryIssue[] = [];

  entries.forEach((entry, index) => {
    const baseLine = lineOf(raw, `- name: ${entry.name ?? ''}`);
    if (!entry.riskNotes && !entry.securityNotes) {
      issues.push({
        severity: 'warning',
        message: `Entry #${index + 1} should include riskNotes or securityNotes`,
        line: baseLine
      });
    }
    if (!entry.permissions || entry.permissions.length === 0) {
      issues.push({
        severity: 'warning',
        message: `Entry #${index + 1} should declare permissions`,
        line: lineOf(raw, 'permissions:', baseLine)
      });
    }
  });

  return issues;
}
