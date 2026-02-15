# Release Checklist

1. Freeze CLI/API flags for the target release (new flags go to next patch/minor).
2. Verify packaging metadata in `package.json`:
   - name/version/bin
   - `engines.node`
   - `files` publish allowlist
3. Run full checks:
   - `npm run fixtures:gen`
   - `npm run lint`
   - `npm test`
   - `npm run build`
   - `npm pack --dry-run`
4. Confirm README quickstart and remote transport limitations are accurate.
5. Commit and tag (`vX.Y.Z`).
6. Publish (`npm publish --access public`).
7. Create GitHub release notes with:
   - key highlights
   - “Formerly mcp-doctor” continuity note
   - remote-mode limitation note (HTTP JSON-RPC only, no SSE)
