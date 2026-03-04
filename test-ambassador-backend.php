<?php
// Test endpoint to verify ambassador backend
header('Content-Type: application/json');

try {
    $pdo = new PDO("mysql:host=localhost;dbname=mr_sprinkle_db", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Get code from query parameter
    $code = $_GET['code'] ?? 'NATALIA09';
    
    echo json_encode([
        'test' => 'Ambassador Backend Test',
        'searching_for_code' => $code,
        'test_url' => '/ambassador-backend.php?endpoint=ambassador-stats&code=' . $code
    ]);
    
    // Test database connection
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM ambassadors");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode(['database' => 'Connected', 'total_ambassadors' => $result['total']]);
    
    // Find specific ambassador
    $stmt = $pdo->prepare("SELECT * FROM ambassadors WHERE ambassador_code = ?");
    $stmt->execute([$code]);
    $ambassador = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($ambassador) {
        echo json_encode(['found' => true, 'ambassador' => $ambassador]);
    } else {
        // List all ambassadors
        $stmt = $pdo->query("SELECT ambassador_code, name, email FROM ambassadors");
        $all = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['found' => false, 'message' => 'Code not found', 'all_ambassadors' => $all]);
    }
    
} catch(Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
