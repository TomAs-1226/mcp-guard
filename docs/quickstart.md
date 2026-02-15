# Quickstart

## No install (npx)

```bash
npx mcp-guard audit --stdio "node fixtures/servers/hello-mcp-server/server.cjs" --out reports --fail-on off
```

## Global install

```bash
npm i -g mcp-guard
mcp-guard --help
```

## Remote mode note

Remote mode supports **HTTP JSON-RPC only** (`--http`). SSE is not supported yet.
