#!/usr/bin/env node
import { mkdir, readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { Command } from 'commander';
import { HttpJsonRpcClient, SseJsonRpcClient, StdioJsonRpcClient } from './mcp/jsonrpc.js';
import { StdioTransport } from './mcp/transport_stdio.js';
import { Finding, Profile, Report, RpcClient, ToolDescriptor } from './mcp/types.js';
import { writeJsonReport } from './report/json.js';
import { writeMarkdownReport } from './report/markdown.js';
import { writeSarif } from './report/sarif.js';
import { verifyRegistry, lintRegistry, parseRegistry } from './registry/validator.js';
import { tuneFindingsForProfile } from './security/profiles.js';
import { pathTraversalRule } from './security/rules/path_traversal.js';
import { rawArgsRule } from './security/rules/raw_args.js';
import { shellInjectionRule } from './security/rules/shell_injection.js';
import { computeRiskScore } from './security/scorer.js';
import { scanConfigs } from './scan/scanner.js';
import { runCallToolTest } from './tests/contract/call_tool.js';
import { runCancellationTest } from './tests/contract/cancellation.js';
import { runErrorShapesTest } from './tests/contract/error_shapes.js';
import { runLargePayloadTest } from './tests/contract/large_payload.js';
import { runListToolsTest } from './tests/contract/list_tools.js';
import { runTimeoutTest } from './tests/contract/timeout.js';
import { runSchemaLints } from './validate/schema_lints.js';

const program = new Command();

type FailOn = 'off' | 'low' | 'medium' | 'high';

function parseProfile(value: string): Profile {
  if (value === 'default' || value === 'strict' || value === 'paranoid') return value;
  throw new Error(`Invalid profile: ${value}`);
}

function parseFailOn(value: string): FailOn {
  if (value === 'off' || value === 'low' || value === 'medium' || value === 'high') return value;
  throw new Error(`Invalid fail_on value: ${value}`);
}

function shouldFailByPolicy(findings: Finding[], failOn: FailOn): boolean {
  if (failOn === 'off') return false;
  const rank: Record<FailOn, number> = { off: 99, low: 0, medium: 1, high: 2 };
  const severityRank: Record<Finding['severity'], number> = { low: 0, medium: 1, high: 2 };
  return findings.some((finding) => severityRank[finding.severity] >= rank[failOn]);
}

async function buildClient(options: { stdio?: string; http?: string; sse?: string; ssePost?: string; timeoutMs: number; silent?: boolean }): Promise<{ client: RpcClient; target: string; transport: 'stdio' | 'http' | 'sse' }> {
  const selected = [options.stdio, options.http, options.sse].filter(Boolean).length;
  if (selected === 0) throw new Error('One of --stdio, --http, or --sse is required.');
  if (selected > 1) throw new Error('Use only one transport: --stdio, --http, or --sse.');
  if (options.stdio) {
    const transport = new StdioTransport();
    await transport.start({ stdioCommand: options.stdio, silent: options.silent });
    return { client: new StdioJsonRpcClient(transport, options.timeoutMs), target: options.stdio, transport: 'stdio' };
  }
  if (options.http) {
    return { client: new HttpJsonRpcClient(options.http, options.timeoutMs), target: options.http, transport: 'http' };
  }
  return {
    client: new SseJsonRpcClient(options.sse as string, options.timeoutMs, options.ssePost ?? options.sse),
    target: options.sse as string,
    transport: 'sse'
  };
}

async function executeSuite(params: {
  stdio?: string;
  http?: string;
  sse?: string;
  ssePost?: string;
  outDir: string;
  runTests: boolean;
  runAudit: boolean;
  sarif?: string;
  profile: Profile;
  timeoutMs: number;
  failOn: FailOn;
}): Promise<number> {
  const { client, target, transport } = await buildClient({ stdio: params.stdio, http: params.http, sse: params.sse, ssePost: params.ssePost, timeoutMs: params.timeoutMs, silent: false });

  const findings: Finding[] = [];
  let tools: ToolDescriptor[] = [];
  const tests = [];
  let protocolVersion = 'unknown';

  try {
    const init = await client.request<{ protocolVersion?: string }>('initialize', {
      clientInfo: { name: 'mcp-guard', version: '0.3.0' }
    });
    protocolVersion = init.protocolVersion ?? 'unknown';

    const listResult = await runListToolsTest(client);
    tools = listResult.tools;
    if (params.runTests) tests.push(listResult.result);

    if (params.runTests) {
      tests.push(await runCallToolTest(client));
      tests.push(await runErrorShapesTest(client));
      tests.push(await runCancellationTest(client));
      tests.push(await runLargePayloadTest(client));
      tests.push(await runTimeoutTest(client));
    }

    if (params.runAudit) {
      findings.push(...runSchemaLints(tools, params.profile));
      findings.push(...pathTraversalRule(tools));
      findings.push(...shellInjectionRule(tools));
      findings.push(...rawArgsRule(tools));
    }
  } finally {
    await client.close();
  }

  const tunedFindings = tuneFindingsForProfile(findings, params.profile);
  const { score, breakdown } = computeRiskScore(tunedFindings, params.profile);
  const report: Report = {
    server: { target, transport, protocolVersion },
    tools,
    findings: tunedFindings,
    tests,
    score,
    scoreBreakdown: breakdown,
    generatedAt: new Date().toISOString()
  };

  await mkdir(params.outDir, { recursive: true });
  await writeJsonReport(report, params.outDir);
  await writeMarkdownReport(report, params.outDir);
  if (params.sarif) {
    await writeSarif(tunedFindings, params.sarif);
  }

  if (tests.some((t) => !t.passed)) return 2;
  if (shouldFailByPolicy(tunedFindings, params.failOn)) return 2;
  if (tunedFindings.length > 0) return 1;
  return 0;
}

program
  .name('mcp-guard')
  .description('Validate, test, and security-audit MCP servers over STDIO, HTTP JSON-RPC, or SSE + JSON-RPC')
  .showHelpAfterError();

for (const commandName of ['validate', 'test', 'audit'] as const) {
  program.command(commandName)
    .description(`${commandName} an MCP server`) 
    .option('--stdio <cmd>', 'Command used to launch MCP server over stdio')
    .option('--http <url>', 'HTTP JSON-RPC endpoint URL')
    .option('--sse <url>', 'SSE endpoint URL for responses')
    .option('--sse-post <url>', 'HTTP POST URL used to send JSON-RPC requests (defaults to --sse)')
    .option('--out <dir>', 'Output directory', 'reports')
    .option('--sarif <file>', 'SARIF output file (mainly for audit)', 'reports/report.sarif')
    .option('--profile <profile>', 'Rule profile: default|strict|paranoid', parseProfile, 'default')
    .option('--timeout-ms <n>', 'Request timeout in milliseconds', (value) => Number(value), 30000)
    .option('--fail-on <level>', 'Policy threshold: off|low|medium|high', parseFailOn, 'high')
    .action(async (options) => {
      const doTests = commandName === 'test' || commandName === 'audit';
      const doAudit = commandName === 'audit' || commandName === 'validate';
      const code = await executeSuite({
        stdio: options.stdio,
        http: options.http,
        sse: options.sse,
        ssePost: options.ssePost,
        outDir: options.out,
        runTests: doTests,
        runAudit: doAudit,
        sarif: options.sarif,
        profile: options.profile,
        timeoutMs: options.timeoutMs,
        failOn: options.failOn
      });
      process.exit(code);
    });
}

program.command('scan')
  .description('Discover MCP server configs in local files and repositories')
  .option('--repo <path>', 'Repository path to scan for known config files')
  .option('--path <file>', 'Direct config file to parse')
  .option('--format <format>', 'Output format: md|json|sarif', 'md')
  .option('--out <dir>', 'Output directory', 'reports')
  .action(async (options) => {
    const result = await scanConfigs(options.repo, options.path);

    for (const server of result.servers) {
      if (server.transport !== 'stdio' || !server.rawCommand) continue;
      try {
        const { client } = await buildClient({ stdio: server.rawCommand, timeoutMs: 1000, silent: true });
        await client.request('initialize', { clientInfo: { name: 'mcp-guard-scan', version: '0.3.0' } }, 1000);
        const listed = (await client.request<{ tools: ToolDescriptor[] }>('tools/list', undefined, 1000)).tools;
        const localFindings = [
          ...runSchemaLints(listed, 'default'),
          ...pathTraversalRule(listed),
          ...shellInjectionRule(listed),
          ...rawArgsRule(listed)
        ];
        server.reachable = true;
        server.findingsCount = localFindings.length;
        await client.close();
      } catch {
        server.reachable = false;
      }
    }

    const output = {
      generatedAt: new Date().toISOString(),
      scannedPaths: result.scannedPaths,
      servers: result.servers
    };

    await mkdir(options.out, { recursive: true });
    if (options.format === 'json') {
      await writeJsonReport(output, options.out, 'scan_report.json');
    } else if (options.format === 'sarif') {
      await writeSarif([], `${options.out}/scan_report.sarif`);
    } else {
      const pseudoReport = {
        server: { target: options.repo ?? options.path ?? '.', transport: 'stdio' as const },
        tools: [],
        findings: [],
        tests: [],
        score: 100,
        scoreBreakdown: [],
        generatedAt: new Date().toISOString()
      };
      await writeMarkdownReport(pseudoReport, options.out, 'scan_report.md');
      const lines = ['# Scan Report', '', '| Source | Name | Transport | Reachable | Findings | Command |', '| --- | --- | --- | --- | --- | --- |'];
      for (const server of result.servers) {
        lines.push(`| ${server.source} | ${server.name} | ${server.transport} | ${server.reachable ?? false} | ${server.findingsCount ?? '-'} | ${server.command ?? ''} |`);
      }
      await import('node:fs/promises').then((fs) => fs.writeFile(`${options.out}/scan_report.md`, `${lines.join('\n')}\n`, 'utf8'));
    }

    // eslint-disable-next-line no-console
    console.log(`Discovered ${result.servers.length} server definitions`);
    process.exit(0);
  });

const registry = program.command('registry').description('Registry utilities');

registry.command('lint')
  .description('Validate registry schema and metadata')
  .argument('<file>', 'Registry yaml file')
  .action(async (file) => {
    const raw = await readFile(file, 'utf8');
    const issues = lintRegistry(raw);
    if (issues.length === 0) {
      // eslint-disable-next-line no-console
      console.log(`Registry lint ok: ${parseRegistry(raw).length} entries`);
      process.exit(0);
    }
    for (const issue of issues) {
      // eslint-disable-next-line no-console
      console.log(`${issue.severity.toUpperCase()} L${issue.line}: ${issue.message}`);
    }
    process.exit(issues.some((issue) => issue.severity === 'error') ? 2 : 1);
  });

registry.command('score')
  .description('Write local registry scoreboard')
  .argument('<file>', 'Registry yaml file')
  .action(async (file) => {
    const raw = await readFile(file, 'utf8');
    const entries = parseRegistry(raw);
    const rows = ['# Registry Scoreboard', '', '| Server | Score |', '| --- | --- |'];
    for (const entry of entries) {
      const score = entry.permissions && entry.permissions.length > 0 ? 90 : 70;
      rows.push(`| ${String(entry.name ?? basename(file))} | ${score} |`);
    }
    await mkdir('results', { recursive: true });
    await import('node:fs/promises').then((fs) => fs.writeFile('results/scoreboard.md', `${rows.join('\n')}\n`, 'utf8'));
    // eslint-disable-next-line no-console
    console.log('Wrote results/scoreboard.md');
    process.exit(0);
  });

registry.command('verify')
  .description('Offline validation for completeness and unsafe command patterns')
  .argument('<file>', 'Registry yaml file')
  .option('--sample <n>', 'Number of entries to verify', (value) => Number(value), 5)
  .action(async (file, options) => {
    const raw = await readFile(file, 'utf8');
    const issues = verifyRegistry(raw, options.sample);
    if (issues.length === 0) {
      // eslint-disable-next-line no-console
      console.log('Registry verify passed with no issues');
      process.exit(0);
    }
    for (const issue of issues) {
      // eslint-disable-next-line no-console
      console.log(`${issue.severity.toUpperCase()} L${issue.line}: ${issue.message}`);
    }
    process.exit(issues.some((issue) => issue.severity === 'error') ? 2 : 1);
  });

program.parseAsync(process.argv);
