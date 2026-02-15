import { ChildProcessWithoutNullStreams, spawn } from 'node:child_process';
import { once } from 'node:events';
import { ServerConfig } from './types.js';

export class StdioTransport {
  private proc: ChildProcessWithoutNullStreams | null = null;
  private buffer = '';
  private listeners: Array<(line: string) => void> = [];

  async start(config: ServerConfig): Promise<void> {
    if (this.proc) {
      throw new Error('Transport already started');
    }
    if (!config.stdioCommand) {
      throw new Error('stdioCommand is required for StdioTransport');
    }
    const env = { ...process.env, ...(config.env ?? {}) };
    const proc = spawn(config.stdioCommand, {
      cwd: config.cwd,
      env,
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    this.proc = proc;

    proc.stdout.on('data', (chunk: Buffer) => {
      this.buffer += chunk.toString('utf8');
      let idx = this.buffer.indexOf('\n');
      while (idx >= 0) {
        const line = this.buffer.slice(0, idx).trim();
        this.buffer = this.buffer.slice(idx + 1);
        if (line) {
          this.listeners.forEach((cb) => cb(line));
        }
        idx = this.buffer.indexOf('\n');
      }
    });

    proc.stderr.on('data', (chunk) => {
      const message = chunk.toString('utf8').trim();
      if (!config.silent && message.length > 0) {
        // eslint-disable-next-line no-console
        console.error(`[server stderr] ${message}`);
      }
    });

    proc.once('exit', (code, signal) => {
      if (!config.silent && code !== 0 && signal !== 'SIGTERM') {
        // eslint-disable-next-line no-console
        console.error(`Server exited unexpectedly (code=${code}, signal=${signal})`);
      }
    });

    await once(proc, 'spawn');
  }

  onLine(cb: (line: string) => void): void {
    this.listeners.push(cb);
  }

  send(line: string): void {
    if (!this.proc) {
      throw new Error('Transport not started');
    }
    this.proc.stdin.write(`${line}\n`);
  }

  async stop(): Promise<void> {
    if (!this.proc) {
      return;
    }
    const proc = this.proc;
    this.proc = null;
    proc.kill('SIGTERM');
    const timeout = setTimeout(() => proc.kill('SIGKILL'), 1000);
    await once(proc, 'exit').catch(() => undefined);
    clearTimeout(timeout);
  }
}
