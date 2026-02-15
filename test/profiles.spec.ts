import { describe, expect, it } from 'vitest';
import { tuneFindingsForProfile } from '../src/security/profiles.js';
import { computeRiskScore } from '../src/security/scorer.js';

describe('rule profiles', () => {
  it('paranoid profile escalates shell/raw-args findings', () => {
    const findings = [
      { severity: 'medium' as const, ruleId: 'security.raw_args', message: '', evidence: '', remediation: '' }
    ];
    const tuned = tuneFindingsForProfile(findings, 'paranoid');
    expect(tuned[0].severity).toBe('high');
  });

  it('strict profile produces lower score for same findings than default', () => {
    const findings = [
      { severity: 'low' as const, ruleId: 'schema.unbounded_string', message: '', evidence: '', remediation: '' }
    ];
    const defaultScore = computeRiskScore(findings, 'default').score;
    const strictScore = computeRiskScore(findings, 'strict').score;
    expect(strictScore).toBeLessThan(defaultScore);
  });
});
