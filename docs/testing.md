# Testing options

Use these commands depending on what you want to verify.

## 1) Unit/integration test suite (Vitest)

```bash
npm test
```

Runs the project test suite and regenerates fixtures first (`pretest`).

## 2) TypeScript compile checks (no emit)

```bash
npm run lint
```

Confirms the codebase type-checks cleanly.

## 3) Production build

```bash
npm run build
```

Compiles CLI sources to `dist/`.

## 4) Docs build (GitHub Pages artifact parity)

```bash
npm run docs:build
```

Builds the VitePress static site exactly like the Pages workflow.

## 5) Example end-to-end CLI run

```bash
npx tsx src/cli.ts audit --stdio "node fixtures/servers/hello-mcp-server/server.cjs" --out reports --fail-on off
```

This is a practical smoke test that exercises transport, rules, and report generation.

## Minimal local validation flow

```bash
npm run lint && npm test && npm run build && npm run docs:build
```


## SSE smoke test

```bash
node fixtures/servers/sse-mcp-server/server.cjs
# new terminal
node dist/cli.js audit --sse "http://127.0.0.1:4013/sse" --sse-post "http://127.0.0.1:4013/message" --out reports --fail-on off
```
