-- Add Natalia Chacon as Ambassador
-- Execute this SQL in your MySQL database (mr_sprinkle_db)

INSERT INTO ambassadors (ambassador_code, name, email, phone, status, created_at) 
VALUES ('NATALIA09', 'Natalia', 'nataliachacon0904@gmail.com', '775-250-9356', 'active', NOW());

-- After running this, Natalia can log in at:
-- https://mrsprinklereno.com/ambassador-portal.html
-- Her ambassador code is: NATALIA09

-- Her referral link will be:
-- https://mrsprinklereno.com/mold-form.html?ref=NATALIA09
