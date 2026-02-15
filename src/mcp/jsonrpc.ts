import { StdioTransport } from './transport_stdio.js';
import { JsonRpcError, JsonRpcRequest, JsonRpcResponse, JsonRpcSuccess, NormalizedError, RpcClient } from './types.js';

interface Pending {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  timer: NodeJS.Timeout;
}

export class StdioJsonRpcClient implements RpcClient {
  private nextId = 1;
  private pending = new Map<number, Pending>();

  constructor(private readonly transport: StdioTransport, private readonly timeoutMs = 5000) {
    this.transport.onLine((line) => this.handleLine(line));
  }

  async request<T>(method: string, params?: unknown, timeoutOverrideMs?: number): Promise<T> {
    const id = this.nextId++;
    const payload: JsonRpcRequest = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };

    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Request timed out: ${method}`));
      }, timeoutOverrideMs ?? this.timeoutMs);

      this.pending.set(id, { resolve: resolve as (value: unknown) => void, reject, timer });
      this.transport.send(JSON.stringify(payload));
    });
  }

  normalizeError(error: unknown): NormalizedError {
    return normalizeError(error);
  }

  async close(): Promise<void> {
    await this.transport.stop();
  }

  private handleLine(line: string): void {
    let parsed: JsonRpcResponse;
    try {
      parsed = JSON.parse(line) as JsonRpcResponse;
    } catch {
      return;
    }

    const pending = this.pending.get(parsed.id);
    if (!pending) {
      return;
    }

    clearTimeout(pending.timer);
    this.pending.delete(parsed.id);

    if ('error' in parsed) {
      const err = (parsed as JsonRpcError).error;
      pending.reject(err);
      return;
    }

    pending.resolve((parsed as JsonRpcSuccess).result);
  }
}

export class HttpJsonRpcClient implements RpcClient {
  private nextId = 1;

  constructor(private readonly url: string, private readonly timeoutMs = 5000) {}

  async request<T>(method: string, params?: unknown, timeoutOverrideMs?: number): Promise<T> {
    const id = this.nextId++;
    const payload: JsonRpcRequest = { jsonrpc: '2.0', id, method, params };
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutOverrideMs ?? this.timeoutMs);
      try {
        const response = await fetch(this.url, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        const parsed = (await response.json()) as JsonRpcResponse;
        if ('error' in parsed) {
          throw parsed.error;
        }
        return (parsed as JsonRpcSuccess).result as T;
      } catch (error) {
        if (attempt === maxAttempts || !(error instanceof Error) || !error.message.includes('fetch')) {
          throw error;
        }
        const backoff = 50 * 2 ** (attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, backoff));
      } finally {
        clearTimeout(timeout);
      }
    }

    throw new Error('Unreachable retry state');
  }

  normalizeError(error: unknown): NormalizedError {
    return normalizeError(error);
  }

  async close(): Promise<void> {
    await Promise.resolve();
  }
}

export function normalizeError(error: unknown): NormalizedError {
  if (typeof error === 'object' && error !== null && 'code' in error && 'message' in error) {
    const err = error as Record<string, unknown>;
    return {
      code: Number(err.code),
      message: String(err.message),
      data: err.data
    };
  }
  if (error instanceof Error) {
    return {
      code: -32000,
      message: error.message
    };
  }
  return {
    code: -32001,
    message: 'Unknown error',
    data: error
  };
}
