import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from server.app import create_app
from server.isolation import IsolationError, load_config, scan_source_tree

ROOT = Path(__file__).resolve().parents[1]
BASE = {"GGD_APP_ENV": "staging", "GGD_DB_PATH": "var/test/test.db", "GGD_UPLOAD_DIR": "var/test/uploads"}


def test_refuses_production_env():
    with pytest.raises(IsolationError):
        load_config({**BASE, "GGD_APP_ENV": "production"})


def test_refuses_missing_env():
    with pytest.raises(IsolationError):
        load_config({})


def test_refuses_db_outside_staging_folder():
    with pytest.raises(IsolationError):
        load_config({**BASE, "GGD_DB_PATH": "/tmp/prod.db"})
    with pytest.raises(IsolationError):
        load_config({**BASE, "GGD_DB_PATH": "../database-setup.sql"})


def test_refuses_live_notification_modes():
    for mode in ("email", "smtp", "formspree", "zapier"):
        with pytest.raises(IsolationError):
            load_config({**BASE, "GGD_NOTIFY_MODE": mode})


def test_refuses_production_endpoints_in_config():
    with pytest.raises(IsolationError):
        load_config({**BASE, "GGD_NOTIFY_TARGET": "https://formspree.io/f/myzpanyg"})
    with pytest.raises(IsolationError):
        load_config({**BASE, "GGD_NOTIFY_TARGET": "mrsprinklereno@gmail.com"})


def test_source_tree_is_clean():
    assert scan_source_tree() == []


def test_api_baseline():
    client = TestClient(create_app(BASE))
    h = client.get("/api/health").json()
    assert h["environment"] == "staging"
    assert "001_initial_schema" in h["database"]["migrations"]
    for t in ("customers", "designs", "design_teeth", "measurements", "estimates", "estimate_items",
              "uploaded_assets", "review_notes", "status_history"):
        assert t in h["database"]["tables"]
    iso = client.get("/api/staging/isolation").json()
    assert iso["all_pass"], iso
    r = client.get("/api/pricing/catalog")
    assert r.headers["x-environment"] == "staging"
    cat = r.json()
    assert cat["owner_verified"] is False


def test_catalog_matches_published_site_prices():
    cat = json.loads((ROOT / "config" / "pricing-catalog.v0.json").read_text())
    m = cat["materials_per_tooth"]
    assert (m["silver"]["price"], m["gold10k"]["price"], m["gold14k"]["price"], m["dentalGold14k"]["price"]) == (100, 240, 300, 320)
    for k in ("gold18k", "gold24k", "whiteGold", "platinum"):
        assert m[k]["price"] is None and m[k]["status"] == "quote_required"
    for k, totals in cat["material_reference_totals"].items():
        assert totals["6"] == 6 * m[k]["price"] and totals["12"] == 12 * m[k]["price"]
    s = cat["stones_per_stone_material_only"]
    assert s["naturalDiamond_vvs"] == {"1.3": 10, "1.5": 14, "2.0": 28, "3.0": 91}
    assert s["vvsMoissanite"]["3.0"] == 7.60
    assert cat["setting_labor"]["status"] == "pending_jeweler_quote"
