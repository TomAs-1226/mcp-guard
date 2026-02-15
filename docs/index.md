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

- GitHub: https://github.com/CHANGE_ME/MCP-doctor
- npm: https://www.npmjs.com/package/@CHANGE_ME/mcp-guard
