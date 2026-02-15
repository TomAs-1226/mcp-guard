import { Finding, Profile } from '../mcp/types.js';
import { scoreFindings } from './profiles.js';

export function computeRiskScore(findings: Finding[], profile: Profile): { score: number; breakdown: string[] } {
  return scoreFindings(findings, profile);
}
