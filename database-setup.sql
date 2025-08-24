-- Mr. Sprinkle Ambassador Tracking Database Setup

CREATE DATABASE IF NOT EXISTS mr_sprinkle_db;
USE mr_sprinkle_db;

-- Ambassadors table
CREATE TABLE ambassadors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ambassador_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    total_referrals INT DEFAULT 0,
    paid_commission DECIMAL(10,2) DEFAULT 0.00,
    pending_commission DECIMAL(10,2) DEFAULT 0.00,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_referral_date TIMESTAMP NULL
);

-- Bookings table
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    booking_date DATE,
    base_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    final_price DECIMAL(10,2) NOT NULL,
    ambassador_code VARCHAR(50),
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ambassador_code) REFERENCES ambassadors(ambassador_code)
);

-- Ambassador referrals table
CREATE TABLE ambassador_referrals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    ambassador_code VARCHAR(50) NOT NULL,
    commission_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
    paid_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (ambassador_code) REFERENCES ambassadors(ambassador_code)
);

-- Ambassador visits tracking
CREATE TABLE ambassador_visits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ambassador_code VARCHAR(50) NOT NULL,
    page_visited VARCHAR(255),
    visit_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    FOREIGN KEY (ambassador_code) REFERENCES ambassadors(ambassador_code)
);

-- Indexes for performance
CREATE INDEX idx_ambassador_code ON bookings(ambassador_code);
CREATE INDEX idx_booking_date ON bookings(booking_date);
CREATE INDEX idx_referral_status ON ambassador_referrals(status);
CREATE INDEX idx_visit_time ON ambassador_visits(visit_time);

-- Sample ambassadors
INSERT INTO ambassadors (ambassador_code, name, email, phone) VALUES
('MIKE2024', 'Mike Johnson', 'mike@example.com', '555-0101'),
('SARAH2024', 'Sarah Davis', 'sarah@example.com', '555-0102'),
('ALEX2024', 'Alex Rodriguez', 'alex@example.com', '555-0103');

-- Stored procedure for commission calculation
DELIMITER //
CREATE PROCEDURE CalculateCommissions()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE booking_id INT;
    DECLARE ambassador_code VARCHAR(50);
    DECLARE final_price DECIMAL(10,2);
    DECLARE commission_amount DECIMAL(10,2);
    
    DECLARE booking_cursor CURSOR FOR 
        SELECT b.id, b.ambassador_code, b.final_price
        FROM bookings b
        WHERE b.status = 'completed' 
        AND b.ambassador_code IS NOT NULL
        AND NOT EXISTS (
            SELECT 1 FROM ambassador_referrals ar 
            WHERE ar.booking_id = b.id
        );
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN booking_cursor;
    
    read_loop: LOOP
        FETCH booking_cursor INTO booking_id, ambassador_code, final_price;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        SET commission_amount = final_price * 0.20;
        
        INSERT INTO ambassador_referrals (booking_id, ambassador_code, commission_amount, status)
        VALUES (booking_id, ambassador_code, commission_amount, 'pending');
        
        UPDATE ambassadors 
        SET pending_commission = pending_commission + commission_amount
        WHERE ambassador_code = ambassador_code;
        
    END LOOP;
    
    CLOSE booking_cursor;
END //
DELIMITER ;

-- Function to generate QR code URL
DELIMITER //
CREATE FUNCTION GetAmbassadorQRCode(code VARCHAR(50)) 
RETURNS VARCHAR(255)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE qr_url VARCHAR(255);
    SET qr_url = CONCAT('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://mrsprinklereno.com?ref=', code);
    RETURN qr_url;
END //
DELIMITER ;

-- View for ambassador dashboard
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
    a.last_referral_date,
    GetAmbassadorQRCode(a.ambassador_code) as qr_code_url
FROM ambassadors a
LEFT JOIN ambassador_referrals ar ON a.ambassador_code = ar.ambassador_code
LEFT JOIN ambassador_visits av ON a.ambassador_code = av.ambassador_code
GROUP BY a.id;

-- Trigger to update ambassador stats on new referral
DELIMITER //
CREATE TRIGGER update_ambassador_stats
AFTER INSERT ON ambassador_referrals
FOR EACH ROW
BEGIN
    UPDATE ambassadors 
    SET total_referrals = total_referrals + 1,
        pending_commission = pending_commission + NEW.commission_amount,
        last_referral_date = NOW()
    WHERE ambassador_code = NEW.ambassador_code;
END //
DELIMITER ;