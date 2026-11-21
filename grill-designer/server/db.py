from __future__ import annotations
import sqlite3
from pathlib import Path

MIGRATIONS = Path(__file__).resolve().parents[1] / "migrations"


def connect(db_path: Path) -> sqlite3.Connection:
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def migrate(conn: sqlite3.Connection) -> list[str]:
    for sql_file in sorted(MIGRATIONS.glob("*.sql")):
        conn.executescript(sql_file.read_text())
    conn.commit()
    return [r[0] for r in conn.execute("SELECT version FROM schema_migrations ORDER BY version")]


def table_names(conn: sqlite3.Connection) -> list[str]:
    return [r[0] for r in conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")]
