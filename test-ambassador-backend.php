<?php
header('Content-Type: application/json');
require_once __DIR__ . '/database-connection.php';
mrSprinkleRequireAdminApiToken();

try {
    $pdo = mrSprinkleDatabase();

    $code = isset($_GET['code']) && is_string($_GET['code']) ? trim($_GET['code']) : '';
    $total = (int) $pdo->query("SELECT COUNT(*) FROM ambassadors")->fetchColumn();
    $found = false;
    if ($code !== '') {
        $stmt = $pdo->prepare("SELECT 1 FROM ambassadors WHERE ambassador_code = ? LIMIT 1");
        $stmt->execute([$code]);
        $found = (bool) $stmt->fetchColumn();
    }

    echo json_encode([
        'success' => true,
        'database' => 'Connected',
        'total_ambassadors' => $total,
        'code_found' => $found
    ]);
} catch(Exception $e) {
    error_log('Ambassador backend test failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'The diagnostic request failed.']);
}
?>
