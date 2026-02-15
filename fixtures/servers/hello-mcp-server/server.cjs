#!/usr/bin/env node
const readline = require('node:readline');

const tools = [
  {
    name: 'hello',
    description: 'Greets a user by name',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 64 }
      },
      required: ['name']
    }
  },
  {
    name: 'echo',
    description: 'Echoes text',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', maxLength: 50000 }
      },
      required: ['text']
    }
  },
  {
    name: 'sleep',
    description: 'Sleeps for a bounded number of milliseconds',
    inputSchema: {
      type: 'object',
      properties: {
        ms: { type: 'number', minimum: 0, maximum: 2000 }
      },
      required: ['ms']
    }
  }
];

function respond(id, result) {
  process.stdout.write(`${JSON.stringify({ jsonrpc: '2.0', id, result })}\n`);
}

function respondError(id, code, message, data) {
  process.stdout.write(`${JSON.stringify({ jsonrpc: '2.0', id, error: { code, message, data } })}\n`);
}

const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
rl.on('line', async (line) => {
  let request;
  try {
    request = JSON.parse(line);
  } catch {
    return;
  }

  const { id, method, params } = request;

  if (method === 'initialize') {
    return respond(id, { protocolVersion: '2025-03-26', serverInfo: { name: 'hello-mcp-server', version: '0.3.0' } });
  }

  if (method === 'tools/list') {
    return respond(id, { tools });
  }

  if (method === 'tools/cancel') {
    return respondError(id, -32601, 'Cancellation not supported');
  }

  if (method === 'tools/call') {
    const name = params?.name;
    const args = params?.arguments ?? {};
    if (name === 'hello') {
      if (!args.name || typeof args.name !== 'string') {
        return respondError(id, -32602, 'Invalid params', { field: 'name', expected: 'string' });
      }
      return respond(id, { content: `Hello, ${args.name}!` });
    }
    if (name === 'echo') {
      if (typeof args.text !== 'string') {
        return respondError(id, -32602, 'Invalid params', { field: 'text', expected: 'string' });
      }
      return respond(id, { content: args.text });
    }
    if (name === 'sleep') {
      const duration = Number(args.ms);
      if (!Number.isFinite(duration)) {
        return respondError(id, -32602, 'Invalid params', { field: 'ms', expected: 'number' });
      }
      await new Promise((resolve) => setTimeout(resolve, duration));
      return respond(id, { content: `Slept ${duration}ms` });
    }
    return respondError(id, -32601, `Unknown tool: ${name}`);
  }

  respondError(id, -32601, `Unknown method: ${method}`);
});
