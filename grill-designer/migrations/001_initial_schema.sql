-- Gold Grill Designer 2.0 — staging schema, migration 001
-- Logical model from brief section 13. SQLite dialect for staging.
-- Production database technology is an open owner decision (see docs/M1-AUDIT.md).
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL CHECK (length(full_name) BETWEEN 1 AND 120),
  email TEXT NOT NULL CHECK (length(email) BETWEEN 3 AND 254),
  phone TEXT NOT NULL CHECK (length(phone) BETWEEN 7 AND 32),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS designs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id TEXT NOT NULL UNIQUE,              -- random, unguessable id used in URLs
  access_token_hash TEXT NOT NULL,             -- customer ownership proof (hashed)
  reference_number TEXT UNIQUE,                -- assigned at submission, e.g. MS-GRILL-2026-000001
  customer_id INTEGER REFERENCES customers(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN
    ('draft','submitted','under_review','additional_info_needed','quote_prepared','approved','declined','archived')),
  design_name TEXT,
  preview_image TEXT,
  pricing_version TEXT,
  estimate_status TEXT CHECK (estimate_status IN ('complete_estimate','partial_estimate','quote_required')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  submitted_at TEXT
);

CREATE TABLE IF NOT EXISTS reference_sequence (
  year INTEGER PRIMARY KEY,
  last_value INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS design_teeth (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  design_id INTEGER NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  tooth_number INTEGER NOT NULL CHECK (tooth_number IN
    (15,14,13,12,11,21,22,23,24,25,45,44,43,42,41,31,32,33,34,35)),
  arch TEXT NOT NULL CHECK (arch IN ('upper','lower')),
  material TEXT,
  finish TEXT,
  cut TEXT,
  stone_type TEXT,
  stone_grade TEXT,
  stone_size_mm REAL CHECK (stone_size_mm IS NULL OR stone_size_mm > 0),
  stone_quantity INTEGER CHECK (stone_quantity IS NULL OR stone_quantity BETWEEN 0 AND 200),
  stone_color TEXT,
  placement TEXT,
  pattern TEXT,
  setting_type TEXT,
  UNIQUE (design_id, tooth_number)
);

CREATE TABLE IF NOT EXISTS measurements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  design_tooth_id INTEGER NOT NULL REFERENCES design_teeth(id) ON DELETE CASCADE,
  width_mm REAL CHECK (width_mm IS NULL OR (width_mm > 0 AND width_mm < 30)),
  height_mm REAL CHECK (height_mm IS NULL OR (height_mm > 0 AND height_mm < 30)),
  unit TEXT NOT NULL DEFAULT 'mm' CHECK (unit = 'mm'),
  measurement_method TEXT NOT NULL CHECK (measurement_method IN ('guided_manual','calibrated_photo','unknown')),
  confidence_status TEXT NOT NULL CHECK (confidence_status IN ('customer_entered','calibrated_preliminary','unverified','jeweler_confirmed')),
  reference_scale REAL,
  image_reference INTEGER REFERENCES uploaded_assets(id) ON DELETE SET NULL,
  review_status TEXT NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending','manual_review','accepted','rejected')),
  measured_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS estimates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  design_id INTEGER NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  pricing_version TEXT NOT NULL,
  material_subtotal REAL,
  stone_subtotal REAL,
  labor_subtotal REAL,          -- NULL = pending jeweler quote, never silently 0
  custom_subtotal REAL,
  shipping REAL,
  rush REAL,
  estimated_total REAL,         -- NULL when any required component is unknown
  status TEXT NOT NULL CHECK (status IN ('complete_estimate','partial_estimate','quote_required')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS estimate_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  estimate_id INTEGER NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('material','stone','labor','custom','shipping','rush')),
  description TEXT NOT NULL,
  quantity REAL NOT NULL DEFAULT 1,
  unit_price REAL,              -- NULL = quote required
  subtotal REAL,
  approval_status TEXT NOT NULL CHECK (approval_status IN ('approved_price','unverified_price','quote_required'))
);

CREATE TABLE IF NOT EXISTS uploaded_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  design_id INTEGER NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('reference_photo','preview_image','production_sheet')),
  storage_reference TEXT NOT NULL,   -- server-generated random filename, never the customer's filename
  content_type TEXT NOT NULL CHECK (content_type IN ('image/jpeg','image/png','image/webp','application/pdf')),
  byte_size INTEGER NOT NULL CHECK (byte_size > 0 AND byte_size <= 10485760),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS review_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  design_id INTEGER NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  author_id INTEGER NOT NULL REFERENCES admin_users(id),
  note TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'internal' CHECK (visibility IN ('internal','customer')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS status_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  design_id INTEGER NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by TEXT NOT NULL,   -- 'customer' or admin username
  changed_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_design_teeth_design ON design_teeth(design_id);
CREATE INDEX IF NOT EXISTS idx_estimates_design ON estimates(design_id);
CREATE INDEX IF NOT EXISTS idx_status_history_design ON status_history(design_id);

INSERT OR IGNORE INTO schema_migrations(version) VALUES ('001_initial_schema');
