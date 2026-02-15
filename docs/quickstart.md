# Quickstart

## No install (npx)

```bash
npx @baichen_yu/mcp-guard audit --stdio "node fixtures/servers/hello-mcp-server/server.cjs" --out reports --fail-on off
```

## Global install

```bash
npm i -g @baichen_yu/mcp-guard
mcp-guard --help
```

## Package note

The npm package is scoped as `@baichen_yu/mcp-guard` to avoid name collisions, while the runtime CLI command stays `mcp-guard`.

For first publish of the scoped package, use:

```bash
npm publish --access public
```

## GitHub Pages docs

1. Enable **Settings → Pages → Source → GitHub Actions** once.
2. Docs deploy from `.github/workflows/deploy-pages.yml`.
3. Expected URL: `https://<owner>.github.io/MCP-shariff/`.

## Remote mode note

Remote mode supports **HTTP JSON-RPC only** (`--http`). SSE is not supported yet.
