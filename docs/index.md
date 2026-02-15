---
layout: home

hero:
  name: "mcp-guard"
  text: "Practical security gating for MCP servers"
  tagline: "Deterministic MCP validation, contract tests, and audit reporting for local workflows and CI."
  image:
    src: /brand-mark.svg
    alt: mcp-guard
  actions:
    - theme: brand
      text: 30-second quickstart
      link: /quickstart
    - theme: alt
      text: CLI reference
      link: /cli
    - theme: alt
      text: GitHub Action
      link: /github-action

features:
  - icon: 🧪
    title: Deterministic contracts
    details: Fixed checks for tools/list, tool call behavior, invalid shapes, cancellation behavior, large payload handling, and timeouts.
  - icon: 🛡️
    title: Policy gate built-in
    details: Use profiles and --fail-on thresholds to enforce guardrails in CI without custom glue code.
  - icon: 📄
    title: Reproducible outputs
    details: Markdown + JSON + SARIF reports designed for review, snapshots, and code-scanning pipelines.
  - icon: 🚦
    title: Two transport modes
    details: Local stdio and remote HTTP JSON-RPC support with bounded retries and timeouts.
---

> [!IMPORTANT]
> Remote mode currently supports **HTTP JSON-RPC only** (`--http`). SSE is not implemented.

<div class="stats-grid">
  <div class="stat-card"><h4>Profiles</h4><p><code>default</code> · <code>strict</code> · <code>paranoid</code></p></div>
  <div class="stat-card"><h4>Outputs</h4><p><code>report.md</code> · <code>report.json</code> · <code>report.sarif</code></p></div>
  <div class="stat-card"><h4>Policy</h4><p><code>--fail-on off|low|medium|high</code></p></div>
</div>

## Report preview

<div class="report-preview">
<strong>MCP Guard Report</strong><br/>
Risk score: <code>100/100</code><br/>
Key findings: <code>0</code><br/>
Contract tests: <code>6/6</code><br/>
Target: <code>node fixtures/servers/hello-mcp-server/server.cjs (stdio)</code>
</div>

## Architecture

```mermaid
graph LR
  CLI[mcp-guard CLI] --> T[Transports: stdio/http]
  T --> RPC[JSON-RPC]
  RPC --> RULES[Rules + Profiles]
  RULES --> REP[Reports: md/json/sarif]
  REP --> GATE[Policy Gate (--fail-on)]
  GATE --> CI[CI / Code Scanning]
```

## Ship checklist

1. Run `mcp-guard audit` in CI with `--fail-on` policy.
2. Upload SARIF so findings show in security dashboards.
3. Gate merges on reproducible report output.

- GitHub: https://github.com/TomAs-1226/MCP-shariff
- npm: https://www.npmjs.com/package/@baichen_yu/mcp-guard
