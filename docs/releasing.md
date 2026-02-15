# Releasing

## Prerequisites

- npm account has access to `@baichen_yu` scope
- GitHub Pages source is set to **GitHub Actions**

## First publish (scoped package)

```bash
npm login
npm run fixtures:gen
npm run lint
npm test
npm run build
npm run docs:build
npm pack --dry-run
npm publish --access public
```

Why `--access public`?
Scoped packages default to private on first publish. Explicitly setting public avoids that surprise.

## Publishing troubleshooting

- Run `npm publish` from the project root (the directory that contains `package.json`).
- If you see `ENOENT` about missing `package.json`, you are in the wrong directory.

## Tag + GitHub Release

```bash
git tag v0.3.0
git push origin v0.3.0
```

Then create a GitHub Release and include:
- key highlights
- migration note (formerly mcp-doctor)
- limitation note (HTTP JSON-RPC only, SSE not supported)
