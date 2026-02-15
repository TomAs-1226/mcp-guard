# Security Model

`mcp-guard` is designed for deterministic, bounded checks.

- Contract tests are fixed and do not execute arbitrary tool payloads.
- Every request has a timeout; transports enforce bounded retries.
- Child processes are terminated on shutdown.
- Config scan redacts token-like values in output.
- Registry verify is offline-only and never executes remote servers.

## Known limitations

- HTTP mode currently supports JSON-RPC over POST, not SSE.
- `scan` reports discovered configurations and metadata, but does not execute every discovered server by default.
