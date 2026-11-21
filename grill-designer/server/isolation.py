"""Staging isolation guard for Gold Grill Designer 2.0.

The staging server refuses to start if its configuration points at anything
production-like. These identifiers come from the M1 audit of the live site
(master @ c90d3a8). They are matched as substrings in configuration values
and in the designer source tree.
"""
from __future__ import annotations

import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]          # grill-designer/
VAR_DIR = (ROOT / "var").resolve()

# Production integrations found on the live site. Staging must never use them.
PRODUCTION_MARKERS = {
    "formspree.io/f/myzpanyg": "Live Formspree form (mold-form.html, index.html)",
    "script.google.com/macros/s/AKfycby49GV35J": "Live Google Sheets Apps Script (mold-form.html)",
    "api.x.ai": "Grok chat API (mold-form.html chat widget)",
    "hooks.zapier.com": "Zapier webhook (historical .env)",
    "mrsprinklereno@gmail.com": "Production business inbox",
    "smtp.gmail.com": "Production Gmail SMTP (phpmailer-setup.php, simple-gmail.php)",
    "paypal.com/cgi-bin/webscr": "Live PayPal checkout (gift-card.html)",
    "paypal.com/sdk/js": "Live PayPal SDK (intro-music.html)",
}

ALLOWED_NOTIFY_MODES = {"outbox"}


class IsolationError(RuntimeError):
    pass


def _inside_var(path_value: str) -> Path:
    p = Path(path_value)
    if not p.is_absolute():
        p = ROOT / p
    p = p.resolve()
    if p != VAR_DIR and VAR_DIR not in p.parents:
        raise IsolationError(f"Path {p} is outside the staging data folder {VAR_DIR}")
    return p


def load_config(env: dict | None = None) -> dict:
    env = dict(os.environ if env is None else env)
    app_env = env.get("GGD_APP_ENV", "")
    if app_env != "staging":
        raise IsolationError(f"GGD_APP_ENV must be 'staging' (got {app_env!r}). Production mode is not authorized.")
    notify = env.get("GGD_NOTIFY_MODE", "outbox")
    if notify not in ALLOWED_NOTIFY_MODES:
        raise IsolationError(f"GGD_NOTIFY_MODE={notify!r} is not allowed in staging; use 'outbox'.")
    for key, value in env.items():
        if not key.startswith("GGD_"):
            continue
        for marker, desc in PRODUCTION_MARKERS.items():
            if marker.lower() in str(value).lower():
                raise IsolationError(f"{key} references a production integration: {desc}")
    cfg = {
        "app_env": app_env,
        "port": int(env.get("GGD_PORT", "8800")),
        "db_path": _inside_var(env.get("GGD_DB_PATH", "var/staging.db")),
        "upload_dir": _inside_var(env.get("GGD_UPLOAD_DIR", "var/uploads")),
        "outbox_dir": _inside_var("var/outbox"),
        "notify_mode": notify,
    }
    return cfg


SCAN_SUFFIXES = {".py", ".js", ".mjs", ".html", ".css", ".json", ".sql", ".example"}
SKIP_PARTS = {"var", "__pycache__", ".pytest_cache", "tests", "docs"}
SECRET_PATTERNS = [
    re.compile(r"xai-[A-Za-z0-9]{20,}"),
    re.compile(r"hooks\.zapier\.com/hooks/catch/\d+"),
    re.compile(r"(?i)app[_-]?password\s*[:=]\s*['\"][a-z]{4}\s?[a-z]{4}"),
    re.compile(r"sk-[A-Za-z0-9]{20,}"),
]


def scan_source_tree() -> list[dict]:
    """Static scan of grill-designer/ (excluding runtime data, tests, docs)."""
    findings = []
    this_file = Path(__file__).resolve()
    for path in ROOT.rglob("*"):
        if not path.is_file() or path.resolve() == this_file:
            continue
        rel = path.relative_to(ROOT)
        if any(part in SKIP_PARTS for part in rel.parts):
            continue
        if path.suffix not in SCAN_SUFFIXES and path.name != ".env.staging.example":
            continue
        text = path.read_text(errors="ignore")
        low = text.lower()
        for marker, desc in PRODUCTION_MARKERS.items():
            if marker.lower() in low:
                findings.append({"file": str(rel), "issue": f"production reference: {desc}"})
        for pat in SECRET_PATTERNS:
            if pat.search(text):
                findings.append({"file": str(rel), "issue": f"possible secret matching {pat.pattern}"})
    return findings


def isolation_report(cfg: dict) -> dict:
    findings = scan_source_tree()
    checks = [
        {"check": "Environment is staging", "pass": cfg["app_env"] == "staging"},
        {"check": "Database file is inside grill-designer/var/", "pass": VAR_DIR in cfg["db_path"].parents},
        {"check": "Uploads folder is inside grill-designer/var/", "pass": VAR_DIR in cfg["upload_dir"].parents or cfg["upload_dir"] == VAR_DIR},
        {"check": "Notifications go to local outbox only (no email/SMS/Formspree/Sheets/Zapier)", "pass": cfg["notify_mode"] == "outbox"},
        {"check": "No production endpoints or secrets in designer source", "pass": not findings},
        {"check": "No payment processing code (estimate-only checkout)", "pass": not any("PayPal" in f["issue"] for f in findings)},
    ]
    return {"all_pass": all(c["pass"] for c in checks), "checks": checks, "findings": findings}
