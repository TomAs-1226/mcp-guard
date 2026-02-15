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
3. Expected URL after repo rename to `mcp-guard`: `https://<owner>.github.io/mcp-guard/`.
4. If the site renders as plain text or a blank page, confirm docs base path is set to `/<repo-name>/`.

## Remote mode note

Remote mode supports **HTTP JSON-RPC** (`--http`) and **SSE** (`--sse`, optional `--sse-post`).


## SSE quick check

```bash
node fixtures/servers/sse-mcp-server/server.cjs
# in another shell
npx @baichen_yu/mcp-guard audit --sse "http://127.0.0.1:4013/sse" --sse-post "http://127.0.0.1:4013/message" --out reports --fail-on off
```
