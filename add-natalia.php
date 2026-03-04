<?php
// Quick script to add Natalia Chacon as ambassador
header('Content-Type: application/json');

try {
    $pdo = new PDO("mysql:host=localhost;dbname=mr_sprinkle_db", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Natalia's information
    $name = "Natalia Chacon";
    $code = "NATALIA09";  // Her specific ambassador code
    
    // Her info
    $email = "nataliachacon0904@gmail.com";  // Correct email
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
