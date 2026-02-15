# CLI Reference

## Install

```bash
npm i -g @CHANGE_ME/mcp-guard
# or
npx @CHANGE_ME/mcp-guard --help
```

Installed command remains:

```bash
mcp-guard --help
```

## Core commands

- `mcp-guard validate --stdio <cmd>|--http <url> [--profile default|strict|paranoid] [--out reports] [--timeout-ms 30000]`
- `mcp-guard test --stdio <cmd>|--http <url> [--out reports] [--timeout-ms 30000]`
- `mcp-guard audit --stdio <cmd>|--http <url> [--profile ...] [--fail-on off|low|medium|high] [--sarif reports/report.sarif]`

## Scan and registry commands

- `mcp-guard scan [--repo <path>] [--path <file>] [--format md|json|sarif] [--out reports]`
- `mcp-guard registry lint <file>`
- `mcp-guard registry score <file>`
- `mcp-guard registry verify <file> --sample 5`

## Exit codes

- `0`: clean run (or below policy threshold)
- `1`: findings exist, but not policy-failing
- `2`: contract failure, policy failure, or invalid command/config

## Remote transport support

`--http` supports HTTP JSON-RPC (POST) only. SSE is not supported.
