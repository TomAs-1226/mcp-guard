export type JsonRpcId = number;

export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: JsonRpcId;
  method: string;
  params?: unknown;
}

export interface JsonRpcSuccess {
  jsonrpc: '2.0';
  id: JsonRpcId;
  result: unknown;
}

export interface JsonRpcErrorShape {
  code: number;
  message: string;
  data?: unknown;
}

export interface JsonRpcError {
  jsonrpc: '2.0';
  id: JsonRpcId;
  error: JsonRpcErrorShape;
}

export type JsonRpcResponse = JsonRpcSuccess | JsonRpcError;

export interface ToolDescriptor {
  name: string;
  description?: string;
  inputSchema: Record<string, unknown>;
}

export interface ServerConfig {
  stdioCommand?: string;
  httpUrl?: string;
  cwd?: string;
  env?: Record<string, string>;
  timeoutMs?: number;
  silent?: boolean;
}

export type Severity = 'low' | 'medium' | 'high';

export interface Finding {
  severity: Severity;
  ruleId: string;
  message: string;
  evidence: string;
  remediation: string;
  toolName?: string;
}

export interface TestResult {
  name: string;
  passed: boolean;
  durationMs: number;
  details?: string;
}

export interface Report {
  server: {
    target: string;
    transport: 'stdio' | 'http';
    protocolVersion?: string;
  };
  tools: ToolDescriptor[];
  findings: Finding[];
  tests: TestResult[];
  score: number;
  scoreBreakdown: string[];
  generatedAt: string;
}

export interface NormalizedError {
  code: number;
  message: string;
  data?: unknown;
}

export interface RpcClient {
  request<T>(method: string, params?: unknown, timeoutOverrideMs?: number): Promise<T>;
  normalizeError(error: unknown): NormalizedError;
  close(): Promise<void>;
}

export type Profile = 'default' | 'strict' | 'paranoid';
