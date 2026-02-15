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
- transport note (HTTP JSON-RPC + SSE supported)


## Automated release pipeline

On pushes to `main`, `.github/workflows/release.yml` will:

1. Run `npm run lint`, `npm test`, and `npm run build`.
2. Bump patch version via `npm version patch`.
3. Push commit + tag back to GitHub.
4. Publish to npm with provenance.
5. Create GitHub Release with generated release notes.

Required secret: `NPM_TOKEN` with publish permission for `@baichen_yu/mcp-guard`.

Use an **npm Automation token** (recommended) so the workflow can publish without interactive password/OTP prompts.

- npm: create token at <https://www.npmjs.com/settings/tokens>
- GitHub: add it as repository secret `NPM_TOKEN`
- workflow preflight runs `npm whoami` to confirm auth before version bump/publish
