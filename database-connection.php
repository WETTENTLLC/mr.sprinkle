<?php

function mrSprinkleDatabase(): PDO
{
    $host = getenv('MR_SPRINKLE_DB_HOST') ?: 'localhost';
    $database = getenv('MR_SPRINKLE_DB_NAME') ?: 'mr_sprinkle_db';
    $username = getenv('MR_SPRINKLE_DB_USER');
    $password = getenv('MR_SPRINKLE_DB_PASSWORD');

    if (!$username || !$password || strtolower($username) === 'root') {
        throw new RuntimeException('Configure a non-root MR_SPRINKLE_DB_USER and MR_SPRINKLE_DB_PASSWORD.');
    }

    $pdo = new PDO(
        "mysql:host={$host};dbname={$database};charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );

    return $pdo;
}

function mrSprinkleRequireAdminApiToken(): void
{
    $adminToken = getenv('MR_SPRINKLE_ADMIN_API_TOKEN');
    $authorization = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!$adminToken || !preg_match('/^Bearer\s+(.+)$/i', $authorization, $matches)
        || !hash_equals($adminToken, $matches[1])) {
        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Forbidden']);
        exit;
    }
}
