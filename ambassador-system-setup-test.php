<?php
header('Content-Type: text/html; charset=UTF-8');
require_once __DIR__ . '/database-connection.php';
mrSprinkleRequireAdminApiToken();

try {
    $pdo = mrSprinkleDatabase();
    $ambassadorCount = (int) $pdo->query('SELECT COUNT(*) FROM ambassadors')->fetchColumn();
    $databaseReady = true;
} catch (Exception $e) {
    error_log('Ambassador diagnostics failed: ' . $e->getMessage());
    http_response_code(503);
    $databaseReady = false;
    $ambassadorCount = null;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ambassador System Diagnostics</title>
</head>
<body>
    <main>
        <h1>Ambassador System Diagnostics</h1>
        <?php if ($databaseReady): ?>
            <p>Database connection: ready</p>
            <p>Ambassador records: <?= htmlspecialchars((string) $ambassadorCount, ENT_QUOTES, 'UTF-8') ?></p>
        <?php else: ?>
            <p>The database diagnostic could not complete. Check the server error log and environment configuration.</p>
        <?php endif; ?>
        <p>Use the authenticated business admin portal to manage ambassador records.</p>
    </main>
</body>
</html>
