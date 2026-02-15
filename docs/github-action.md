# GitHub Action

Use the local composite action to run audits and upload SARIF.

```yaml
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - uses: ./.github/actions/mcp-guard
        with:
          stdio_command: node fixtures/servers/hello-mcp-server/server.cjs
          out_dir: reports
          sarif_path: reports/report.sarif
          fail_on: high
          timeout_ms: 30000
```

SARIF is always uploaded before policy enforcement runs.
