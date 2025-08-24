<?php
// Tiered Ambassador System - Updated Commission Structure
function processAmbassadorBooking($formData) {
    $pdo = new PDO("mysql:host=localhost;dbname=mr_sprinkle_db", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $ambassadorCode = $formData['ambassador_code'] ?? '';
    $customerName = $formData['customer_name'] ?? $formData['name'] ?? '';
    $customerEmail = $formData['customer_email'] ?? $formData['email'] ?? '';
    $customerPhone = $formData['customer_phone'] ?? $formData['phone'] ?? '';
    $serviceType = $formData['service_type'] ?? 'consultation';
    
    // Calculate pricing with 5% customer discount
    $basePrice = getServicePrice($serviceType);
    $discount = $ambassadorCode ? 0.05 : 0;
    $finalPrice = $basePrice * (1 - $discount);
    
    try {
        $pdo->beginTransaction();
        
        // Insert booking
        $stmt = $pdo->prepare("INSERT INTO bookings (customer_name, customer_email, customer_phone, service_type, base_price, discount_amount, final_price, ambassador_code, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())");
        $stmt->execute([$customerName, $customerEmail, $customerPhone, $serviceType, $basePrice, $basePrice * $discount, $finalPrice, $ambassadorCode]);
        
        $bookingId = $pdo->lastInsertId();
        
        // Process tiered ambassador commission
        if ($ambassadorCode) {
            $commissionRate = getTieredCommissionRate($ambassadorCode, $pdo);
            $commissionAmount = $basePrice * $commissionRate; // Commission on full price
            
            $stmt = $pdo->prepare("INSERT INTO ambassador_referrals (booking_id, ambassador_code, commission_amount, commission_rate, status, created_at) VALUES (?, ?, ?, ?, 'pending', NOW())");
            $stmt->execute([$bookingId, $ambassadorCode, $commissionAmount, $commissionRate]);
            
            // Check for bonus eligibility
            checkBonusEligibility($ambassadorCode, $pdo);
        }
        
        $pdo->commit();
        return ['success' => true, 'booking_id' => $bookingId, 'commission_rate' => $commissionRate ?? 0];
    } catch(Exception $e) {
        $pdo->rollBack();
        return ['success' => false, 'message' => 'Booking failed'];
    }
}

function getTieredCommissionRate($ambassadorCode, $pdo) {
    // Get ambassador's current month referral count
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as referral_count 
        FROM ambassador_referrals ar
        JOIN bookings b ON ar.booking_id = b.id
        WHERE ar.ambassador_code = ? 
        AND MONTH(b.created_at) = MONTH(NOW()) 
        AND YEAR(b.created_at) = YEAR(NOW())
        AND b.status != 'cancelled'
    ");
    $stmt->execute([$ambassadorCode]);
    $count = $stmt->fetch(PDO::FETCH_ASSOC)['referral_count'];
    
    // Tiered commission rates
    if ($count >= 10) return 0.20; // 20% for 11+ referrals
    if ($count >= 5) return 0.15;  // 15% for 6-10 referrals
    return 0.10; // 10% for 1-5 referrals
}

function checkBonusEligibility($ambassadorCode, $pdo) {
    // Check if ambassador hit 5th referral milestone
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as referral_count 
        FROM ambassador_referrals ar
        JOIN bookings b ON ar.booking_id = b.id
        WHERE ar.ambassador_code = ? 
        AND MONTH(b.created_at) = MONTH(NOW()) 
        AND YEAR(b.created_at) = YEAR(NOW())
        AND b.status != 'cancelled'
    ");
    $stmt->execute([$ambassadorCode]);
    $count = $stmt->fetch(PDO::FETCH_ASSOC)['referral_count'];
    
    // Award $10 bonus for every 5th referral
    if ($count % 5 == 0 && $count > 0) {
        $stmt = $pdo->prepare("INSERT INTO ambassador_bonuses (ambassador_code, bonus_amount, bonus_type, created_at) VALUES (?, 10.00, 'milestone', NOW())");
        $stmt->execute([$ambassadorCode]);
    }
}

function getServicePrice($serviceType) {
    $prices = [
        'consultation' => 50,
        'repair' => 100,
        'single_tooth_iced' => 180,
        'three_teeth_iced' => 540,
        'eight_teeth_iced' => 1440,
        'gap_filler_clips' => 300,
        'custom_design' => 0,
        'basic_grillz' => 200,
        'premium_grillz' => 500
    ];
    return $prices[$serviceType] ?? 0;
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