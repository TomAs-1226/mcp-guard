---
layout: home

hero:
  name: "mcp-guard"
  text: "Security gating for MCP servers, from local dev to CI"
  tagline: "Validate protocol contracts, test runtime behavior, and enforce policy with reproducible reports."
  image:
    src: /brand-mark.svg
    alt: mcp-guard
  actions:
    - theme: brand
      text: Start in 30 seconds
      link: /quickstart
    - theme: alt
      text: Run tests
      link: /testing
    - theme: alt
      text: CLI reference
      link: /cli

features:
  - icon: 🧪
    title: Deterministic contract checks
    details: Fixed checks for tools/list, tool-call behavior, malformed payloads, cancellation behavior, large responses, and timeout boundaries.
  - icon: 🛡️
    title: Policy gate built-in
    details: Use profile severity and --fail-on thresholds to enforce guardrails in CI without custom glue code.
  - icon: 📄
    title: Reproducible outputs
    details: Generate Markdown + JSON + SARIF artifacts designed for pull-request review and code scanning.
  - icon: 🚦
    title: Three transport modes
    details: Local stdio plus remote HTTP JSON-RPC and SSE support with bounded retries and timeouts.
---

> [!IMPORTANT]
> Remote mode supports **HTTP JSON-RPC** (`--http`) and **SSE** (`--sse`).

<div class="stats-grid">
  <div class="stat-card"><h4>Profiles</h4><p><code>default</code> · <code>strict</code> · <code>paranoid</code></p></div>
  <div class="stat-card"><h4>Outputs</h4><p><code>report.md</code> · <code>report.json</code> · <code>report.sarif</code></p></div>
  <div class="stat-card"><h4>Policy</h4><p><code>--fail-on off|low|medium|high</code></p></div>
</div>

## Typical workflow

<div class="workflow-grid">
  <div class="workflow-card">
    <h4>1) Validate quickly</h4>
    <p>Run checks locally against your MCP server before opening a PR.</p>
    <code>mcp-guard validate --stdio "node server.cjs"</code>
  </div>
  <div class="workflow-card">
    <h4>2) Test behavior</h4>
    <p>Execute deterministic test probes and emit machine-readable reports.</p>
    <code>mcp-guard test --stdio "node server.cjs"</code>
  </div>
  <div class="workflow-card">
    <h4>3) Gate in CI</h4>
    <p>Use <code>audit</code> with SARIF and severity thresholds to block risky changes.</p>
    <code>mcp-guard audit --fail-on medium --sarif reports/report.sarif</code>
  </div>
</div>

## Architecture

```mermaid
graph LR
  CLI[mcp-guard CLI] --> T[Transports: stdio/http/sse]
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

- GitHub: https://github.com/TomAs-1226/mcp-guard
- npm: https://www.npmjs.com/package/@baichen_yu/mcp-guard
