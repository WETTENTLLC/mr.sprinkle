# Mr. Sprinkle Gold Grill Designer 2.0 (staging)

Isolated development of the custom grillz designer. Nothing in this folder is linked from the live site, and nothing here touches production services.

- **Status:** Milestone 1 (audit and isolation). See `docs/M1-AUDIT.md`.
- **Branch:** `feature/gold-grill-designer-2`. Local only; do not merge into `master`.

## Run staging

```bash
cd grill-designer
cp .env.staging.example .env.staging   # staging-only values; never commit
python -m server.main                  # API on :8800
python -m http.server 8766 -d web      # staging page on :8766
```

## Test

```bash
pip install fastapi uvicorn pytest httpx
python -m pytest            # unit + API tests
python tools/check_isolation.py
```

## Environment variables (no secret values)

| Variable | Purpose | Allowed values |
|---|---|---|
| `GGD_APP_ENV` | Environment guard | `staging` only; anything else refuses to start |
| `GGD_PORT` | API port | default `8800` |
| `GGD_DB_PATH` | SQLite file | must be inside `grill-designer/var/` |
| `GGD_UPLOAD_DIR` | Reference-photo storage | must be inside `grill-designer/var/` |
| `GGD_NOTIFY_MODE` | Notifications | `outbox` only (written to `var/outbox/`, never sent) |
| `GGD_ADMIN_PASSWORD_HASH` | Staging admin login (Milestone 6) | staging-only hash |

## Layout

| Path | Contents |
|---|---|
| `server/` | FastAPI app, isolation guard, database helpers |
| `migrations/` | SQL schema migrations |
| `config/pricing-catalog.v0.json` | Draft pricing catalog, `owner_verified: false` |
| `web/` | Staging front end |
| `tests/` | pytest suite |
| `tools/` | Isolation scanner |
| `docs/` | Audit and milestone documentation |
