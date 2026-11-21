-- Template only. Use the authenticated admin portal for ambassador changes.
-- Do not keep real ambassador contact details or access codes in SQL files.
INSERT INTO ambassadors (ambassador_code, name, email, phone, status, created_at)
VALUES ('<ambassador-code>', '<name>', '<email>', '<phone>', 'active', NOW());
