import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

export interface DiscoveredServer {
  source: 'claude_desktop' | 'cursor';
  path: string;
  name: string;
  transport: 'stdio' | 'http' | 'unknown';
  command?: string;
  rawCommand?: string;
  permissions?: string[];
  reachable?: boolean;
  findingsCount?: number;
}

export interface ScanResult {
  scannedPaths: string[];
  servers: DiscoveredServer[];
}

const knownConfigNames = ['claude_desktop_config.json', 'claude_desktop_config.jsonc', 'cursor_mcp.json', '.cursor/mcp.json'];

function sortServers(servers: DiscoveredServer[]): DiscoveredServer[] {
  return [...servers].sort((a, b) => {
    const bySource = a.source.localeCompare(b.source);
    if (bySource !== 0) return bySource;
    const byName = a.name.localeCompare(b.name);
    if (byName !== 0) return byName;
    return a.path.localeCompare(b.path);
  });
}

function stripComments(content: string): string {
  return content.replace(/^\s*\/\/.*$/gm, '');
}

function redact(text: string): string {
  return text
    .replace(/(token|api[_-]?key|secret)\s*[:=]\s*["']?[^\s"',}]+/gi, '$1=<redacted>')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/g, 'Bearer <redacted>');
}

function detectTransport(server: Record<string, unknown>): 'stdio' | 'http' | 'unknown' {
  if (typeof server.command === 'string') return 'stdio';
  if (typeof server.url === 'string' || typeof server.httpUrl === 'string') return 'http';
  return 'unknown';
}

function extractServers(raw: string, source: DiscoveredServer['source'], path: string): DiscoveredServer[] {
  const content = stripComments(raw);
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(content) as Record<string, unknown>;
  } catch {
    return [];
  }

  const mcpServers = (parsed.mcpServers ?? parsed.servers ?? {}) as Record<string, Record<string, unknown>>;
  return Object.entries(mcpServers).map(([name, value]) => ({
    source,
    path,
    name,
    transport: detectTransport(value),
    rawCommand: typeof value.command === 'string' ? String(value.command) : undefined,
    command: typeof value.command === 'string' ? redact(value.command) : undefined,
    permissions: Array.isArray(value.permissions) ? value.permissions.map((p) => redact(String(p))) : []
  }));
}

export async function scanConfigs(repoPath?: string, directPath?: string): Promise<ScanResult> {
  const scannedPaths: string[] = [];
  const servers: DiscoveredServer[] = [];

  if (directPath) {
    const absolute = resolve(directPath);
    const raw = await readFile(absolute, 'utf8');
    scannedPaths.push(absolute);
    const source = absolute.toLowerCase().includes('cursor') ? 'cursor' : 'claude_desktop';
    servers.push(...extractServers(raw, source, absolute));
    return { scannedPaths: [...scannedPaths].sort(), servers: sortServers(servers) };
  }

  if (!repoPath) {
    return { scannedPaths: [...scannedPaths].sort(), servers: sortServers(servers) };
  }

  const root = resolve(repoPath);
  const queue = [root];
  while (queue.length > 0) {
    const current = queue.shift() as string;
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(current, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '.git') continue;
        queue.push(fullPath);
        continue;
      }
      if (knownConfigNames.some((name) => fullPath.endsWith(name))) {
        const raw = await readFile(fullPath, 'utf8');
        scannedPaths.push(fullPath);
        const source = fullPath.toLowerCase().includes('cursor') ? 'cursor' : 'claude_desktop';
        servers.push(...extractServers(raw, source, fullPath));
      }
    }
  }

  return { scannedPaths: [...scannedPaths].sort(), servers: sortServers(servers) };
}
