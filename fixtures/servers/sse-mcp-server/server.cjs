#!/usr/bin/env node
const http = require('node:http');

const port = Number(process.env.PORT || 4013);
const clients = new Set();

const tools = [
  {
    name: 'hello',
    description: 'Greets a user by name',
    inputSchema: {
      type: 'object',
      properties: { name: { type: 'string', minLength: 1, maxLength: 64 } },
      required: ['name']
    }
  },
  {
    name: 'echo',
    description: 'Echo text',
    inputSchema: {
      type: 'object',
      properties: { text: { type: 'string', maxLength: 50000 } },
      required: ['text']
    }
  },
  {
    name: 'sleep',
    description: 'Sleep for a short duration',
    inputSchema: {
      type: 'object',
      properties: { ms: { type: 'number', minimum: 0, maximum: 2000 } },
      required: ['ms']
    }
  }
];

function emit(payload) {
  const line = `data: ${JSON.stringify(payload)}\n\n`;
  for (const res of clients) {
    res.write(line);
  }
}

function handleRpc(request, send) {
  const { id, method, params } = request;
  if (method === 'initialize') return send({ jsonrpc: '2.0', id, result: { protocolVersion: '2025-03-26' } });
  if (method === 'tools/list') return send({ jsonrpc: '2.0', id, result: { tools } });
  if (method === 'tools/cancel') return send({ jsonrpc: '2.0', id, error: { code: -32601, message: 'Cancellation not supported' } });

  if (method === 'tools/call') {
    if (params?.name === 'hello') {
      if (!params?.arguments?.name) return send({ jsonrpc: '2.0', id, error: { code: -32602, message: 'Invalid params' } });
      return send({ jsonrpc: '2.0', id, result: { content: `Hello, ${params.arguments.name}!` } });
    }
    if (params?.name === 'echo') {
      return send({ jsonrpc: '2.0', id, result: { content: String(params?.arguments?.text ?? '') } });
    }
    if (params?.name === 'sleep') {
      setTimeout(() => send({ jsonrpc: '2.0', id, result: { content: 'done' } }), Number(params?.arguments?.ms ?? 0));
      return;
    }
    return send({ jsonrpc: '2.0', id, error: { code: -32601, message: 'Unknown tool' } });
  }

  send({ jsonrpc: '2.0', id, error: { code: -32601, message: 'Unknown method' } });
}

const server = http.createServer((req, res) => {
  if (req.url === '/sse' && req.method === 'GET') {
    res.writeHead(200, {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
      connection: 'keep-alive'
    });
    res.write(': connected\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  if (req.url === '/message' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString('utf8');
    });
    req.on('end', () => {
      try {
        const request = JSON.parse(body);
        handleRpc(request, emit);
        res.writeHead(202, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ accepted: true }));
      } catch {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(port, '127.0.0.1', () => {
  process.stdout.write(`SSE fixture listening on ${port}\n`);
});

process.on('SIGTERM', () => {
  for (const res of clients) {
    res.end();
  }
  server.close(() => process.exit(0));
});
