<?php
// Minimal Form Handler for Existing Forms
function processAmbassadorBooking($formData) {
    // Database connection
    $pdo = new PDO("mysql:host=localhost;dbname=mr_sprinkle_db", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $ambassadorCode = $formData['ambassador_code'] ?? '';
    $customerName = $formData['customer_name'] ?? $formData['name'] ?? '';
    $customerEmail = $formData['customer_email'] ?? $formData['email'] ?? '';
    $customerPhone = $formData['customer_phone'] ?? $formData['phone'] ?? '';
    $serviceType = $formData['service_type'] ?? 'consultation';
    
    // Calculate pricing
    $basePrice = getServicePrice($serviceType);
    $discount = $ambassadorCode ? 0.10 : 0;
    $finalPrice = $basePrice * (1 - $discount);
    
    try {
        // Insert booking
        $stmt = $pdo->prepare("INSERT INTO bookings (customer_name, customer_email, customer_phone, service_type, base_price, discount_amount, final_price, ambassador_code, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())");
        $stmt->execute([$customerName, $customerEmail, $customerPhone, $serviceType, $basePrice, $basePrice * $discount, $finalPrice, $ambassadorCode]);
        
        $bookingId = $pdo->lastInsertId();
        
        // Process ambassador referral
        if ($ambassadorCode) {
            $commissionAmount = $finalPrice * 0.20;
            $stmt = $pdo->prepare("INSERT INTO ambassador_referrals (booking_id, ambassador_code, commission_amount, status, created_at) VALUES (?, ?, ?, 'pending', NOW())");
            $stmt->execute([$bookingId, $ambassadorCode, $commissionAmount]);
        }
        
        return ['success' => true, 'booking_id' => $bookingId];
    } catch(Exception $e) {
        return ['success' => false, 'message' => 'Booking failed'];
    }
}

function getServicePrice($serviceType) {
    $prices = [
        'consultation' => 50,
        'basic_grillz' => 200,
        'premium_grillz' => 500,
        'custom_design' => 800,
        'repair' => 100
    ];
    return $prices[$serviceType] ?? 200;
}

// Handle form submission
if ($_POST) {
    $result = processAmbassadorBooking($_POST);
    if (isset($_POST['ajax'])) {
        header('Content-Type: application/json');
        echo json_encode($result);
    } else {
        if ($result['success']) {
            header('Location: success.php?booking=' . $result['booking_id']);
        } else {
            header('Location: error.php');
        }
    }
}
?>