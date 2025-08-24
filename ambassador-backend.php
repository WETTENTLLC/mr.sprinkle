<?php
// Ambassador Backend - Mr. Sprinkle
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

class AmbassadorBackend {
    private $db;
    
    public function __construct() {
        $this->connectDB();
    }
    
    private function connectDB() {
        $host = 'localhost';
        $dbname = 'mr_sprinkle_db';
        $username = 'root';
        $password = '';
        
        try {
            $this->db = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
            $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $e) {
            die(json_encode(['success' => false, 'message' => 'Database connection failed']));
        }
    }
    
    public function trackVisit() {
        $input = json_decode(file_get_contents('php://input'), true);
        $ambassadorCode = $input['ambassador_code'] ?? '';
        $page = $input['page'] ?? '';
        
        if (!$ambassadorCode) return;
        
        $stmt = $this->db->prepare("INSERT INTO ambassador_visits (ambassador_code, page_visited, visit_time) VALUES (?, ?, NOW())");
        $stmt->execute([$ambassadorCode, $page]);
    }
    
    public function processBooking() {
        $customerName = $_POST['customer_name'] ?? '';
        $customerEmail = $_POST['customer_email'] ?? '';
        $customerPhone = $_POST['customer_phone'] ?? '';
        $serviceType = $_POST['service_type'] ?? '';
        $ambassadorCode = $_POST['ambassador_code'] ?? '';
        $bookingDate = $_POST['booking_date'] ?? '';
        
        if (!$customerName || !$customerEmail || !$customerPhone) {
            echo json_encode(['success' => false, 'message' => 'Required fields missing']);
            return;
        }
        
        try {
            $this->db->beginTransaction();
            
            // Calculate pricing
            $basePrice = $this->getServicePrice($serviceType);
            $discount = $ambassadorCode ? 0.10 : 0;
            $finalPrice = $basePrice * (1 - $discount);
            
            // Insert booking
            $stmt = $this->db->prepare("
                INSERT INTO bookings (customer_name, customer_email, customer_phone, service_type, 
                                    booking_date, base_price, discount_amount, final_price, ambassador_code, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ");
            $stmt->execute([
                $customerName, $customerEmail, $customerPhone, $serviceType,
                $bookingDate, $basePrice, $basePrice * $discount, $finalPrice, $ambassadorCode
            ]);
            
            $bookingId = $this->db->lastInsertId();
            
            // Process ambassador referral
            if ($ambassadorCode) {
                $this->processReferral($bookingId, $ambassadorCode, $finalPrice);
            }
            
            $this->db->commit();
            
            // Send notifications
            $this->sendBookingConfirmation($customerEmail, $customerName, $bookingId);
            $this->sendBusinessNotification($bookingId);
            
            echo json_encode([
                'success' => true, 
                'booking_id' => $bookingId,
                'final_price' => $finalPrice,
                'discount_applied' => $discount > 0
            ]);
            
        } catch(Exception $e) {
            $this->db->rollBack();
            echo json_encode(['success' => false, 'message' => 'Booking failed']);
        }
    }
    
    private function processReferral($bookingId, $ambassadorCode, $finalPrice) {
        $commissionRate = 0.20;
        $commissionAmount = $finalPrice * $commissionRate;
        
        $stmt = $this->db->prepare("
            INSERT INTO ambassador_referrals (booking_id, ambassador_code, commission_amount, status, created_at) 
            VALUES (?, ?, ?, 'pending', NOW())
        ");
        $stmt->execute([$bookingId, $ambassadorCode, $commissionAmount]);
        
        // Update ambassador stats
        $stmt = $this->db->prepare("
            UPDATE ambassadors 
            SET total_referrals = total_referrals + 1, 
                pending_commission = pending_commission + ?,
                last_referral_date = NOW()
            WHERE ambassador_code = ?
        ");
        $stmt->execute([$commissionAmount, $ambassadorCode]);
    }
    
    private function getServicePrice($serviceType) {
        $prices = [
            'consultation' => 50,
            'basic_grillz' => 200,
            'premium_grillz' => 500,
            'custom_design' => 800,
            'repair' => 100
        ];
        return $prices[$serviceType] ?? 200;
    }
    
    private function sendBookingConfirmation($email, $name, $bookingId) {
        $subject = "Mr. Sprinkle - Booking Confirmation #$bookingId";
        $message = "
            <h2>Booking Confirmed!</h2>
            <p>Hi $name,</p>
            <p>Your booking has been confirmed. We'll contact you within 24 hours to schedule your appointment.</p>
            <p><strong>Booking ID:</strong> $bookingId</p>
            <p>Questions? Call us at (530) 214-0676</p>
            <p>Best regards,<br>Mr. Sprinkle Team</p>
        ";
        
        $headers = "MIME-Version: 1.0\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8\r\n";
        $headers .= "From: info@mrsprinklereno.com\r\n";
        
        mail($email, $subject, $message, $headers);
    }
    
    private function sendBusinessNotification($bookingId) {
        $stmt = $this->db->prepare("SELECT * FROM bookings WHERE id = ?");
        $stmt->execute([$bookingId]);
        $booking = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $subject = "New Booking - #$bookingId";
        $message = "
            <h2>New Booking Received</h2>
            <p><strong>Customer:</strong> {$booking['customer_name']}</p>
            <p><strong>Email:</strong> {$booking['customer_email']}</p>
            <p><strong>Phone:</strong> {$booking['customer_phone']}</p>
            <p><strong>Service:</strong> {$booking['service_type']}</p>
            <p><strong>Price:</strong> $" . number_format($booking['final_price'], 2) . "</p>
            " . ($booking['ambassador_code'] ? "<p><strong>Referred by:</strong> {$booking['ambassador_code']}</p>" : "") . "
        ";
        
        $headers = "MIME-Version: 1.0\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8\r\n";
        $headers .= "From: system@mrsprinklereno.com\r\n";
        
        mail('info@mrsprinklereno.com', $subject, $message, $headers);
    }
    
    public function getAmbassadorStats() {
        $ambassadorCode = $_GET['code'] ?? '';
        if (!$ambassadorCode) {
            echo json_encode(['success' => false, 'message' => 'Ambassador code required']);
            return;
        }
        
        $stmt = $this->db->prepare("
            SELECT a.*, 
                   COUNT(ar.id) as total_referrals,
                   SUM(CASE WHEN ar.status = 'paid' THEN ar.commission_amount ELSE 0 END) as paid_commission,
                   SUM(CASE WHEN ar.status = 'pending' THEN ar.commission_amount ELSE 0 END) as pending_commission
            FROM ambassadors a
            LEFT JOIN ambassador_referrals ar ON a.ambassador_code = ar.ambassador_code
            WHERE a.ambassador_code = ?
            GROUP BY a.id
        ");
        $stmt->execute([$ambassadorCode]);
        $stats = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($stats) {
            echo json_encode(['success' => true, 'data' => $stats]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Ambassador not found']);
        }
    }
}

// Route requests
$backend = new AmbassadorBackend();
$request = $_SERVER['REQUEST_URI'];

if (strpos($request, 'track-visit') !== false) {
    $backend->trackVisit();
} elseif (strpos($request, 'process-booking') !== false) {
    $backend->processBooking();
} elseif (strpos($request, 'ambassador-stats') !== false) {
    $backend->getAmbassadorStats();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid endpoint']);
}
?>