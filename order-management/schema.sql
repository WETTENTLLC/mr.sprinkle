-- Mr. Sprinkle Order Management v1
-- Additive schema. Existing ambassador tables are intentionally untouched.
-- Apply using the hosting provider's MySQL admin tool after backup.

CREATE TABLE IF NOT EXISTS ms_customers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_code VARCHAR(32) NOT NULL UNIQUE,
  full_name VARCHAR(160) NOT NULL,
  email VARCHAR(254) NULL,
  phone VARCHAR(32) NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_ms_customers_email (email),
  INDEX idx_ms_customers_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ms_orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(32) NOT NULL UNIQUE,
  customer_id BIGINT UNSIGNED NOT NULL,
  order_type ENUM('grillz','gold_press_on_nails','custom_jewelry','tooth_gems','mobile_mold','wett_accessories','other') NOT NULL DEFAULT 'grillz',
  status ENUM('new','quote_pending','awaiting_deposit','materials_pending','mold_pending','in_production','quality_control','ready_for_pickup','shipped','completed','cancelled') NOT NULL DEFAULT 'new',
  priority ENUM('standard','rush') NOT NULL DEFAULT 'standard',
  product_subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  customer_shipping DECIMAL(10,2) NOT NULL DEFAULT 0,
  rush_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  deposit_required DECIMAL(12,2) NOT NULL DEFAULT 0,
  deposit_paid DECIMAL(12,2) NOT NULL DEFAULT 0,
  balance_paid DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  estimated_completion DATE NULL,
  actual_completion DATETIME NULL,
  customer_location ENUM('Envy Kutz','mobile','shipping','other') NULL,
  shipping_carrier VARCHAR(40) NULL,
  tracking_number VARCHAR(120) NULL,
  customer_notes TEXT NULL,
  internal_notes TEXT NULL,
  source VARCHAR(40) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ms_orders_customer FOREIGN KEY (customer_id) REFERENCES ms_customers(id),
  INDEX idx_ms_orders_status (status),
  INDEX idx_ms_orders_priority (priority),
  INDEX idx_ms_orders_created (created_at),
  INDEX idx_ms_orders_due (estimated_completion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ms_order_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  item_type VARCHAR(50) NOT NULL,
  description VARCHAR(255) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  line_total DECIMAL(12,2) NOT NULL DEFAULT 0,
  configuration_json JSON NULL,
  custom_quote_required TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT fk_ms_items_order FOREIGN KEY (order_id) REFERENCES ms_orders(id) ON DELETE CASCADE,
  INDEX idx_ms_items_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ms_order_teeth (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_item_id BIGINT UNSIGNED NOT NULL,
  jaw ENUM('upper','lower') NOT NULL,
  tooth_position TINYINT UNSIGNED NOT NULL,
  selected TINYINT(1) NOT NULL DEFAULT 1,
  finish VARCHAR(60) NULL,
  design_notes VARCHAR(255) NULL,
  CONSTRAINT fk_ms_teeth_item FOREIGN KEY (order_item_id) REFERENCES ms_order_items(id) ON DELETE CASCADE,
  UNIQUE KEY uq_ms_tooth_selection (order_item_id, jaw, tooth_position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ms_payments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  payment_type ENUM('deposit','balance','refund','adjustment') NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  method VARCHAR(40) NULL,
  reference VARCHAR(120) NULL,
  paid_at DATETIME NOT NULL,
  notes VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ms_payments_order FOREIGN KEY (order_id) REFERENCES ms_orders(id),
  INDEX idx_ms_payments_order (order_id),
  INDEX idx_ms_payments_date (paid_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ms_supplier_invoices (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  supplier_name VARCHAR(160) NOT NULL,
  invoice_number VARCHAR(80) NOT NULL,
  invoice_date DATE NULL,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  payments_credits DECIMAL(12,2) NOT NULL DEFAULT 0,
  invoice_balance_due DECIMAL(12,2) NOT NULL DEFAULT 0,
  account_total_balance DECIMAL(12,2) NULL,
  payment_method VARCHAR(40) NULL,
  source_email VARCHAR(254) NULL,
  attachment_name VARCHAR(255) NULL,
  status ENUM('reviewed','unpaid','partially_paid','paid','void') NOT NULL DEFAULT 'reviewed',
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_ms_supplier_invoice (supplier_name, invoice_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ms_supplier_invoice_lines (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  invoice_id BIGINT UNSIGNED NOT NULL,
  order_reference VARCHAR(80) NULL,
  item_code VARCHAR(80) NULL,
  description VARCHAR(255) NOT NULL,
  quantity DECIMAL(12,3) NOT NULL DEFAULT 1,
  unit VARCHAR(24) NULL,
  unit_cost DECIMAL(12,4) NOT NULL DEFAULT 0,
  line_total DECIMAL(12,2) NOT NULL DEFAULT 0,
  cost_category ENUM('metal','labor','stone','supplier_shipping','other') NOT NULL DEFAULT 'other',
  CONSTRAINT fk_ms_invoice_lines_invoice FOREIGN KEY (invoice_id) REFERENCES ms_supplier_invoices(id) ON DELETE CASCADE,
  INDEX idx_ms_invoice_lines_category (cost_category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ms_order_supplier_costs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  invoice_line_id BIGINT UNSIGNED NULL,
  cost_category ENUM('metal','labor','stone','supplier_shipping','other') NOT NULL,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ms_costs_order FOREIGN KEY (order_id) REFERENCES ms_orders(id),
  CONSTRAINT fk_ms_costs_invoice_line FOREIGN KEY (invoice_line_id) REFERENCES ms_supplier_invoice_lines(id) ON DELETE SET NULL,
  INDEX idx_ms_costs_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ms_order_events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  event_type VARCHAR(60) NOT NULL,
  old_value VARCHAR(255) NULL,
  new_value VARCHAR(255) NULL,
  note TEXT NULL,
  actor VARCHAR(120) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ms_events_order FOREIGN KEY (order_id) REFERENCES ms_orders(id) ON DELETE CASCADE,
  INDEX idx_ms_events_order_date (order_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed one supplier invoice imported from E Gold USA PDF invoice 121142.
-- Two work groups are retained as separate invoice lines; labor, metal, CZ, diamond and freight remain itemized.
INSERT INTO ms_supplier_invoices
(supplier_name, invoice_number, invoice_date, subtotal, payments_credits, invoice_balance_due, account_total_balance, payment_method, source_email, attachment_name, status, notes)
VALUES
('E Gold USA','121142','2026-11-18',2146.94,2000.00,146.94,769.33,'Zelle','egoldusa@gmail.com','Inv_121142_from_E_Gold_USA_22044.pdf','partially_paid','PDF invoice reviewed, page 1. Account total balance is separate from this invoice balance.')
ON DUPLICATE KEY UPDATE
invoice_date=VALUES(invoice_date), subtotal=VALUES(subtotal), payments_credits=VALUES(payments_credits),
invoice_balance_due=VALUES(invoice_balance_due), account_total_balance=VALUES(account_total_balance),
payment_method=VALUES(payment_method), source_email=VALUES(source_email), attachment_name=VALUES(attachment_name),
status=VALUES(status), notes=VALUES(notes);

SET @ms_invoice_id = (SELECT id FROM ms_supplier_invoices WHERE supplier_name='E Gold USA' AND invoice_number='121142' LIMIT 1);
DELETE FROM ms_supplier_invoice_lines WHERE invoice_id=@ms_invoice_id;

INSERT INTO ms_supplier_invoice_lines
(invoice_id,order_reference,item_code,description,quantity,unit,unit_cost,line_total,cost_category)
VALUES
(@ms_invoice_id,'T-14Y','14DP','.583 Dental Gold Casting',3.6,'gr',94.53,340.31,'metal'),
(@ms_invoice_id,'T-14Y','CADSin','Labor For Single or separate fee per tooth',2,'ea',60.00,120.00,'labor'),
(@ms_invoice_id,'T-14Y','CADCO','Labor For Cut out Design per tooth',1,'ea',10.00,10.00,'labor'),
(@ms_invoice_id,'T-14Y','CCZ02','Color CZ 2PT',35,'ea',3.00,105.00,'stone'),
(@ms_invoice_id,'T-14Y','D01','.01CT Diamond',49,'ea',6.00,294.00,'stone'),
(@ms_invoice_id,'B-14Y','14DP','.583 Dental Gold Casting',6.1,'gr',94.53,576.63,'metal'),
(@ms_invoice_id,'B-14Y','CADSld','Labor For Solid Fee for 3 or more per tooth',6,'ea',50.00,300.00,'labor'),
(@ms_invoice_id,'B-14Y','CADCO','Labor For Cut out Design per tooth',2,'ea',10.00,20.00,'labor'),
(@ms_invoice_id,'B-14Y','CCZ02','Color CZ 2PT',38,'ea',3.00,114.00,'stone'),
(@ms_invoice_id,'B-14Y','D01','.01CT Diamond',40,'ea',6.00,240.00,'stone'),
(@ms_invoice_id,NULL,'FESE','FedEx Envelope Standard',1,'ea',27.00,27.00,'supplier_shipping');
