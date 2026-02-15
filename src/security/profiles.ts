import { Finding, Profile } from '../mcp/types.js';

const severityPenaltyByProfile: Record<Profile, Record<Finding['severity'], number>> = {
  default: { low: 5, medium: 12, high: 25 },
  strict: { low: 8, medium: 15, high: 28 },
  paranoid: { low: 10, medium: 20, high: 40 }
};

export function scoreFindings(findings: Finding[], profile: Profile): { score: number; breakdown: string[] } {
  const weights = severityPenaltyByProfile[profile];
  const penalties = findings.map((finding) => `${finding.ruleId} (${finding.severity}) -${weights[finding.severity]}`);
  const total = findings.reduce((sum, finding) => sum + weights[finding.severity], 0);
  return {
    score: Math.max(0, 100 - total),
    breakdown: penalties
  };
}

export function tuneFindingsForProfile(findings: Finding[], profile: Profile): Finding[] {
  if (profile === 'paranoid') {
    return findings.map((finding) => {
      if (finding.ruleId === 'security.shell_injection' || finding.ruleId === 'security.raw_args') {
        return { ...finding, severity: 'high' };
      }
      return finding;
    });
  }
  return findings;
}
