-- Updated Database Schema for Tiered Commission System

-- Add commission_rate column to ambassador_referrals table
ALTER TABLE ambassador_referrals ADD COLUMN commission_rate DECIMAL(4,3) DEFAULT 0.100;

-- Create ambassador_bonuses table for milestone rewards
CREATE TABLE ambassador_bonuses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ambassador_code VARCHAR(50) NOT NULL,
    bonus_amount DECIMAL(10,2) NOT NULL,
    bonus_type ENUM('milestone', 'performance', 'special') DEFAULT 'milestone',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_date TIMESTAMP NULL,
    status ENUM('pending', 'paid') DEFAULT 'pending',
    FOREIGN KEY (ambassador_code) REFERENCES ambassadors(ambassador_code)
);

-- Update ambassador dashboard view to include bonuses
DROP VIEW IF EXISTS ambassador_dashboard;
CREATE VIEW ambassador_dashboard AS
SELECT 
    a.ambassador_code,
    a.name,
    a.email,
    a.total_referrals,
    a.paid_commission,
    a.pending_commission,
    (a.paid_commission + a.pending_commission) as total_commission,
    COUNT(DISTINCT ar.id) as completed_referrals,
    COUNT(DISTINCT av.id) as total_visits,
    COALESCE(SUM(ab.bonus_amount), 0) as total_bonuses,
    a.last_referral_date,
    GetAmbassadorQRCode(a.ambassador_code) as qr_code_url,
    -- Current month stats
    (SELECT COUNT(*) FROM ambassador_referrals ar2 
     JOIN bookings b2 ON ar2.booking_id = b2.id 
     WHERE ar2.ambassador_code = a.ambassador_code 
     AND MONTH(b2.created_at) = MONTH(NOW()) 
     AND YEAR(b2.created_at) = YEAR(NOW())) as current_month_referrals
FROM ambassadors a
LEFT JOIN ambassador_referrals ar ON a.ambassador_code = ar.ambassador_code
LEFT JOIN ambassador_visits av ON a.ambassador_code = av.ambassador_code
LEFT JOIN ambassador_bonuses ab ON a.ambassador_code = ab.ambassador_code
GROUP BY a.id;

-- Function to get current commission tier
DELIMITER //
CREATE FUNCTION GetCommissionTier(referral_count INT) 
RETURNS VARCHAR(20)
READS SQL DATA
DETERMINISTIC
BEGIN
    IF referral_count >= 11 THEN
        RETURN 'Gold (20%)';
    ELSEIF referral_count >= 6 THEN
        RETURN 'Silver (15%)';
    ELSE
        RETURN 'Bronze (10%)';
    END IF;
END //
DELIMITER ;

-- Update sample data with new structure
UPDATE ambassador_referrals SET commission_rate = 0.100 WHERE commission_rate IS NULL;