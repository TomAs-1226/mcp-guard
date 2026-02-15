# Quickstart

## No install (npx)

```bash
npx @CHANGE_ME/mcp-guard audit --stdio "node fixtures/servers/hello-mcp-server/server.cjs" --out reports --fail-on off
```

## Global install

```bash
npm i -g @CHANGE_ME/mcp-guard
mcp-guard --help
```

## GitHub Pages docs

1. Enable **Settings → Pages → Source → GitHub Actions** once.
2. Docs deploy from `.github/workflows/deploy-pages.yml`.
3. Expected URL: `https://<owner>.github.io/MCP-doctor/`.

## Remote mode note

Remote mode supports **HTTP JSON-RPC only** (`--http`). SSE is not supported yet.
