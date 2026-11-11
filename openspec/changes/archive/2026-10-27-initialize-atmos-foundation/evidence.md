# Verification evidence (author-run, not independent)

## 2026-10-23T11:44:34Z clean run — uncommitted tree, repository has no HEAD
- `pnpm install --frozen-lockfile` exit=0 | 
- `pnpm build` exit=0 |  Tasks: 3 successful, 3 total;
- `pnpm typecheck` exit=0 |  Tasks: 4 successful, 4 total;
- `pnpm test` exit=0 | @atmos/contracts:test: Tests 6 passed (6);@atmos/web:test: Tests 2 passed (2); Tasks: 4 successful, 4 total;
- pnpm-lock.yaml byte-identical before/after
- dev `docker compose up -d --build --wait` exit=0: api=Up 11 seconds (healthy) postgres=Up 17 seconds (healthy) redis=Up 17 seconds (healthy) web=Up 5 seconds (healthy) 
- dev web origin :5173: / 200; /api/health {"status":"ok"} 200
- postgres stopped: postgres=Exited (0) 2 seconds ago; /api/health {"status":"ok"} 200
- redis stopped: redis=Exited (0) 2 seconds ago; /api/health {"status":"ok"} 200
- prod up exit=0: api=Up 11 seconds (healthy) postgres=Up 16 seconds (healthy) redis=Up 16 seconds (healthy) web=Up 5 seconds (healthy) 
- prod Nginx :8080: / 200; /api/health {"status":"ok"} 200; /some/client/route 200
- browser assets: no backend values


## 2026-10-23 isolated re-verification (disposable checkout, author-run)

Environment: macOS (Darwin 25.5), Node v24.15.0, pnpm 12.14.0, Docker 29.5.3; disposable copy of the working tree (no `node_modules`/`dist`/`.turbo`) in the session scratchpad; Compose project `atmosverify` (isolated names/volumes). No Git `HEAD` exists, so no revision hash. Turbo cache bypassed with `--force` (every task `Cached: 0`). Specs/requirements untouched.

### Defects found and fixed (implementation was changed only for these)
1. **Host `pnpm dev` could not start the API** (documented flow). Turbo strict env mode stripped `NODE_ENV/PORT/DATABASE_URL/REDIS_URL`; API exited "Invalid or missing environment settings: NODE_ENV, PORT, DATABASE_URL, REDIS_URL"; `/api/health` via Vite gave 502. Fix: `globalPassThroughEnv` in `turbo.json`. Re-run: 200 on both origins (IAF-DEV-AC-002).
2. **Compose API did not reload on source edit** (`tsx watch` receives no file events over the bind mount; file changed in container, process unchanged after 20 s). Fix: container dev command now `tsc --watch` (`TSC_WATCHFILE=PriorityPollingInterval`) + `node --watch dist/main.js`. Re-run: edit -> 500, revert -> 200.

### Fresh build/test (cache bypassed)
$ pnpm install --frozen-lockfile
+ turbo 2.11.9

Done in 991ms using pnpm v12.14.0
exit=0
lockfile unchanged
ls: packages/contracts/dist: No such file or directory
$ pnpm build --force
@atmos/web:build: ✓ built in 80ms

 Tasks:    3 successful, 3 total
Cached:    0 cached, 3 total
  Time:    3.848s 

exit=0
$ pnpm typecheck --force
@atmos/api:typecheck: $ tsc -p tsconfig.json --noEmit

 Tasks:    4 successful, 4 total
Cached:    0 cached, 4 total
  Time:    944ms 

exit=0
$ pnpm test --force
@atmos/api:test: (node:89003) ExperimentalWarning: VM Modules is an experimental feature and might change at any time
@atmos/api:test: (Use `node --trace-warnings ...` to show where the warning was created)
@atmos/api:test: PASS test/health.spec.ts
@atmos/api:test: 
@atmos/api:test: Test Suites: 2 passed, 2 total
@atmos/api:test: Tests:       11 passed, 11 total
@atmos/api:test: Snapshots:   0 total
@atmos/api:test: Time:        2.087 s
@atmos/api:test: Ran all test suites.

 Tasks:    4 successful, 4 total
Cached:    0 cached, 4 total
  Time:    5.79s 

exit=0

### API startup, invalid config, health (built `dist`)

$ curl -si localhost:3055/api/health
HTTP/1.1 200 OK
{"status":"ok"}
$ PORT=abc node apps/api/dist/main.js
[Nest] 89018  - 10/23/2026, 2:43:05 PM   ERROR [Bootstrap] Invalid or missing environment settings: PORT
exit=1
$ PORT=0 node apps/api/dist/main.js
[Nest] 89022  - 10/23/2026, 2:43:05 PM   ERROR [Bootstrap] Invalid or missing environment settings: PORT
exit=1
$ NODE_ENV=staging node apps/api/dist/main.js
[Nest] 89026  - 10/23/2026, 2:43:05 PM   ERROR [Bootstrap] Invalid or missing environment settings: NODE_ENV
exit=1
$ DATABASE_URL=SECRETPW node apps/api/dist/main.js
[Nest] 89030  - 10/23/2026, 2:43:06 PM   ERROR [Bootstrap] Invalid or missing environment settings: DATABASE_URL
exit=1
$ REDIS_URL=SECRETPW node apps/api/dist/main.js
[Nest] 89034  - 10/23/2026, 2:43:06 PM   ERROR [Bootstrap] Invalid or missing environment settings: REDIS_URL
exit=1
$ env -u NODE_ENV node apps/api/dist/main.js
[Nest] 89038  - 10/23/2026, 2:43:06 PM   ERROR [Bootstrap] Invalid or missing environment settings: NODE_ENV
exit=1
$ env -u PORT node apps/api/dist/main.js
[Nest] 89042  - 10/23/2026, 2:43:06 PM   ERROR [Bootstrap] Invalid or missing environment settings: PORT
exit=1
$ env -u DATABASE_URL node apps/api/dist/main.js
[Nest] 89046  - 10/23/2026, 2:43:06 PM   ERROR [Bootstrap] Invalid or missing environment settings: DATABASE_URL
exit=1
$ env -u REDIS_URL node apps/api/dist/main.js
[Nest] 89050  - 10/23/2026, 2:43:06 PM   ERROR [Bootstrap] Invalid or missing environment settings: REDIS_URL
exit=1
--- leaked SECRETPW in logs?
0

### Host development (`pnpm dev`, Compose postgres/redis) — after fix 1
$ docker compose up -d --wait postgres redis
 Container atmosverify-postgres-1 Healthy 
 Container atmosverify-redis-1 Healthy 
$ pnpm dev (background)
web / 200  web-origin /api/health: {"status":"ok"} 200  api direct: {"status":"ok"} 200
--- web source edit
served module contains edit: 1
--- api source edit
api after edit (strictObject parse should now fail => 500): {"statusCode":500,"message":"Internal server error"} 500
api after revert: {"status":"ok"} 200
/private/tmp/claude-501/-Users-artemkrasovskyi-Workspace-Atmos/aaa43ccc-5b96-4622-b167-b8b1337b9e54/scratchpad/b.sh: line 14: 89317 Terminated: 15          pnpm dev > /tmp/dev.log 2>&1
ports after stop:        0
 Network atmosverify_default Removed 

### Compose, dependency outage, production (first full pass, before fix 2 image rebuild)
$ docker compose config -q
ok
$ docker compose up -d --build --wait
exit=0
api: Up 11 seconds (healthy)
postgres: Up 17 seconds (healthy)
redis: Up 17 seconds (healthy)
web: Up 5 seconds (healthy)
web origin :5173 / 200 health {"status":"ok"} [200]
--- container source-edit reload (web, api)
web served edit: 1; api after edit: {"status":"ok"} [200]
api after revert: {"status":"ok"} [200]
--- stop postgres
api: Up 31 seconds (healthy)
postgres: Exited (0) 3 seconds ago
redis: Up 36 seconds (healthy)
web: Up 25 seconds (healthy)
health via web origin: {"status":"ok"} [200]
api: Up 37 seconds (healthy) postgres: Up 6 seconds (healthy) redis: Up 43 seconds (healthy) web: Up 31 seconds (healthy) 
--- stop redis
api: Up 40 seconds (healthy)
postgres: Up 9 seconds (healthy)
redis: Exited (0) 3 seconds ago
web: Up 35 seconds (healthy)
health via web origin: {"status":"ok"} [200]
api: Up 47 seconds (healthy) postgres: Up 16 seconds (healthy) redis: Up 6 seconds (healthy) web: Up 41 seconds (healthy) 
--- both down at once (extra)
health: {"status":"ok"} [200]
=== PROD
up exit=0
api: Up 11 seconds (healthy)
postgres: Up 16 seconds (healthy)
redis: Up 16 seconds (healthy)
web: Up 5 seconds (healthy)
/ 200
/api/health {"status":"ok"} [200]
$ curl localhost:8080/some/client/route:
id="root" [200] 
unknown asset path /nope.js: 200  /api/unknown: 404
web depends on vite proxy? web container processes:
0
no backend values in served assets
       1

In that pass the API source edit was not observed (defect 2); after the fix the dev stack was rebuilt, all four services healthy, and the edit/revert cycle behaved as stated above.

### AC mapping
| AC | Result |
|---|---|
| IAF-CON-AC-001/002 | PASS: contracts tests (6) and clean `--force` build; API and web consume the package |
| IAF-BE-AC-001 | PASS: live 200 `{"status":"ok"}` |
| IAF-BE-AC-002 | PASS: 200 with postgres stopped, redis stopped, and both stopped |
| IAF-BE-AC-003 | PASS: valid env starts and serves health |
| IAF-BE-AC-004 | PASS: 4 missing + 5 malformed cases exit 1, key named, secret value absent from output |
| IAF-FE-AC-001 | PARTIAL: dev and prod `/` serve 200 and client routes return the shell; reload in a real browser NOT RUN (Chrome extension not connected) |
| IAF-FE-AC-002 | PASS (jsdom test: no fetch calls, no buttons); real-browser run NOT RUN |
| IAF-FE-AC-003 | PASS: Vitest browser-target schema test; dev/prod builds resolve the export |
| IAF-DEV-AC-001 | PASS: frozen install from clean state, lockfile byte-identical, build/typecheck/test |
| IAF-DEV-AC-002 | PASS after fix 1: web edit served by Vite HMR server, API edit restarted process (500 then 200) |
| IAF-DEV-AC-003 | PASS: 4/4 healthy; `/` and `/api/health` via web origin |
| IAF-DEV-AC-004 | PASS: each dependency `Exited (0)` while API stayed healthy and returned 200 |
| IAF-DEV-AC-005 | PASS: examples placeholder-only, `.env*` ignored, no backend values in served assets |
| IAF-DEV-AC-006 | This record |
| IAF-DEV-AC-007 | PASS: Nginx `:8080` `/api/health` 200 exact body; web image has no Vite/Node process; SPA fallback 200 with React shell |

### Limitations / not run
- Real-browser reload and visual checks (Chrome extension not connected); HMR evidenced only by the dev server serving the edited module.
- `/nope.js` returns 200 (SPA fallback serves index.html for missing assets) — noted, not treated as a defect.
- Unrelated pre-existing container `turborepo-next-template-postgres-1` on the machine was left untouched.
