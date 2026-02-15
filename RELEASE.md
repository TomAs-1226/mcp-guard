# Release Checklist

1. Freeze CLI/API flags for the target release.
2. Set npm scope in `package.json` (`@<scope>/mcp-guard`) and verify package metadata.
3. Run full checks:
   - `npm run fixtures:gen`
   - `npm run lint`
   - `npm test`
   - `npm run build`
   - `npm run docs:build`
   - `npm pack --dry-run`
4. First scoped publish:
   - `npm publish --access public`
5. Tag + release:
   - `git tag v0.3.0`
   - `git push origin v0.3.0`
6. Create GitHub Release notes with:
   - highlights
   - migration note (“formerly mcp-doctor”)
   - limitation note (HTTP JSON-RPC only; no SSE)
7. Confirm docs site is live on GitHub Pages.
