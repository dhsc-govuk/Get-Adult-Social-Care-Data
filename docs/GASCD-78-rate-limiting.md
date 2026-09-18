# GASCD-78: implementation and rollout

The frontend uses Azure SQL fixed-window counters shared across replicas. Authenticated API requests are keyed by user ID. Better Auth 1.6.22 uses the same atomic counter through its `customStorage.consume` contract, with separate auth keys and endpoint rules. The Data API uses .NET's per-process concurrency limiter. No counter data is written to PostgreSQL.

## Configuration

These defaults are provisional engineering assumptions for local and staging validation, not measured production capacity.

| Setting                          | Default | Meaning                                                                                      |
| -------------------------------- | ------- | -------------------------------------------------------------------------------------------- |
| `RATE_LIMIT_ENABLED`             | `true`  | Explicit frontend/auth switch; `false` bypasses these counters                               |
| `RATE_LIMIT_USER_MAX`            | `120`   | Requests per authenticated user per frontend window, across covered API routes               |
| `RATE_LIMIT_USER_WINDOW_SECONDS` | `60`    | Frontend fixed-window duration                                                               |
| `RATE_LIMIT_AUTH_MAX`            | `100`   | General auth requests per trusted IP and endpoint per auth window                            |
| `RATE_LIMIT_AUTH_WINDOW_SECONDS` | `10`    | General auth window; Better Auth's sensitive endpoint rules override it                      |
| `RATE_LIMIT_LOGIN_MAX`           | `3`     | Sign-in requests per IP and endpoint per 10 seconds                                          |
| `RATE_LIMIT_TRUSTED_IP_HEADER`   | unset   | A single client-IP header that the platform has verified is overwritten by its trusted proxy |
| `DATA_API_MAX_METRICS`           | `100`   | Maximum submitted metric IDs before deduplication                                            |
| `DATA_API_TIMEOUT_MS`            | `15000` | Timeout per outgoing data API fetch                                                          |
| `RateLimiting__Enabled`          | `true`  | Independent .NET API limiter switch                                                          |
| `RateLimiting__ConcurrencyLimit` | `20`    | Maximum covered handlers in flight in each API process, with no waiting queue                |
| `RateLimiting__MaxLocations`     | `500`   | Maximum locations in an API metric-data request                                              |

The largest literal metric list currently found in a frontend page contains 23 entries. The initial cap of 100 leaves headroom, but dynamic requests and real dashboard traffic still need staging verification. The metric route also limits incoming JSON to 32 KiB and uses a 30-second deadline for its metric API client, including sequential fan-out. Location helper lookups have their own bounded fetch timeouts. API metric queries now propagate cancellation to EF Core.

At 20 concurrent requests and 8 API processes, the nominal aggregate cap is 160. Include all live revisions during a rollout, and database users outside this API, when comparing that number with PostgreSQL capacity. This is a concurrency cap, not a requests-per-second quota. The API key remains authentication, not an identity for separate user quotas.

## Unknown client-IP configuration

The deployed proxy header configuration is currently unknown. The code ignores arbitrary `X-Forwarded-For` and removes any client-supplied internal `x-gascd-trusted-client-ip` header before invoking Better Auth. It only copies a valid single IP from the explicitly configured trusted header. Better Auth normalizes IP identities, including IPv6 subnet handling.

Until a trusted header is configured, unidentified login requests share Better Auth's bounded per-endpoint fallback quota. This deliberately does not disable protection, but it can throttle different users together: the default sign-in limit would be three requests per 10 seconds for that shared endpoint. Treat this as a temporary fallback, not production per-IP protection. Development/test Better Auth uses a localhost fallback; a production-mode subprocess test verifies the actual `no-trusted-ip` behaviour.

Ask the platform team to establish which hop overwrites a client-IP header and whether the origin can be reached through an untrusted path. Inspect the Front Door → Container Apps request chain. Configure only the verified header; a setting name alone does not establish trust. Comma-separated chains and invalid IPs fall back to the shared quota. Current implementation does not infer or walk an unknown proxy chain.

## Temporary client-IP diagnostics

Set `CLIENT_IP_DIAGNOSTICS=true` on the frontend Container App and visit its normal public `/api/checks/live` URL (including `/gascd` if configured). No query-string marker is needed. Each call to that route, including health probes, then emits a single `Client IP diagnostic` console-log line containing `socketIp`, `forwardedFor`, and `requestId`. Missing headers appear as `null`. Cookies and authorization headers are not logged. The response remains `200 OK`, with `Cache-Control: no-store`; overriding edge-cache rules still need separate verification.

Find the diagnostic in Log Analytics:

```kusto
ContainerAppConsoleLogs_CL
| where TimeGenerated > ago(15m)
| where Log_s contains "Client IP diagnostic"
| project TimeGenerated, ContainerAppName_s, Log_s
| order by TimeGenerated desc
```

Set `CLIENT_IP_DIAGNOSTICS=false` again after checking. This switch only enables observation; it does not change which IP header the rate limiter trusts.

## First dev deployment: header check

This branch includes the rate-limiting implementation as well as the temporary logger. Run the database migration described below before testing enabled frontend limits.

For a header-only check, set `CLIENT_IP_DIAGNOSTICS=true` and `RATE_LIMIT_ENABLED=false` on the frontend Container App. The diagnostic works independently of rate limiting. Leave `RATE_LIMIT_TRUSTED_IP_HEADER` unset until the proxy behaviour is verified. The API limiter has its own `RateLimiting__Enabled` switch.

Visit `/gascd/api/checks/live` through the normal public frontend hostname (omit `/gascd` if no base path is configured), then use the query above. Browser calls and internal health probes can produce different IP values; compare the entries with your request time. Confirming that an address arrives is separate from proving that the proxy overwrites a spoofed header and that untrusted clients cannot reach the origin directly.

Set `CLIENT_IP_DIAGNOSTICS=false` when the check is complete. To test frontend limiting afterwards, complete the migration, configure the verified trusted header, and set `RATE_LIMIT_ENABLED=true`.

## Request and failure behaviour

- Middleware limits authenticated API traffic by session user ID. Users behind one office connection have independent authenticated quotas. Existing route authorization still applies.
- Exact liveness and health routes bypass frontend counters. Auth's catch-all HTTP handler applies its own policies. Custom local login is explicitly limited, and local auth requires `LOCAL_AUTH=true`. The custom logout URL route receives the authenticated quota. Better Auth sign-out is exempt so users can leave an overloaded service.
- Anonymous analytics opt-out remains available, with a separate 30/minute quota keyed by trusted IP or a shared fallback. Other paths do not inherit broad `auth`, `checks`, or `analytics` prefix exemptions.
- Counter exhaustion returns HTTP 429 with the actual remaining fixed-window delay in `Retry-After`. Adjacent windows intentionally permit a boundary burst. Better Auth's `X-Retry-After` is also exposed as the standard header.
- Counter failures return controlled 503 responses. They do not silently become per-process counters. A separate two-connection pool per frontend process, bounded acquisition/command waits, and a one-second SQL lock timeout isolate counters from session-pool capacity. SQL uses `XACT_ABORT`, explicit transactions, and key-range locking for concurrent inserts.
- The API rejects saturated data routes with 429 and no invented retry window. Health endpoints outside `/api` remain exempt. API 429/503 responses and transport failures are propagated through frontend data routes, so they cannot become successful empty/partial responses.
- Browser data services display a dismissible service-busy notice. They do not automatically retry mutations or reload the page. Existing route selections are retained; existing chart-specific error behaviour remains in place.
- `E2E_TESTING_MODE` no longer disables auth protection. Tests needing a bypass must explicitly set `RATE_LIMIT_ENABLED=false` in their isolated environment.

## Migration, cleanup, and rollout

1. Run the existing `npm run db:migrate:ci` deployment step. Its post-migration script creates `dbo.requestRateLimit` and its primary/expiry indexes idempotently. The application never creates the table at startup.
2. Verify the runtime identity can select, insert, and update this table. The maintenance identity also needs delete access; migration credentials need DDL access.
3. Schedule `npm run db:cleanup:rate-limits` using the same user-database connection settings. Each run deletes at most 10,000 rows in batches of 1,000, keeping counters until one day after expiry. Start with every five minutes and monitor the expired backlog. Scheduling infrastructure is not present in this repository and must be supplied by the platform.
4. Establish trusted IP configuration, record the configured replica maxima and revision overlap, then run authenticated staging traffic. Tune provisional values using the measurements below.
5. Deploy through the existing process. The additive table can remain during rollback. Frontend and API switches are independent; do not disable both without another agreed protection layer.

The separate admin app, Front Door rules, private endpoints, and actual ingress restrictions remain external dependencies. This branch does not claim those diagram controls are deployed or verified.

## Measurements to obtain from Grafana and staging

Capture peak request counts over both 10-second and 60-second windows, not just hourly averages. Separate auth endpoints, frontend data routes, and API data routes. Include active users, per-user bursts if existing telemetry supports them, p50/p95/p99 successful latency, API in-flight requests, SQL pool waits/lock timeouts, PostgreSQL CPU/connections, and API calls per frontend request.

Frontend OpenTelemetry instruments are `gascd.rate_limit.decisions` (policy and outcome labels) and `gascd.rate_limit.duration` (milliseconds, policy label). Configure/export these through the existing telemetry pipeline; metric names may be translated by the exporter. No user IDs or IPs are metric labels. Store-failure logging is sampled to once per 30 seconds per process. Use the .NET built-in rate-limiting instruments alongside request telemetry for API rejection and lease counts.

The authenticated k6 scenario is `gascd_frontend/load_tests/authenticated-data.js`. Supply an untracked JSON file with staging session cookies and valid metric IDs, one entry per distinct user:

```json
[
  {
    "cookie": "<staging session cookie header>",
    "metric_ids": ["total_population"]
  }
]
```

```sh
k6 run -e BASE_URL=https://your-staging-host/gascd -e USERS_FILE=/absolute/path/users.json -e VUS=20 -e DURATION=2m load_tests/authenticated-data.js
```

Do not commit session files. Run a normal-usage profile with enough users and realistic pauses, then an overload profile. Record successful latency and 429/503 counts separately; a fast rejection is not successful throughput. This script exercises authenticated data and controlled overload, not a complete browser dashboard or OAuth journey. Run actual representative dashboards too. No staging/production load test has been run as part of this implementation.

## Local validation

- `npm run test:nocov -- __tests__/rate-limit` exercises middleware, the real pinned Better Auth HTTP handler, production fallback handling, input bounds, upstream errors, and the UI notice.
- `RATE_LIMIT_SQL_TEST=true npm run test:rate-limit:sql` exercises the production SQL against a dedicated local SQL Server at `127.0.0.1:15478`, database `GASCD78RateLimitTests`. The test file deliberately does not read production user-database settings. It requires the disposable local SA password recorded in that test file.
- Start an isolated SQL Server container bound only to localhost on port 15478, with `ACCEPT_EULA=Y` and `MSSQL_SA_PASSWORD=Gascd78-Local-Test-Only!`, using an appropriate local SQL Server 2022 image. Do not point this suite at the active development database.
- The SQL suite verifies exactly seven admissions from 64 concurrent attempts through independent pools, quota persistence after a pool restart, separate user quotas, database-time reset, cleanup, and bounded lock failure/recovery. Independent pools establish shared database semantics; deployed multi-replica routing remains a staging check.
- `dotnet test gascd_api/api.Tests` includes HTTP concurrency saturation, exception/cancellation release, health availability, configuration validation, and location bounds, alongside existing API/auth tests. Its existing fixtures create disposable PostgreSQL containers.

Validation of the final implementation:

| Check                                 | Result                                                                          |
| ------------------------------------- | ------------------------------------------------------------------------------- |
| Frontend production build             | Passed, including Next.js type/lint checks; existing stylesheet warnings remain |
| Tests covering changed frontend areas | 253 passed                                                                      |
| Dedicated real SQL suite              | 4 passed                                                                        |
| Full API suite                        | 421 passed                                                                      |
| Full frontend suite                   | 449 passed; 5 existing failures reproduced on clean main                        |
| Standalone TypeScript check           | Same 20 existing test-file diagnostics as clean main; no new diagnostics        |
| ESLint on changed frontend files      | Passed                                                                          |

The five baseline frontend failures concern home-page link expectations and sharing rules (`HomePage`, `helpPageSharing`, `sharingCategories`, and `SharingRules`). They are outside this change. Existing package security warnings from .NET restore were not changed by this branch.
