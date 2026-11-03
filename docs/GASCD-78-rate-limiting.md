# GASCD-78: rate limiting, operational reference

Design, evidence, test record and release procedure live on Confluence: **GASCD-78: Rate limiting and overload handling** (link to be added when the page is created). This file keeps only what a developer needs next to the code.

## What is where

- `middleware.ts`: per-user quota on every `/api` route, exemptions for health, Better Auth endpoints and sign-out, anonymous quota for analytics opt-out.
- `src/lib/rate-limit*.ts`: policy config, Azure SQL counter store (`dbo.requestRateLimit`), schema and cleanup SQL, HTTP responses.
- `src/lib/auth-rate-limit.ts`: Better Auth rules and the trusted client-IP header handling.
- `src/lib/data-api-errors.ts`, `src/data/dataAPI.ts`: data API 429/503 and transport failures propagate as controlled responses.
- `src/lib/service-fetch.ts`, `src/components/common/ServiceBusyNotice.tsx`: browser notice. 429 reads "too many requests", 503 reads "currently unavailable".
- `scripts/user-db-post-migrate.ts`: creates the counter table on `db:migrate:ci`; `--cleanup-rate-limits` deletes expired rows on demand.
- `gascd_api/api/Configuration/RateLimitingConfiguration.cs`, `Program.cs`: the API's per-process concurrency cap.
- `load_tests/authenticated-data.js`: k6 scenario for authenticated data traffic.

## Settings

All read from the environment; the code defaults to enabled, so deployments set every value explicitly in gascd-apps `deploy/<app>/containerapps/values-<env>.yaml`.

| Setting                          | Default            | Meaning                                                                 |
| -------------------------------- | ------------------ | ----------------------------------------------------------------------- |
| `RATE_LIMIT_ENABLED`             | `true`             | Frontend and sign-in counters; `false` bypasses them                    |
| `RATE_LIMIT_USER_MAX`            | `1000`             | Requests per signed-in user per window across covered API routes        |
| `RATE_LIMIT_USER_WINDOW_SECONDS` | `60`               | Fixed window                                                            |
| `RATE_LIMIT_AUTH_MAX`            | `100`              | General auth requests per IP and endpoint per auth window               |
| `RATE_LIMIT_AUTH_WINDOW_SECONDS` | `10`               | Auth window                                                             |
| `RATE_LIMIT_LOGIN_MAX`           | `20`               | Better Auth sign-in requests per IP and endpoint per 10 s               |
| `RATE_LIMIT_TRUSTED_IP_HEADER`   | unset              | The one header trusted for client IP; deployed value `x-azure-socketip` |
| `DATA_API_MAX_METRICS`           | `100`              | Maximum metric IDs per request                                          |
| `DATA_API_TIMEOUT_MS`            | `15000`            | Per outgoing data API fetch                                             |
| `CLIENT_IP_DIAGNOSTICS`          | unset              | `true` logs a `Client IP diagnostic` line on `/api/checks/live`         |
| `RATE_LIMIT_CLEANUP_BATCHES`     | `10`               | Batches of 1,000 rows per manual cleanup run                            |
| `RateLimiting__Enabled`          | `true`             | API limiter switch                                                      |
| `RateLimiting__ConcurrencyLimit` | `20`               | Data handlers in flight per API process, no queue                       |
| `RateLimiting__MaxLocations`     | `500`              | Locations per metric data request                                       |

The local password route (`/api/auth/local`, `LOCAL_AUTH=true` only) has a fixed limit of 3 attempts per 10 s in middleware. `E2E_TESTING_MODE` does not disable limits; tests that need a bypass set `RATE_LIMIT_ENABLED=false`.

## Running the tests

- `npm run test:nocov -- __tests__/rate-limit`: middleware, the real pinned Better Auth handler, bounds, error propagation, the notice.
- Real SQL suite: start SQL Server 2022 bound to `127.0.0.1:15478` with `ACCEPT_EULA=Y` and the disposable SA password recorded in `__tests__/rate-limit/sql.integration.ts`, then `RATE_LIMIT_SQL_TEST=true npm run test:rate-limit:sql`. Never point it at a real user database.
- `dotnet test gascd_api/api.Tests`: includes concurrency saturation, cancellation release and configuration validation.
- `k6 run -e BASE_URL=<host and base path> -e USERS_FILE=<json> -e VUS=20 -e DURATION=2m load_tests/authenticated-data.js` with an untracked file of `{cookie, metric_ids}` entries. Never commit session files.

## Manual cleanup

Nothing deletes expired counters on a schedule (deferred). When needed, with the deploy service principal's SQL token as the DB Bootstrap workflow obtains it:

```sh
USER_DB_SERVER=sql-gascd-userdb-<env>-uks.database.windows.net USER_DB_PORT=1433 USER_DATABASE=User_DB \
USER_DB_ACCESS_TOKEN=... RATE_LIMIT_CLEANUP_BATCHES=100 npm run db:cleanup:rate-limits
```

It deletes rows more than a day past their window in batches and prints how many expired rows remain.
