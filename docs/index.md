# mcp-guard

Security auditing and policy gating for MCP servers (local + CI), with deterministic checks and reproducible Markdown/SARIF reports.

> Remote mode currently supports **HTTP JSON-RPC only**. SSE is not implemented.

## Quickstart

```bash
npx @CHANGE_ME/mcp-guard audit --stdio "node fixtures/servers/hello-mcp-server/server.cjs" --out reports --fail-on off
```

## Why teams use it

- Deterministic contract tests and stable outputs
- Profile-based risk posture (`default`, `strict`, `paranoid`)
- SARIF output for GitHub code scanning
- Offline-oriented registry checks

```mermaid
graph LR
  CLI[mcp-guard CLI] --> T[stdio/http]
  T --> RPC[JSON-RPC]
  RPC --> R[Rules + Profiles]
  R --> REP[MD/JSON/SARIF]
  REP --> G[Policy Gate]
  G --> CI[CI & Security Scanning]
```

- GitHub: https://github.com/CHANGE_ME/MCP-doctor
- npm: https://www.npmjs.com/package/@CHANGE_ME/mcp-guard
