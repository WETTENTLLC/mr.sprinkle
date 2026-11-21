"""Gold Grill Designer 2.0 — STAGING API (Milestone 1 baseline).

Milestone 1 exposes only read-only baseline endpoints:
  GET /api/health            environment + database status
  GET /api/staging/isolation isolation checks (no production services)
  GET /api/pricing/catalog   draft pricing catalog (owner_verified: false)
Design, estimate, upload, and admin endpoints arrive in Milestones 2–6.
"""
from __future__ import annotations

import json
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import db as dbmod
from .isolation import isolation_report, load_config

ROOT = Path(__file__).resolve().parents[1]
CATALOG_PATH = ROOT / "config" / "pricing-catalog.v0.json"


def create_app(env: dict | None = None) -> FastAPI:
    cfg = load_config(env)              # raises IsolationError unless staging-safe
    for d in (cfg["upload_dir"], cfg["outbox_dir"]):
        d.mkdir(parents=True, exist_ok=True)
    conn = dbmod.connect(cfg["db_path"])
    migrations = dbmod.migrate(conn)

    app = FastAPI(title="Gold Grill Designer 2.0 (STAGING)", docs_url=None, redoc_url=None)
    # The private preview proxy authenticates requests; read-only endpoints only in M1.
    app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["GET"], allow_headers=["*"])

    @app.middleware("http")
    async def staging_headers(request, call_next):
        response = await call_next(request)
        response.headers["X-Environment"] = "staging"
        response.headers["X-Robots-Tag"] = "noindex, nofollow"
        response.headers["Cache-Control"] = "no-store"
        return response

    @app.get("/api/health")
    def health():
        return {
            "status": "ok",
            "environment": cfg["app_env"],
            "milestone": 1,
            "database": {"engine": "sqlite", "file": str(cfg["db_path"].relative_to(ROOT)),
                         "migrations": migrations, "tables": dbmod.table_names(conn)},
            "notifications": cfg["notify_mode"],
        }

    @app.get("/api/staging/isolation")
    def isolation():
        return isolation_report(cfg)

    @app.get("/api/pricing/catalog")
    def catalog():
        return json.loads(CATALOG_PATH.read_text())

    return app
