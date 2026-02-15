# mcp-guard

[![CI](https://img.shields.io/github/actions/workflow/status/CHANGE_ME/MCP-doctor/ci.yml?label=CI)](./.github/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/%40CHANGE_ME%2Fmcp-guard)](https://www.npmjs.com/package/@CHANGE_ME/mcp-guard)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Security auditing and policy gating for MCP servers (local + CI), with deterministic tests and Markdown/SARIF outputs.

> Formerly **mcp-doctor**.

> [!IMPORTANT]
> Remote mode supports **HTTP JSON-RPC only** (`--http`). SSE is not implemented.

## Package name

- npm package: `@CHANGE_ME/mcp-guard` (scoped to avoid name collisions)
- CLI command after install: `mcp-guard`
- first scoped publish: `npm publish --access public`

## 30-second quickstart

### A) No install (npx)

```bash
npx @CHANGE_ME/mcp-guard audit --stdio "node fixtures/servers/hello-mcp-server/server.cjs" --out reports --fail-on off
```

### B) Global install

```bash
npm i -g @CHANGE_ME/mcp-guard
mcp-guard --help
```

### C) GitHub Action (paste into workflow)

```yaml
jobs:
  mcp-audit:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
      actions: read
      contents: read
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - uses: ./.github/actions/mcp-guard
        with:
          stdio_command: node fixtures/servers/hello-mcp-server/server.cjs
          fail_on: high
```

## Report preview

```text
# MCP Guard Report
- Risk score: 100/100
- Key findings: 0
- Contract tests: 6/6
- Target: node fixtures/servers/hello-mcp-server/server.cjs (stdio)
```

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

## Commands

```bash
mcp-guard validate --stdio "node server.cjs" --profile default --out reports
mcp-guard test --stdio "node server.cjs" --out reports
mcp-guard audit --stdio "node server.cjs" --profile strict --fail-on medium --sarif reports/report.sarif
mcp-guard audit --http "http://127.0.0.1:4010" --timeout-ms 30000 --fail-on off
mcp-guard scan --repo . --format md --out reports
mcp-guard registry lint registry/servers.yaml
mcp-guard registry verify registry/servers.yaml --sample 5
mcp-guard registry score registry/servers.yaml
```

## Docs site (GitHub Pages)

- Docs URL pattern: `https://<owner>.github.io/MCP-doctor/`
- One-time setup: GitHub repo **Settings → Pages → Source → GitHub Actions**
- Deploy workflow: `.github/workflows/deploy-pages.yml`

## Links

- Docs: https://CHANGE_ME.github.io/MCP-doctor/
- GitHub: https://github.com/CHANGE_ME/MCP-doctor
- npm: https://www.npmjs.com/package/@CHANGE_ME/mcp-guard

## Troubleshooting

- Node `>=20` required
- On Windows, wrap `--stdio` command in double quotes
- If startup is slow, increase `--timeout-ms`
- HTTP target must accept JSON-RPC over POST

## Releasing

See [`docs/releasing.md`](docs/releasing.md) and [`RELEASE.md`](RELEASE.md).

## License

MIT. See [`LICENSE`](LICENSE).
