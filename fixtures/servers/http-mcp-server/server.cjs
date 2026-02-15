#!/usr/bin/env node
const http = require('node:http');

const port = Number(process.env.PORT || 4010);

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

function send(res, payload) {
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify(payload));
}

const server = http.createServer(async (req, res) => {
  if (req.method !== 'POST') {
    res.writeHead(405);
    res.end();
    return;
  }

  let body = '';
  req.on('data', (chunk) => {
    body += chunk.toString('utf8');
  });
  req.on('end', async () => {
    let request;
    try {
      request = JSON.parse(body);
    } catch {
      send(res, { jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } });
      return;
    }

    const { id, method, params } = request;
    if (method === 'initialize') return send(res, { jsonrpc: '2.0', id, result: { protocolVersion: '2025-03-26' } });
    if (method === 'tools/list') return send(res, { jsonrpc: '2.0', id, result: { tools } });
    if (method === 'tools/cancel') return send(res, { jsonrpc: '2.0', id, error: { code: -32601, message: 'Cancellation not supported' } });

    if (method === 'tools/call') {
      if (params?.name === 'hello') {
        if (!params?.arguments?.name) return send(res, { jsonrpc: '2.0', id, error: { code: -32602, message: 'Invalid params' } });
        return send(res, { jsonrpc: '2.0', id, result: { content: `Hello, ${params.arguments.name}!` } });
      }
      if (params?.name === 'echo') {
        return send(res, { jsonrpc: '2.0', id, result: { content: String(params?.arguments?.text ?? '') } });
      }
      if (params?.name === 'sleep') {
        await new Promise((resolve) => setTimeout(resolve, Number(params?.arguments?.ms ?? 0)));
        return send(res, { jsonrpc: '2.0', id, result: { content: 'done' } });
      }
      return send(res, { jsonrpc: '2.0', id, error: { code: -32601, message: 'Unknown tool' } });
    }

    send(res, { jsonrpc: '2.0', id, error: { code: -32601, message: 'Unknown method' } });
  });
});

server.listen(port, '127.0.0.1', () => {
  process.stdout.write(`HTTP fixture listening on ${port}\n`);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
