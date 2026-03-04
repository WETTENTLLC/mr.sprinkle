<?php
// Quick script to add Natalia Chacon as ambassador
header('Content-Type: application/json');

try {
    $pdo = new PDO("mysql:host=localhost;dbname=mr_sprinkle_db", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Generate code for Natalia (same logic as the form)
    $name = "Natalia";
    $code = preg_replace('/\s+/', '', strtoupper($name));
    $code = substr($code, 0, 8) . str_pad(mt_rand(0, 99), 2, '0', STR_PAD_LEFT);
    
    // Her info
    $email = "nataliachacon0903@gmail.com";
    $phone = "775-250-9356";
    
    // Check if already exists
    $checkStmt = $pdo->prepare("SELECT COUNT(*) FROM ambassadors WHERE ambassador_code = ?");
    $checkStmt->execute([$code]);
    
    if ($checkStmt->fetchColumn() > 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Ambassador code already exists: ' . $code
        ]);
        exit;
    }
    
    // Add to database
    $stmt = $pdo->prepare("INSERT INTO ambassadors (ambassador_code, name, email, phone, status) VALUES (?, ?, ?, ?, 'active')");
    $stmt->execute([$code, $name, $email, $phone]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Natalia added successfully!',
        'ambassadorCode' => $code,
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'portalUrl' => 'https://mrsprinklereno.com/ambassador-portal.html',
        'instructions' => 'Natalia can now log in with code: ' . $code
    ]);
    
} catch(Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
