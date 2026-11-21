<?php
header('Content-Type: application/json');
require_once __DIR__ . '/database-connection.php';
mrSprinkleRequireAdminApiToken();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'POST is required.']);
    exit;
}

$code = isset($_POST['code']) && is_string($_POST['code']) ? trim($_POST['code']) : '';
$name = isset($_POST['name']) && is_string($_POST['name']) ? trim($_POST['name']) : '';
$email = isset($_POST['email']) && is_string($_POST['email']) ? trim($_POST['email']) : '';
$phone = isset($_POST['phone']) && is_string($_POST['phone']) ? trim($_POST['phone']) : '';
if ($code === '' || $name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'A code, name, and valid email are required.']);
    exit;
}

try {
    $pdo = mrSprinkleDatabase();

    $checkStmt = $pdo->prepare("SELECT COUNT(*) FROM ambassadors WHERE ambassador_code = ?");
    $checkStmt->execute([$code]);
    
    if ($checkStmt->fetchColumn() > 0) {
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'message' => 'Ambassador code already exists.'
        ]);
        exit;
    }
    
    $stmt = $pdo->prepare("INSERT INTO ambassadors (ambassador_code, name, email, phone, status) VALUES (?, ?, ?, ?, 'active')");
    $stmt->execute([$code, $name, $email, $phone]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Ambassador created.'
    ]);
    
} catch(Exception $e) {
    error_log('Ambassador creation failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Unable to create ambassador.'
    ]);
}
?>
