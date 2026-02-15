# Releasing

> Replace `CHANGE_ME` with your npm/GitHub scope before first publish.

## Prerequisites

- npm account has access to `@CHANGE_ME` scope
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

## Tag + GitHub Release

```bash
git tag v0.3.0
git push origin v0.3.0
```

Then create a GitHub Release and include:
- key highlights
- migration note (formerly mcp-doctor)
- limitation note (HTTP JSON-RPC only, SSE not supported)
